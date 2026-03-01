"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { markAsRead, markAllAsRead } from "@/lib/supabase/notifications"

async function getAuthUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("認証が必要です")
  return user.id
}

/** 1件の通知を既読にする */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await getAuthUserId()
    await markAsRead(notificationId)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "既読化に失敗しました" }
  }
}

/** 全通知を既読にする */
export async function markAllNotificationsAsReadAction(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const userId = await getAuthUserId()
    await markAllAsRead(userId)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "既読化に失敗しました" }
  }
}
