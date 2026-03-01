import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { generateSignedReadUrl, deleteObject } from "@/lib/gcs"
import { decrementUsedBytes } from "@/lib/supabase/quotas"
import { createNotification } from "@/lib/supabase/notifications"
import type { AlbumCategory, AlbumWithMemberCount, AlbumSearchResult, AlbumMemberWithProfile, UserAlbumRole } from "@/lib/album-types"

export type { AlbumCategory, AlbumWithMemberCount, AlbumSearchResult, AlbumMemberWithProfile, UserAlbumRole } from "@/lib/album-types"
export { getSpineColor } from "@/lib/album-types"

/** join_code を除外したカラム一覧（セキュリティ: 非メンバーにコードを返さない） */
const ALBUM_COLUMNS =
  "id, owner_id, name, category, year, location, description, visibility, tsunagu_threshold, created_at, updated_at"

/** ログインユーザーが参加中のアルバム一覧を取得（年昇順） */
export async function getMyAlbums(userId: string): Promise<AlbumWithMemberCount[]> {
  const supabase = await createSupabaseServerClient()

  // ユーザーが active メンバーであるアルバムIDを取得
  const { data: memberships, error: memberError } = await supabase
    .from("album_members")
    .select("album_id")
    .eq("user_id", userId)
    .eq("membership_status", "active")

  if (memberError) throw memberError
  if (!memberships || memberships.length === 0) return []

  const albumIds = memberships.map((m) => m.album_id)

  // アルバム情報を取得（join_code を除外）
  const { data: albums, error: albumError } = await supabase
    .from("albums")
    .select(ALBUM_COLUMNS)
    .in("id", albumIds)
    .order("year", { ascending: true, nullsFirst: true })

  if (albumError) throw albumError
  if (!albums) return []

  // 各アルバムのメンバー数を取得
  const counts = await Promise.all(
    albums.map(async (album) => {
      const { count, error } = await supabase
        .from("album_members")
        .select("*", { count: "exact", head: true })
        .eq("album_id", album.id)
        .eq("membership_status", "active")
      if (error) throw error
      return { albumId: album.id as string, count: count ?? 0 }
    })
  )

  const countMap = new Map(counts.map((c) => [c.albumId, c.count]))

  return albums.map((album) => ({
    ...(album as Omit<AlbumWithMemberCount, "member_count">),
    member_count: countMap.get(album.id as string) ?? 0,
  }))
}

/** 公開アルバムを条件検索（自分が未参加のもの） */
export async function searchPublicAlbums(
  userId: string,
  filters: { query: string; category?: AlbumCategory; year?: number }
): Promise<AlbumSearchResult[]> {
  if (!filters.query.trim()) return []

  const supabase = await createSupabaseServerClient()

  // ユーザーが既に参加中のアルバムIDを取得
  const { data: memberships } = await supabase
    .from("album_members")
    .select("album_id")
    .eq("user_id", userId)
    .in("membership_status", ["active", "pending"])

  const joinedIds = (memberships ?? []).map((m) => m.album_id)

  // 公開アルバムを検索（join_code を除外）
  let albumQuery = supabase
    .from("albums")
    .select(ALBUM_COLUMNS)
    .eq("visibility", "public")
    .ilike("name", `%${filters.query}%`)
    .order("year", { ascending: false })
    .limit(20)

  if (filters.category) {
    albumQuery = albumQuery.eq("category", filters.category)
  }
  if (filters.year) {
    albumQuery = albumQuery.eq("year", filters.year)
  }
  if (joinedIds.length > 0) {
    albumQuery = albumQuery.not("id", "in", `(${joinedIds.join(",")})`)
  }

  const { data: albums, error } = await albumQuery

  if (error) throw error
  if (!albums || albums.length === 0) return []

  // メンバー数とオーナー名を並行取得
  const ownerIds = [...new Set(albums.map((a) => a.owner_id as string))]

  const [counts, profilesResult] = await Promise.all([
    Promise.all(
      albums.map(async (album) => {
        const { count, error: countError } = await supabase
          .from("album_members")
          .select("*", { count: "exact", head: true })
          .eq("album_id", album.id)
          .eq("membership_status", "active")
        if (countError) throw countError
        return { albumId: album.id as string, count: count ?? 0 }
      })
    ),
    supabaseAdmin
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds),
  ])

  const countMap = new Map(counts.map((c) => [c.albumId, c.count]))
  const ownerMap = new Map(
    (profilesResult.data ?? []).map((p) => [p.id as string, p.display_name as string])
  )

  return albums.map((album) => ({
    ...(album as Omit<AlbumSearchResult, "member_count" | "owner_name">),
    member_count: countMap.get(album.id as string) ?? 0,
    owner_name: ownerMap.get(album.owner_id as string) ?? "ユーザー",
  }))
}

