import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/profiles"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [profile, notificationCount] = await Promise.all([
    getProfile(user.id),
    getUnreadNotificationCount(user.id),
  ])

  if (!profile) {
    redirect("/auth/setup")
  }

  const userProfile = {
    display_name: profile.display_name ?? "ユーザー",
    avatar_url: profile.avatar_url ?? null,
    email: user.email ?? "",
  }

  return <SettingsClient userProfile={userProfile} notificationCount={notificationCount} />
}
