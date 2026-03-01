"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import {
  Bell,
  Mail,
  Heart,
  MessageSquare,
  UserCheck,
  UserPlus,
  CheckCheck,
  BellOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationRow } from "@/lib/supabase/notifications"
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "./actions"

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "たった今"
  if (diffMin < 60) return `${diffMin}分前`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}時間前`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `${diffD}日前`
  const diffM = Math.floor(diffD / 30)
  return `${diffM}ヶ月前`
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "invitation":
      return Mail
    case "like":
      return Heart
    case "comment":
      return MessageSquare
    case "join_approved":
      return UserCheck
    case "join_request":
      return UserPlus
    default:
      return Bell
  }
}

export function NotificationsClient({
  notifications: initialNotifications,
  unreadCount: initialUnreadCount,
  userProfile,
}: {
  notifications: NotificationRow[]
  unreadCount: number
  userProfile: TopBarProfile
}) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsReadAction()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }, [])

  const handleNotificationClick = useCallback(
    async (notification: NotificationRow) => {
      // 未読なら既読にする
      if (!notification.is_read) {
        markNotificationAsReadAction(notification.id).catch(() => {})

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }

      // リンク先に遷移
      if (notification.link) {
        router.push(notification.link)
      }
    },
    [router]
  )

  return (
    <IOSLayout
      breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "通知" }]}
      userProfile={userProfile}
      notificationCount={unreadCount}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-xl font-serif font-light">通知</h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent hover:bg-accent/5 rounded-lg transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            すべて既読にする
          </button>
        )}
      </div>

      {/* 通知一覧 */}
      {notifications.length === 0 ? (
        <div className="py-16 text-center">
          <BellOff className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/40 text-sm">通知はまだありません</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            const isUnread = !notification.is_read

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 rounded-xl text-left transition-colors",
                  isUnread
                    ? "bg-accent/5 hover:bg-accent/10"
                    : "hover:bg-foreground/5"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    isUnread ? "bg-accent/15" : "bg-foreground/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isUnread ? "text-accent" : "text-foreground/40"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm",
                        isUnread ? "font-medium" : "font-normal"
                      )}
                    >
                      {notification.title}
                    </p>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">
                    {notification.body}
                  </p>
                  <p className="text-[10px] text-foreground/30 mt-1">
                    {formatTimeAgo(notification.created_at)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </IOSLayout>
  )
}
