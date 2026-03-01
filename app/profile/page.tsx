import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/profiles"
import { getMyAlbums } from "@/lib/supabase/albums"
import { getQuotaInfo } from "@/lib/supabase/quotas"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import ProfileClient from "./profile-client"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfile(user.id)

  if (!profile) {
    redirect("/auth/setup")
  }

  const [albums, quotaInfo, notificationCount] = await Promise.all([
    getMyAlbums(user.id),
    getQuotaInfo(user.id),
    getUnreadNotificationCount(user.id),
  ])

  return <ProfileClient profile={profile} albumCount={albums.length} email={user.email ?? ""} quotaInfo={quotaInfo} notificationCount={notificationCount} />
}
