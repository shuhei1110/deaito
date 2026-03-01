import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getHomeActivities } from "@/lib/supabase/activities"
import { getProfile } from "@/lib/supabase/profiles"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { redirect } from "next/navigation"
import { ActivityPageClient } from "./activity-client"

export default async function ActivityPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [activities, profile, notificationCount] = await Promise.all([
    getHomeActivities(user.id, 30),
    getProfile(user.id),
    getUnreadNotificationCount(user.id),
  ])

  const userProfile = {
    display_name: profile?.display_name ?? "ユーザー",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  return (
    <ActivityPageClient activities={activities} userProfile={userProfile} notificationCount={notificationCount} />
  )
}
