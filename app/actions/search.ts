"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { searchMyAlbums, searchMembers, searchEvents } from "@/lib/supabase/search"

/** グローバル検索（アルバム/メンバー/イベント） */
export async function searchAction(
  query: string
): Promise<{
  albums: { id: string; name: string; year: number | null }[]
  people: { id: string; display_name: string; username: string | null; avatar_url: string | null }[]
  events: { id: string; album_id: string; name: string; starts_at: string | null }[]
}> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { albums: [], people: [], events: [] }
  }

  const q = query.trim()
  if (q.length < 2) {
    return { albums: [], people: [], events: [] }
  }

  const [albums, people, events] = await Promise.all([
    searchMyAlbums(user.id, q),
    searchMembers(user.id, q),
    searchEvents(user.id, q),
  ])

  return { albums, people, events }
}
