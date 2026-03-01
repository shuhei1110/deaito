import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getAlbumById, getUserAlbumRole, getAlbumMembers, getAlbumJoinCode, getPendingRequests } from "@/lib/supabase/albums"
import { getAlbumEventTree, getMediaByAlbumId } from "@/lib/supabase/events"
import { getAlbumTsunaguPoints } from "@/lib/supabase/connections"
import { getProfile } from "@/lib/supabase/profiles"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { AlbumDetailClient } from "./album-detail-client"

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [album, userRole] = await Promise.all([
    getAlbumById(id),
    getUserAlbumRole(user.id, id),
  ])

  if (!album) notFound()

  // 並列データ取得
  const [eventTree, mediaResult, members, tsunaguPoints, profile, notificationCount] = await Promise.all([
    getAlbumEventTree(id),
    getMediaByAlbumId(id, { limit: 20 }),
    getAlbumMembers(id),
    getAlbumTsunaguPoints(id),
    getProfile(user.id),
    getUnreadNotificationCount(user.id),
  ])

  const userProfile = {
    display_name: profile?.display_name ?? "ユーザー",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  // オーナー/管理者のみ取得するデータ
  let joinCode: string | undefined
  let pendingRequests: { user_id: string; display_name: string; username: string | null }[] = []
  if (userRole === "owner" || userRole === "admin") {
    const [codeResult, pendingResult] = await Promise.all([
      getAlbumJoinCode({ userId: user.id, albumId: id }).catch(() => null),
      getPendingRequests({ userId: user.id, albumId: id }).catch(() => []),
    ])
    joinCode = codeResult ?? undefined
    pendingRequests = pendingResult
  }

  return (
    <AlbumDetailClient
      album={album}
      userRole={userRole}
      currentUserId={user.id}
      eventTree={eventTree}
      initialMedia={mediaResult.media}
      mediaTotalCount={mediaResult.total}
      members={members}
      joinCode={joinCode}
      pendingRequests={pendingRequests}
      tsunaguTotalPoints={tsunaguPoints.total}
      userProfile={userProfile}
      notificationCount={notificationCount}
    />
  )
}
