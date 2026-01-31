"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Heart, MessageCircle, UserPlus, Video, ImageIcon, Eye } from "lucide-react"

const mockActivities = [
  {
    id: 1,
    type: "upload",
    user: { name: "山田 花子", avatar: "/japanese-woman.png" },
    action: "新しい写真をアップロードしました",
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
    action: "写真を閲覧しました",
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
    action: "動画にいいねしました",
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
    action: "コメントしました",
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
    action: "新しい動画をアップロードしました",
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
    action: "アルバムに参加しました",
    content: {
      school: "東京大学 工学部",
    },
    time: "5時間前",
  },
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case "upload":
      return <Upload className="h-3.5 w-3.5" />
    case "like":
      return <Heart className="h-3.5 w-3.5" />
    case "comment":
      return <MessageCircle className="h-3.5 w-3.5" />
    case "join":
      return <UserPlus className="h-3.5 w-3.5" />
    case "view":
      return <Eye className="h-3.5 w-3.5" />
    default:
      return <Eye className="h-3.5 w-3.5" />
  }
}

export function ActivityTimeline() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Recent activity</p>
        <h2 className="text-2xl font-serif">最新の動き</h2>
      </div>

      <div className="space-y-1">
        {mockActivities.map((activity, index) => (
          <div 
            key={activity.id} 
            className="group relative py-6 hover:bg-secondary/30 -mx-4 px-4 rounded-lg transition-colors"
          >
            {/* Timeline line */}
            {index !== mockActivities.length - 1 && (
              <div className="absolute left-[26px] top-16 bottom-0 w-px bg-border" />
            )}
            
            <div className="flex gap-4">
              {/* Avatar with icon overlay */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">{activity.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-muted-foreground ml-1.5">{activity.action}</span>
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>

                {/* Activity Content */}
                {activity.content && activity.type !== "join" && (
                  <div className="p-4 bg-card border border-border rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      {activity.content.type === "video" ? (
                        <Video className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{activity.content.title}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs font-normal rounded-full">
                        {activity.content.school}
                      </Badge>
                      {activity.engagement && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {activity.engagement.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {activity.engagement.likes}
                          </span>
                          {activity.engagement.comments !== undefined && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {activity.engagement.comments}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {activity.content.comment && (
                      <p className="text-sm text-foreground pl-3 border-l-2 border-border">
                        {activity.content.comment}
                      </p>
                    )}
                  </div>
                )}

                {activity.type === "join" && activity.content && (
                  <Badge variant="secondary" className="text-xs font-normal rounded-full">
                    {activity.content.school}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
