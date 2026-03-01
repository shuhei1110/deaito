import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { generateSignedReadUrl } from "@/lib/gcs"
import { formatTimeAgo } from "@/lib/supabase/connections"
import type { HomeActivity, HomeActivityType } from "@/lib/album-types"

/** ユーザーが参加中のアルバムIDを取得 */
async function getMyAlbumIds(userId: string): Promise<string[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("album_members")
    .select("album_id")
    .eq("user_id", userId)
    .eq("membership_status", "active")

  if (error) throw error
  return (data ?? []).map((d) => d.album_id)
}

function getActionText(
  type: HomeActivityType,
  mediaType?: "image" | "video"
): string {
  switch (type) {
    case "upload":
      return mediaType === "video"
        ? "新しい動画をアップロード"
        : "新しい写真をアップロード"
    case "like":
      return mediaType === "video" ? "動画にいいね" : "写真にいいね"
    case "comment":
      return "コメント"
    case "join":
      return "アルバムに参加"
  }
}

type RawActivity = {
  type: HomeActivityType
  sourceId: string
  userId: string
  albumId: string
  eventId?: string | null
  mediaType?: "image" | "video"
  comment?: string
  createdAt: string
}

/** ホーム画面用：ユーザーの全アルバム横断アクティビティを取得 */
export async function getHomeActivities(
  userId: string,
  limit = 15
): Promise<HomeActivity[]> {
  const albumIds = await getMyAlbumIds(userId)
  if (albumIds.length === 0) return []

  const supabase = await createSupabaseServerClient()

  // 4テーブルを並列クエリ
  const [uploadsRes, likesRes, commentsRes, joinsRes] = await Promise.all([
    supabase
      .from("media_assets")
      .select("id, album_id, uploader_id, media_type, event_id, created_at")
      .in("album_id", albumIds)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("media_reactions")
      .select(
        "id, user_id, created_at, media_assets!inner(album_id, media_type, event_id)"
      )
      .in("media_assets.album_id", albumIds)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("media_comments")
      .select(
        "id, user_id, body, created_at, media_assets!inner(album_id, media_type, event_id)"
      )
      .in("media_assets.album_id", albumIds)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("album_members")
      .select("user_id, album_id, joined_at")
      .in("album_id", albumIds)
      .eq("membership_status", "active")
      .not("joined_at", "is", null)
      .order("joined_at", { ascending: false })
      .limit(limit),
  ])

  // RawActivity にマッピング
  const all: RawActivity[] = []

  for (const row of uploadsRes.data ?? []) {
    all.push({
      type: "upload",
      sourceId: row.id,
      userId: row.uploader_id,
      albumId: row.album_id,
      eventId: row.event_id,
      mediaType: row.media_type as "image" | "video",
      createdAt: row.created_at,
    })
  }

  for (const row of likesRes.data ?? []) {
    const ma = row.media_assets as unknown as {
      album_id: string
      media_type: string
      event_id: string | null
    }
    all.push({
      type: "like",
      sourceId: row.id,
      userId: row.user_id,
      albumId: ma.album_id,
      eventId: ma.event_id,
      mediaType: ma.media_type as "image" | "video",
      createdAt: row.created_at,
    })
  }

  for (const row of commentsRes.data ?? []) {
    const ma = row.media_assets as unknown as {
      album_id: string
      media_type: string
      event_id: string | null
    }
    all.push({
      type: "comment",
      sourceId: row.id,
      userId: row.user_id,
      albumId: ma.album_id,
      eventId: ma.event_id,
      mediaType: ma.media_type as "image" | "video",
      comment: row.body,
      createdAt: row.created_at,
    })
  }

  for (const row of joinsRes.data ?? []) {
    all.push({
      type: "join",
      sourceId: `${row.album_id}-${row.user_id}`,
      userId: row.user_id,
      albumId: row.album_id,
      createdAt: row.joined_at!,
    })
  }

  // 時間降順ソート → 上位 limit 件
  all.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const top = all.slice(0, limit)
  if (top.length === 0) return []

  // プロフィール・アルバム名・イベント名をバッチ取得
  const uniqueUserIds = [...new Set(top.map((a) => a.userId))]
  const uniqueAlbumIds = [...new Set(top.map((a) => a.albumId))]
  const uniqueEventIds = [
    ...new Set(
      top.map((a) => a.eventId).filter((id): id is string => id != null)
    ),
  ]

  const [profilesRes, albumsRes, eventsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", uniqueUserIds),
    supabase.from("albums").select("id, name").in("id", uniqueAlbumIds),
    uniqueEventIds.length > 0
      ? supabase
          .from("events")
          .select("id, name")
          .in("id", uniqueEventIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ])

  // Map化
  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [
      p.id as string,
      {
        display_name: p.display_name as string,
        avatar_url: p.avatar_url as string | null,
      },
    ])
  )
  const albumMap = new Map(
    (albumsRes.data ?? []).map((a) => [a.id as string, a.name as string])
  )
  const eventDataArr = "data" in eventsRes ? (eventsRes.data ?? []) : eventsRes
  const eventMap = new Map(
    (eventDataArr as { id: string; name: string }[]).map((e) => [
      e.id,
      e.name,
    ])
  )

  // アバター署名（重複排除）
  const signedAvatarCache = new Map<string, string>()
  for (const [, profile] of profileMap) {
    if (
      profile.avatar_url &&
      profile.avatar_url.startsWith("avatars/") &&
      !signedAvatarCache.has(profile.avatar_url)
    ) {
      signedAvatarCache.set(
        profile.avatar_url,
        await generateSignedReadUrl(profile.avatar_url)
      )
    }
  }

  // HomeActivity に変換
  return top.map((a) => {
    const profile = profileMap.get(a.userId)
    const rawAvatar = profile?.avatar_url ?? null
    const signedAvatar =
      rawAvatar && signedAvatarCache.has(rawAvatar)
        ? signedAvatarCache.get(rawAvatar)!
        : rawAvatar

    return {
      id: `${a.type}-${a.sourceId}`,
      type: a.type,
      user: {
        id: a.userId,
        name: profile?.display_name ?? "メンバー",
        avatar_url: signedAvatar,
      },
      action: getActionText(a.type, a.mediaType),
      content: {
        type: a.mediaType,
        title: a.eventId ? eventMap.get(a.eventId) ?? undefined : undefined,
        albumName: albumMap.get(a.albumId) ?? "",
        albumId: a.albumId,
        comment: a.comment,
      },
      createdAt: a.createdAt,
      timeAgo: formatTimeAgo(a.createdAt),
    }
  })
}
