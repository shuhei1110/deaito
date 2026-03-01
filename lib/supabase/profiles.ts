import "server-only"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { generateSignedReadUrl } from "@/lib/gcs"

function deriveDisplayName(email?: string) {
  if (!email) return "ユーザー"
  return email.split("@")[0] || "ユーザー"
}

export async function ensureProfileByUserWithStatus(input: { userId: string; email?: string }) {
  const { userId, email } = input

  const { data: existingProfile, error: selectError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (existingProfile) {
    return { created: false }
  }

  const { error } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    display_name: deriveDisplayName(email),
  })

  if (error) {
    throw error
  }

  return { created: true }
}

export async function ensureProfileByUser(input: { userId: string; email?: string }) {
  await ensureProfileByUserWithStatus(input)
}

/** プロフィールを取得する（avatar_url は署名付きURLに変換済み） */
export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw error
  if (data?.avatar_url && data.avatar_url.startsWith("avatars/")) {
    data.avatar_url = await generateSignedReadUrl(data.avatar_url)
  }
  return data
}

/** avatar_url の生パス（GCSオブジェクトパス）を取得する */
export async function getRawAvatarPath(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw error
  return data?.avatar_url ?? null
}

/** アバターURLを更新する */
export async function updateAvatarUrl(userId: string, objectPath: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      avatar_url: objectPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) throw error
}

/** プロフィール初期設定が完了しているか（username が設定済みか） */
export async function isProfileSetupComplete(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw error
  return !!data?.username
}

/** 2ユーザーの共有アルバム（両方が active メンバー）を取得 */
export async function getSharedAlbums(
  viewerId: string,
  targetUserId: string
): Promise<
  { id: string; name: string; category: string; year: number | null }[]
> {
  // viewerが参加中のアルバムID
  const { data: viewerAlbums, error: e1 } = await supabaseAdmin
    .from("album_members")
    .select("album_id")
    .eq("user_id", viewerId)
    .eq("membership_status", "active")

  if (e1) throw e1
  const viewerIds = (viewerAlbums ?? []).map((r) => r.album_id)
  if (viewerIds.length === 0) return []

  // targetが参加中 かつ viewerと共通のアルバム
  const { data: targetAlbums, error: e2 } = await supabaseAdmin
    .from("album_members")
    .select("album_id")
    .eq("user_id", targetUserId)
    .eq("membership_status", "active")
    .in("album_id", viewerIds)

  if (e2) throw e2
  const sharedIds = (targetAlbums ?? []).map((r) => r.album_id)
  if (sharedIds.length === 0) return []

  const { data: albums, error: e3 } = await supabaseAdmin
    .from("albums")
    .select("id, name, category, year")
    .in("id", sharedIds)
    .order("year", { ascending: false, nullsFirst: false })

  if (e3) throw e3
  return (albums ?? []) as {
    id: string
    name: string
    category: string
    year: number | null
  }[]
}

/** プロフィールを更新する */
export async function updateProfile(
  userId: string,
  input: {
    username: string
    display_name: string
    bio?: string
  }
) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      username: input.username,
      display_name: input.display_name,
      bio: input.bio ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) throw error
}
