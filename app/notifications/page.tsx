import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile } from "@/lib/supabase/profiles"
import { getNotifications, getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { NotificationsClient } from "./notifications-client"

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [notifications, unreadCount, profile] = await Promise.all([
    getNotifications(user.id, 50),
    getUnreadNotificationCount(user.id),
    getProfile(user.id),
  ])

  const userProfile = {
    display_name: profile?.display_name ?? "ユーザー",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  return (
    <NotificationsClient
      notifications={notifications}
      unreadCount={unreadCount}
      userProfile={userProfile}
    />
  )
}
