"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Heart, MessageCircle, UserPlus, Video, ImageIcon, Eye } from "lucide-react"

const mockActivities = [
  {
    id: 1,
    type: "upload",
    user: { name: "山田 花子", avatar: "/japanese-woman.png" },
    action: "新しい写真をアップロード",
    content: {
      type: "image",
      title: "卒業式の集合写真",
      thumbnail: "/graduation-ceremony-group-photo.jpg",
      school: "東京大学",
    },
    time: "10分前",
    engagement: { views: 12, likes: 3 },
  },
  {
    id: 2,
    type: "view",
    user: { name: "佐藤 健", avatar: "/japanese-man-1.jpg" },
    action: "写真を閲覧",
    content: {
      type: "image",
      title: "体育祭のリレー",
      school: "桜ヶ丘高校",
    },
    time: "30分前",
  },
  {
    id: 3,
    type: "like",
    user: { name: "鈴木 美咲", avatar: "/japanese-woman-2.jpg" },
    action: "動画にいいね",
    content: {
      type: "video",
      title: "文化祭のバンド演奏",
      school: "桜ヶ丘高校",
    },
    time: "1時間前",
  },
  {
    id: 4,
    type: "comment",
    user: { name: "高橋 誠", avatar: "/japanese-man-2.jpg" },
    action: "コメント",
    content: {
      type: "image",
      title: "修学旅行 in 京都",
      school: "桜ヶ丘高校",
      comment: "懐かしい！あの時は楽しかったね",
    },
    time: "2時間前",
  },
  {
    id: 5,
    type: "upload",
    user: { name: "伊藤 大輔", avatar: "/japanese-young-man.jpg" },
    action: "新しい動画をアップロード",
    content: {
      type: "video",
      title: "体育祭のリレー",
      thumbnail: "/sports-day-video-thumbnail.jpg",
      school: "桜ヶ丘高校",
    },
    time: "3時間前",
    engagement: { views: 45, likes: 12, comments: 5 },
  },
  {
    id: 6,
    type: "join",
    user: { name: "木村 梨花", avatar: "/japanese-woman-3.jpg" },
    action: "アルバムに参加",
    content: {
      school: "東京大学 工学部",
    },
    time: "5時間前",
  },
]

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
    case "view":
      return <Eye className="h-3 w-3" />
    default:
      return <Eye className="h-3 w-3" />
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

export function ActivityTimeline() {
  return (
    <div className="space-y-4">
      {/* Grouped by time */}
      <div className="ios-card overflow-hidden">
        <div className="px-4 py-2.5 bg-secondary/30 text-[11px] text-foreground/50 font-medium">
          今日
        </div>
        {mockActivities.slice(0, 4).map((activity, index) => (
          <div 
            key={activity.id} 
            className={`flex items-start gap-3 p-4 ${
              index !== 3 ? "border-b border-foreground/5" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs bg-secondary">{activity.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-foreground/50"> {activity.action}</span>
                </p>
                <span className="text-[10px] text-foreground/30 whitespace-nowrap">{activity.time}</span>
              </div>

              {activity.content && activity.type !== "join" && (
                <div className="mt-2 p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    {activity.content.type === "video" ? (
                      <Video className="h-3.5 w-3.5 text-foreground/40" />
                    ) : (
                      <ImageIcon className="h-3.5 w-3.5 text-foreground/40" />
                    )}
                    <span>{activity.content.title}</span>
                  </div>
                  {activity.content.comment && (
                    <p className="text-xs text-foreground/50 mt-2 pl-2 border-l-2 border-foreground/10">
                      {activity.content.comment}
                    </p>
                  )}
                </div>
              )}

              {activity.type === "join" && activity.content && (
                <Badge variant="secondary" className="mt-2 text-[10px] font-normal rounded-full bg-secondary/50 text-foreground/50 border-0">
                  {activity.content.school}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="ios-card overflow-hidden">
        <div className="px-4 py-2.5 bg-secondary/30 text-[11px] text-foreground/50 font-medium">
          昨日
        </div>
        {mockActivities.slice(4).map((activity, index) => (
          <div 
            key={activity.id} 
            className={`flex items-start gap-3 p-4 ${
              index !== mockActivities.slice(4).length - 1 ? "border-b border-foreground/5" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs bg-secondary">{activity.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-foreground/50"> {activity.action}</span>
                </p>
                <span className="text-[10px] text-foreground/30 whitespace-nowrap">{activity.time}</span>
              </div>

              {activity.content && activity.type !== "join" && (
                <div className="mt-2 p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    {activity.content.type === "video" ? (
                      <Video className="h-3.5 w-3.5 text-foreground/40" />
                    ) : (
                      <ImageIcon className="h-3.5 w-3.5 text-foreground/40" />
                    )}
                    <span>{activity.content.title}</span>
                  </div>
                </div>
              )}

              {activity.type === "join" && activity.content && (
                <Badge variant="secondary" className="mt-2 text-[10px] font-normal rounded-full bg-secondary/50 text-foreground/50 border-0">
                  {activity.content.school}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
