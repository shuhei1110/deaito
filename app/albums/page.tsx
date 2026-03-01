import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getMyAlbums, getPendingCountsForOwner } from "@/lib/supabase/albums"
import { getReceivedInvitations } from "@/lib/supabase/invitations"
import { getProfile } from "@/lib/supabase/profiles"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { redirect } from "next/navigation"
import { AlbumsClient } from "./albums-client"

export default async function AlbumsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [albums, pendingCountsMap, albumInvitations, profile, notificationCount] = await Promise.all([
    getMyAlbums(user.id),
    getPendingCountsForOwner(user.id),
    getReceivedInvitations(user.id),
    getProfile(user.id),
    getUnreadNotificationCount(user.id),
  ])

  // Map → plain object for serialization
  const pendingCounts: Record<string, number> = {}
  for (const [albumId, count] of pendingCountsMap) {
    pendingCounts[albumId] = count
  }

  const userProfile = {
    display_name: profile?.display_name ?? "ユーザー",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  return (
    <AlbumsClient
      initialAlbums={albums}
      currentUserId={user.id}
      pendingCounts={pendingCounts}
      albumInvitations={albumInvitations}
      userProfile={userProfile}
      notificationCount={notificationCount}
    />
  )
}