/** アルバムを新規作成し、作成者を owner として追加 */
export async function createAlbum(input: {
  userId: string
  name: string
  category?: AlbumCategory
  year?: number
  location?: string
}): Promise<{ album: AlbumWithMemberCount; joinCode: string }> {
  const supabase = await createSupabaseServerClient()

  // アルバム作成（RLS: owner_id = auth.uid()）
  // join_code はDBのデフォルトで自動生成される。作成者には返す
  const { data: row, error: albumError } = await supabase
    .from("albums")
    .insert({
      owner_id: input.userId,
      name: input.name,
      category: input.category ?? "school",
      year: input.year ?? null,
      location: input.location ?? null,
      visibility: "public",
    })
    .select(`${ALBUM_COLUMNS}, join_code`)
    .single()

  if (albumError) throw albumError

  // 作成者を owner メンバーとして追加（RLS: owner_id = auth.uid() で通る）
  const { error: memberError } = await supabase
    .from("album_members")
    .insert({
      album_id: row.id,
      user_id: input.userId,
      role: "owner",
      membership_status: "active",
      joined_at: new Date().toISOString(),
    })

  if (memberError) throw memberError

  // join_code を分離して返す
  const { join_code, ...albumData } = row as Record<string, unknown> & { join_code: string }

  return {
    album: { ...(albumData as Omit<AlbumWithMemberCount, "member_count">), member_count: 1 },
    joinCode: join_code,
  }
}

/** アルバムに参加する（招待コード検証 + admin client で RLS をバイパス） */
export async function joinAlbum(input: {
  userId: string
  albumId: string
  joinCode: string
}): Promise<void> {
  // まず既に参加していないか確認
  const { data: existing } = await supabaseAdmin
    .from("album_members")
    .select("album_id, membership_status")
    .eq("album_id", input.albumId)
    .eq("user_id", input.userId)
    .maybeSingle()

  if (existing?.membership_status === "active") {
    throw new Error("既にこのアルバムに参加しています")
  }

  // 招待コードを検証（admin client で join_code を取得）
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("join_code")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) {
    throw new Error("アルバムが見つかりません")
  }

  if (album.join_code !== input.joinCode) {
    throw new Error("招待コードが正しくありません")
  }

  // pending リクエストがあれば active に昇格、なければ新規挿入
  if (existing?.membership_status === "pending") {
    const { error } = await supabaseAdmin
      .from("album_members")
      .update({
        membership_status: "active",
        joined_at: new Date().toISOString(),
      })
      .eq("album_id", input.albumId)
      .eq("user_id", input.userId)

    if (error) throw error
  } else {
    const { error } = await supabaseAdmin
      .from("album_members")
      .insert({
        album_id: input.albumId,
        user_id: input.userId,
        role: "member",
        membership_status: "active",
        joined_at: new Date().toISOString(),
      })

    if (error) throw error
  }
}

/** 招待コードからアルバムを逆引きして参加する（albumId 不要） */
export async function joinAlbumByCode(input: {
  userId: string
  joinCode: string
}): Promise<{ albumId: string; albumName: string }> {
  const code = input.joinCode.trim().toLowerCase()
  if (!code) throw new Error("招待コードを入力してください")

  // コードからアルバムを検索（join_code は UNIQUE）
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("id, name")
    .eq("join_code", code)
    .maybeSingle()

  if (albumError) throw albumError
  if (!album) throw new Error("無効な招待コードです")

  const albumId = album.id as string

  // 既存メンバーシップ確認
  const { data: existing } = await supabaseAdmin
    .from("album_members")
    .select("membership_status")
    .eq("album_id", albumId)
    .eq("user_id", input.userId)
    .maybeSingle()

  if (existing?.membership_status === "active") {
    throw new Error("既にこのアルバムに参加しています")
  }

  if (existing) {
    // pending / rejected / left → active に更新
    const { error } = await supabaseAdmin
      .from("album_members")
      .update({
        membership_status: "active",
        joined_at: new Date().toISOString(),
      })
      .eq("album_id", albumId)
      .eq("user_id", input.userId)
    if (error) throw error
  } else {
    const { error } = await supabaseAdmin
      .from("album_members")
      .insert({
        album_id: albumId,
        user_id: input.userId,
        role: "member",
        membership_status: "active",
        joined_at: new Date().toISOString(),
      })
    if (error) throw error
  }

  return { albumId, albumName: album.name as string }
}

