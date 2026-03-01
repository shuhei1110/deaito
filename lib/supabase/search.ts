import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { generateSignedReadUrl } from "@/lib/gcs"

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

/** 参加中のアルバムを名前で検索 */
export async function searchMyAlbums(
  userId: string,
  query: string
): Promise<{ id: string; name: string; year: number | null }[]> {
  const albumIds = await getMyAlbumIds(userId)
  if (albumIds.length === 0) return []

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("albums")
    .select("id, name, year")
    .in("id", albumIds)
    .ilike("name", `%${query}%`)
    .order("year", { ascending: false })
    .limit(10)

  if (error) throw error
  return (data ?? []) as { id: string; name: string; year: number | null }[]
}

/** 参加中のアルバムのメンバーを検索（自分を除外、重複排除） */
export async function searchMembers(
  userId: string,
  query: string
): Promise<{ id: string; display_name: string; username: string | null; avatar_url: string | null }[]> {
  const albumIds = await getMyAlbumIds(userId)
  if (albumIds.length === 0) return []

  const supabase = await createSupabaseServerClient()

  // 自分と同じアルバムに所属する他メンバーのuser_idを取得
  const { data: memberRows, error: memberError } = await supabase
    .from("album_members")
    .select("user_id")
    .in("album_id", albumIds)
    .eq("membership_status", "active")
    .neq("user_id", userId)

  if (memberError) throw memberError
  if (!memberRows || memberRows.length === 0) return []

  // 重複排除
  const memberUserIds = [...new Set(memberRows.map((m) => m.user_id))]

  // プロフィールを検索
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", memberUserIds)
    .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(10)

  if (profileError) throw profileError
  if (!profiles) return []

  // avatar_url を署名付きURLに変換
  const results = await Promise.all(
    profiles.map(async (p) => ({
      id: p.id as string,
      display_name: p.display_name as string,
      username: p.username as string | null,
      avatar_url:
        p.avatar_url && (p.avatar_url as string).startsWith("avatars/")
          ? await generateSignedReadUrl(p.avatar_url as string)
          : (p.avatar_url as string | null),
    }))
  )

  return results
}

/** 参加中のアルバムのイベントを検索 */
export async function searchEvents(
  userId: string,
  query: string
): Promise<{ id: string; album_id: string; name: string; starts_at: string | null }[]> {
  const albumIds = await getMyAlbumIds(userId)
  if (albumIds.length === 0) return []

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("events")
    .select("id, album_id, name, starts_at")
    .in("album_id", albumIds)
    .ilike("name", `%${query}%`)
    .order("starts_at", { ascending: false, nullsFirst: false })
    .limit(10)

  if (error) throw error
  return (data ?? []) as { id: string; album_id: string; name: string; starts_at: string | null }[]
}
