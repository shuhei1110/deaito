import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getAlbumById } from "@/lib/supabase/albums"
import {
  getAlbumTsunaguPoints,
  getAlbumPointHistory,
  getAlbumRecentActivity,
  getAlbumConnectionCount,
  ensureAlbumConnections,
} from "@/lib/supabase/connections"
import { getProfile } from "@/lib/supabase/profiles"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { ConnectionsClient } from "./connections-client"

export default async function ConnectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const album = await getAlbumById(id)
  if (!album) notFound()

  // connections レコードの自動生成（fire-and-forget）
  ensureAlbumConnections(id).catch(() => {})

  // 並列データ取得
  const [points, history, activity, connectionCount, profile, notificationCount] = await Promise.all([
    getAlbumTsunaguPoints(id),
    getAlbumPointHistory(id),
    getAlbumRecentActivity(id),
    getAlbumConnectionCount(id),
    getProfile(user.id),
    getUnreadNotificationCount(user.id),
  ])

  const userProfile = {
    display_name: profile?.display_name ?? "ユーザー",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  return (
    <ConnectionsClient
      albumId={id}
      albumName={album.name}
      pointBreakdown={points}
      pointHistory={history}
      recentActivity={activity}
      memberCount={album.member_count}
      connectionCount={connectionCount}
      threshold={album.tsunagu_threshold}
      userProfile={userProfile}
      notificationCount={notificationCount}
    />
  )
}