/** 招待コードなしでアルバムへの参加リクエストを送信する */
export async function requestJoinAlbum(input: {
  userId: string
  albumId: string
}): Promise<void> {
  // 既存のメンバーシップを確認
  const { data: existing } = await supabaseAdmin
    .from("album_members")
    .select("membership_status")
    .eq("album_id", input.albumId)
    .eq("user_id", input.userId)
    .maybeSingle()

  if (existing?.membership_status === "active") {
    throw new Error("既にこのアルバムに参加しています")
  }
  if (existing?.membership_status === "pending") {
    throw new Error("既に参加リクエストを送信済みです")
  }

  // rejected / left の場合は再リクエスト可能にする（レコードを更新）
  if (existing?.membership_status === "rejected" || existing?.membership_status === "left") {
    const { error } = await supabaseAdmin
      .from("album_members")
      .update({ membership_status: "pending" })
      .eq("album_id", input.albumId)
      .eq("user_id", input.userId)

    if (error) throw error
  } else {
    const { error } = await supabaseAdmin
      .from("album_members")
      .insert({
        album_id: input.albumId,
        user_id: input.userId,
        role: "member",
        membership_status: "pending",
      })

    if (error) throw error
  }

  // オーナーに参加リクエスト通知を送信
  const [albumResult, profileResult] = await Promise.all([
    supabaseAdmin.from("albums").select("owner_id, name").eq("id", input.albumId).single(),
    supabaseAdmin.from("profiles").select("display_name").eq("id", input.userId).single(),
  ])

  if (albumResult.data && profileResult.data) {
    const ownerId = albumResult.data.owner_id as string
    const albumName = (albumResult.data.name as string) ?? "アルバム"
    const requesterName = profileResult.data.display_name as string

    if (ownerId !== input.userId) {
      createNotification({
        userId: ownerId,
        type: "join_request",
        title: "参加リクエスト",
        body: `${requesterName}さんが「${albumName}」への参加をリクエストしました`,
        link: `/album/${input.albumId}?tab=members`,
      }).catch(() => {})
    }
  }
}

/** オーナーがアルバムの未承認リクエスト一覧を取得する */
export async function getPendingRequests(input: {
  userId: string
  albumId: string
}): Promise<{ user_id: string; display_name: string; username: string | null }[]> {
  // オーナー確認
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("owner_id")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) throw new Error("アルバムが見つかりません")
  if (album.owner_id !== input.userId) throw new Error("権限がありません")

  // pending メンバーを取得
  const { data: members, error } = await supabaseAdmin
    .from("album_members")
    .select("user_id")
    .eq("album_id", input.albumId)
    .eq("membership_status", "pending")

  if (error) throw error
  if (!members || members.length === 0) return []

  // プロフィール情報を取得
  const userIds = members.map((m) => m.user_id)
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, username")
    .in("id", userIds)

  if (profileError) throw profileError

  return (profiles ?? []).map((p) => ({
    user_id: p.id,
    display_name: p.display_name,
    username: p.username,
  }))
}

/** オーナーが参加リクエストを承認する */
export async function approveJoinRequest(input: {
  userId: string
  albumId: string
  requestUserId: string
}): Promise<void> {
  // オーナー確認
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("owner_id, name")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) throw new Error("アルバムが見つかりません")
  if (album.owner_id !== input.userId) throw new Error("権限がありません")

  const { error } = await supabaseAdmin
    .from("album_members")
    .update({
      membership_status: "active",
      joined_at: new Date().toISOString(),
    })
    .eq("album_id", input.albumId)
    .eq("user_id", input.requestUserId)
    .eq("membership_status", "pending")

  if (error) throw error

  // 承認通知を生成
  const albumName = (album.name as string) ?? "アルバム"
  createNotification({
    userId: input.requestUserId,
    type: "join_approved",
    title: "参加承認",
    body: `「${albumName}」への参加が承認されました`,
    link: `/album/${input.albumId}?tab=members`,
  }).catch(() => {})
}

/** オーナーが参加リクエストを拒否する */
export async function rejectJoinRequest(input: {
  userId: string
  albumId: string
  requestUserId: string
}): Promise<void> {
  // オーナー確認
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("owner_id")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) throw new Error("アルバムが見つかりません")
  if (album.owner_id !== input.userId) throw new Error("権限がありません")

  const { error } = await supabaseAdmin
    .from("album_members")
    .update({ membership_status: "rejected" })
    .eq("album_id", input.albumId)
    .eq("user_id", input.requestUserId)
    .eq("membership_status", "pending")

  if (error) throw error
}

