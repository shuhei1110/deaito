import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getMyAlbums } from "@/lib/supabase/albums"
import { getPendingInvitationCount } from "@/lib/supabase/invitations"
import { getProfile } from "@/lib/supabase/profiles"
import { getHomeActivities } from "@/lib/supabase/activities"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { getCarouselAlbumPoints } from "@/lib/supabase/connections"
import { generateReunionProposals } from "@/lib/supabase/reunion-proposals"
import { redirect } from "next/navigation"
import { HomeClient } from "./home-client"

export default async function Home() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [albums, invitationCount, profile, activities, notificationCount, proposals] = await Promise.all([
    getMyAlbums(user.id),
    getPendingInvitationCount(user.id),
    getProfile(user.id),
    getHomeActivities(user.id),
    getUnreadNotificationCount(user.id),
    generateReunionProposals(user.id),
  ])

  const carouselPoints = await getCarouselAlbumPoints(albums)

  const userProfile = {
    display_name: profile?.display_name ?? "ユーザー",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  const homeStats = {
    connections: albums.reduce((sum, a) => sum + a.member_count, 0),
    proposals: proposals.length,
    notifications: notificationCount,
  }

  return <HomeClient albums={albums} invitationCount={invitationCount} userProfile={userProfile} activities={activities} notificationCount={notificationCount} carouselPoints={carouselPoints} homeStats={homeStats} />
}
