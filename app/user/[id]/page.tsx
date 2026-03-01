import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getProfile, getSharedAlbums } from "@/lib/supabase/profiles"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { redirect, notFound } from "next/navigation"
import { UserDetailClient } from "./user-detail-client"

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: targetUserId } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 自分自身なら /profile へ
  if (targetUserId === user.id) {
    redirect("/profile")
  }

  const [targetProfile, viewerProfile, sharedAlbums, notificationCount] = await Promise.all([
    getProfile(targetUserId),
    getProfile(user.id),
    getSharedAlbums(user.id, targetUserId),
    getUnreadNotificationCount(user.id),
  ])

  // プロフィールが存在しない or 共有アルバムがない場合は404
  if (!targetProfile || sharedAlbums.length === 0) {
    notFound()
  }

  const userProfile = {
    display_name: viewerProfile?.display_name ?? "ユーザー",
    avatar_url: viewerProfile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  return (
    <UserDetailClient
      profile={targetProfile}
      sharedAlbums={sharedAlbums}
      userProfile={userProfile}
      notificationCount={notificationCount}
    />
  )
}
