import "server-only"

import { supabaseAdmin } from "@/lib/supabase/admin"

export interface NotificationRow {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

/** 通知一覧取得（降順） */
export async function getNotifications(
  userId: string,
  limit = 50
): Promise<NotificationRow[]> {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("id, user_id, type, title, body, link, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as NotificationRow[]
}

/** 未読通知数を取得 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) throw error
  return count ?? 0
}

/** 1件既読にする */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)

  if (error) throw error
}

/** 全件既読にする */
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) throw error
}

/** 通知を作成（内部用） */
export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string
  type: string
  title: string
  body: string
  link?: string | null
}): Promise<void> {
  const { error } = await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    link: link ?? null,
  })

  if (error) {
    console.error("[createNotification]", error)
  }
}