/** 自分がオーナーのアルバムの pending リクエスト数を取得する */
export async function getPendingCountsForOwner(
  userId: string
): Promise<Map<string, number>> {
  const supabase = await createSupabaseServerClient()

  // オーナーのアルバムIDを取得
  const { data: albums, error: albumError } = await supabase
    .from("albums")
    .select("id")
    .eq("owner_id", userId)

  if (albumError) throw albumError
  if (!albums || albums.length === 0) return new Map()

  const albumIds = albums.map((a) => a.id)

  // 各アルバムの pending 数を取得
  const counts = await Promise.all(
    albumIds.map(async (albumId) => {
      const { count, error } = await supabaseAdmin
        .from("album_members")
        .select("*", { count: "exact", head: true })
        .eq("album_id", albumId)
        .eq("membership_status", "pending")
      if (error) throw error
      return { albumId: albumId as string, count: count ?? 0 }
    })
  )

  return new Map(counts.filter((c) => c.count > 0).map((c) => [c.albumId, c.count]))
}

/** オーナーがアルバムの招待コードを取得する */
export async function getAlbumJoinCode(input: {
  userId: string
  albumId: string
}): Promise<string> {
  const { data: album, error } = await supabaseAdmin
    .from("albums")
    .select("join_code, owner_id")
    .eq("id", input.albumId)
    .single()

  if (error || !album) {
    throw new Error("アルバムが見つかりません")
  }

  if (album.owner_id !== input.userId) {
    throw new Error("招待コードを確認する権限がありません")
  }

  return album.join_code
}

/** 単一アルバムをIDで取得（メンバー数付き） */
export async function getAlbumById(albumId: string): Promise<AlbumWithMemberCount | null> {
  const supabase = await createSupabaseServerClient()

  const { data: album, error } = await supabase
    .from("albums")
    .select(ALBUM_COLUMNS)
    .eq("id", albumId)
    .maybeSingle()

  if (error) throw error
  if (!album) return null

  const { count, error: countError } = await supabase
    .from("album_members")
    .select("*", { count: "exact", head: true })
    .eq("album_id", albumId)
    .eq("membership_status", "active")

  if (countError) throw countError

  return {
    ...(album as Omit<AlbumWithMemberCount, "member_count">),
    member_count: count ?? 0,
  }
}

/** ユーザーのアルバム内ロールを取得（非メンバーは null） */
export async function getUserAlbumRole(userId: string, albumId: string): Promise<UserAlbumRole> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("album_members")
    .select("role")
    .eq("album_id", albumId)
    .eq("user_id", userId)
    .eq("membership_status", "active")
    .maybeSingle()

  if (error) throw error
  return (data?.role as UserAlbumRole) ?? null
}

/** アルバムのメンバー一覧を取得（プロフィール付き、ロール順） */
export async function getAlbumMembers(albumId: string): Promise<AlbumMemberWithProfile[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("album_members")
    .select("user_id, role, membership_status, joined_at, profiles!album_members_user_id_fkey(display_name, username, avatar_url)")
    .eq("album_id", albumId)
    .eq("membership_status", "active")

  if (error) throw error
  if (!data) return []

  // role順ソート: owner > admin > member
  const roleOrder: Record<string, number> = { owner: 0, admin: 1, member: 2 }

  const members = data
    .map((row) => {
      const profile = row.profiles as unknown as { display_name: string; username: string | null; avatar_url: string | null } | null
      return {
        user_id: row.user_id,
        role: row.role as "owner" | "admin" | "member",
        membership_status: row.membership_status as "active" | "pending" | "left",
        joined_at: row.joined_at,
        display_name: profile?.display_name ?? "ユーザー",
        username: profile?.username ?? null,
        avatar_url: profile?.avatar_url ?? null,
      }
    })
    .sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9))

  // avatar_url を署名付きURLに変換
  await Promise.all(
    members.map(async (m) => {
      if (m.avatar_url && m.avatar_url.startsWith("avatars/")) {
        m.avatar_url = await generateSignedReadUrl(m.avatar_url)
      }
    })
  )

  return members
}

