"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Heart, MessageCircle, UserPlus, Video, ImageIcon } from "lucide-react"
import type { HomeActivity } from "@/lib/album-types"

function groupActivitiesByDate(
  activities: HomeActivity[]
): { label: string; items: HomeActivity[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: Map<string, HomeActivity[]> = new Map()

  for (const activity of activities) {
    const actDate = new Date(activity.createdAt)
    const actDay = new Date(
      actDate.getFullYear(),
      actDate.getMonth(),
      actDate.getDate()
    )

    let label: string
    if (actDay.getTime() >= today.getTime()) {
      label = "今日"
    } else if (actDay.getTime() >= yesterday.getTime()) {
      label = "昨日"
    } else {
      label = `${actDay.getMonth() + 1}月${actDay.getDate()}日`
    }

    if (!groups.has(label)) {
      groups.set(label, [])
    }
    groups.get(label)!.push(activity)
  }

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }))
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "upload":
      return <Upload className="h-3 w-3" />
    case "like":
      return <Heart className="h-3 w-3 fill-current" />
    case "comment":
      return <MessageCircle className="h-3 w-3" />
    case "join":
      return <UserPlus className="h-3 w-3" />
    default:
      return <Upload className="h-3 w-3" />
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "like":
      return "bg-red-50 text-red-500"
    case "comment":
      return "bg-blue-50 text-blue-500"
    case "join":
      return "bg-green-50 text-green-500"
    default:
      return "bg-accent/10 text-accent"
  }
}

export function ActivityTimeline({
  activities,
}: {
  activities: HomeActivity[]
}) {
  if (activities.length === 0) {
    return (
      <div className="ios-card p-8 text-center text-foreground/40 text-sm">
        アクティビティはまだありません
      </div>
    )
  }

  const groups = groupActivitiesByDate(activities)

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className="ios-card overflow-hidden">
          <div className="px-4 py-2.5 bg-secondary/30 text-[11px] text-foreground/50 font-medium">
            {group.label}
          </div>
          {group.items.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-4 ${
                index !== group.items.length - 1
                  ? "border-b border-foreground/5"
                  : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10">
                  {activity.user.avatar_url && (
                    <AvatarImage src={activity.user.avatar_url} />
                  )}
                  <AvatarFallback className="text-xs bg-gradient-to-br from-[#e8a87c]/20 to-[#c9a87c]/20 text-[#c9a87c]">
                    {activity.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-foreground/50">
                      {" "}
                      {activity.action}
                    </span>
                  </p>
                  <span className="text-[10px] text-foreground/30 whitespace-nowrap">
                    {activity.timeAgo}
                  </span>
                </div>

                {activity.type !== "join" &&
                  (activity.content.type || activity.content.title) && (
                    <div className="mt-2 p-3 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-2 text-xs text-foreground/70">
                        {activity.content.type === "video" ? (
                          <Video className="h-3.5 w-3.5 text-foreground/40" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5 text-foreground/40" />
                        )}
                        <span>
                          {activity.content.title ||
                            activity.content.albumName}
                        </span>
                      </div>
                      {activity.content.comment && (
                        <p className="text-xs text-foreground/50 mt-2 pl-2 border-l-2 border-foreground/10">
                          {activity.content.comment}
                        </p>
                      )}
                    </div>
                  )}

                {activity.type === "join" && (
                  <Badge
                    variant="secondary"
                    className="mt-2 text-[10px] font-normal rounded-full bg-secondary/50 text-foreground/50 border-0"
                  >
                    {activity.content.albumName}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