/** 招待コードを再生成する（owner only） */
export async function regenerateJoinCode(input: {
  userId: string
  albumId: string
}): Promise<string> {
  // オーナー確認
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("owner_id")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) throw new Error("アルバムが見つかりません")
  if (album.owner_id !== input.userId) throw new Error("権限がありません")

  // PostgreSQL で新しいコードを生成して更新
  const { data, error } = await supabaseAdmin.rpc("regenerate_join_code", {
    p_album_id: input.albumId,
  })

  if (error) {
    // RPC がない場合のフォールバック: JS側で生成
    const bytes = new Uint8Array(5)
    crypto.getRandomValues(bytes)
    const newCode = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")

    const { error: updateError } = await supabaseAdmin
      .from("albums")
      .update({ join_code: newCode })
      .eq("id", input.albumId)

    if (updateError) throw updateError
    return newCode
  }

  return data as string
}

/** メンバーを退出させる（owner only） */
export async function removeMember(input: {
  userId: string
  albumId: string
  targetUserId: string
}): Promise<void> {
  if (input.userId === input.targetUserId) {
    throw new Error("自分自身を退出させることはできません")
  }

  // オーナー確認
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("owner_id")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) throw new Error("アルバムが見つかりません")
  if (album.owner_id !== input.userId) throw new Error("権限がありません")

  const { error } = await supabaseAdmin
    .from("album_members")
    .update({ membership_status: "left" })
    .eq("album_id", input.albumId)
    .eq("user_id", input.targetUserId)
    .eq("membership_status", "active")

  if (error) throw error
}

/** メンバーのロールを変更する（owner only） */
export async function changeMemberRole(input: {
  userId: string
  albumId: string
  targetUserId: string
  newRole: "admin" | "member"
}): Promise<void> {
  if (input.userId === input.targetUserId) {
    throw new Error("自分自身のロールは変更できません")
  }

  // オーナー確認
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("owner_id")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) throw new Error("アルバムが見つかりません")
  if (album.owner_id !== input.userId) throw new Error("権限がありません")

  const { error } = await supabaseAdmin
    .from("album_members")
    .update({ role: input.newRole })
    .eq("album_id", input.albumId)
    .eq("user_id", input.targetUserId)
    .eq("membership_status", "active")

  if (error) throw error
}

/** オーナーがつなぐポイントの閾値を更新する */
export async function updateAlbumThreshold(input: {
  userId: string
  albumId: string
  threshold: number
}): Promise<void> {
  if (input.threshold < 10 || input.threshold > 10000) {
    throw new Error("しきい値は10〜10000の範囲で設定してください")
  }

  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("owner_id")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) throw new Error("アルバムが見つかりません")
  if (album.owner_id !== input.userId) throw new Error("権限がありません")

  const { error } = await supabaseAdmin
    .from("albums")
    .update({ tsunagu_threshold: input.threshold })
    .eq("id", input.albumId)

  if (error) throw error
}

/** ─── アルバム削除（オーナーのみ） ─── */
export async function deleteAlbum(input: {
  userId: string
  albumId: string
}): Promise<void> {
  // 1. 権限チェック: オーナーのみ
  const { data: album, error: albumError } = await supabaseAdmin
    .from("albums")
    .select("id, owner_id")
    .eq("id", input.albumId)
    .single()

  if (albumError || !album) throw new Error("アルバムが見つかりません")
  if (album.owner_id !== input.userId) throw new Error("権限がありません")

  // 2. メディア一覧取得（GCS 削除 + クォータ減算用）
  const { data: assets } = await supabaseAdmin
    .from("media_assets")
    .select("object_path, uploader_id, size_bytes")
    .eq("album_id", input.albumId)

  if (assets && assets.length > 0) {
    // 3. GCS 一括削除（失敗は無視）
    await Promise.allSettled(
      assets.map((a) => deleteObject(a.object_path as string))
    )

    // 4. uploader ごとに size_bytes を集計して減算
    const quotaMap = new Map<string, number>()
    for (const a of assets) {
      const uid = a.uploader_id as string
      const size = (a.size_bytes as number) ?? 0
      if (size > 0) {
        quotaMap.set(uid, (quotaMap.get(uid) ?? 0) + size)
      }
    }
    await Promise.allSettled(
      Array.from(quotaMap.entries()).map(([uid, total]) =>
        decrementUsedBytes(uid, total)
      )
    )
  }

  // 5. アルバム削除（CASCADE で全関連データも削除）
  const { error: deleteError } = await supabaseAdmin
    .from("albums")
    .delete()
    .eq("id", input.albumId)

  if (deleteError) throw new Error("アルバムの削除に失敗しました")
}
