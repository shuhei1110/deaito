"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Heart, MessageCircle, UserPlus, Calendar, Video, ImageIcon, Eye } from "lucide-react"

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
  {
    id: 7,
    type: "view",
    user: { name: "前田 航", avatar: "/japanese-man-3.jpg" },
    action: "写真を閲覧しました",
    content: {
      type: "image",
      title: "卒業式の集合写真",
      school: "東京大学",
    },
    time: "8時間前",
  },
  {
    id: 8,
    type: "like",
    user: { name: "清水 真理", avatar: "/japanese-woman-4.jpg" },
    action: "写真にいいねしました",
    content: {
      type: "image",
      title: "修学旅行 in 京都",
      school: "桜ヶ丘高校",
    },
    time: "12時間前",
  },
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case "upload":
      return <Upload className="h-4 w-4" />
    case "like":
      return <Heart className="h-4 w-4 fill-destructive text-destructive" />
    case "comment":
      return <MessageCircle className="h-4 w-4" />
    case "join":
      return <UserPlus className="h-4 w-4" />
    case "view":
      return <Eye className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "upload":
      return "bg-primary/10 text-primary"
    case "like":
      return "bg-destructive/10 text-destructive"
    case "comment":
      return "bg-accent/10 text-accent"
    case "join":
      return "bg-emerald-500/10 text-emerald-600"
    case "view":
      return "bg-blue-500/10 text-blue-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ActivityTimeline() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-balance mb-2">最新の動き</h2>
        <p className="text-muted-foreground text-sm">クラスメイトの最近の活動やアップロード</p>
      </div>

      <div className="space-y-3">
        {mockActivities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Activity Icon */}
                <div
                  className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.user.name}</span>
                          <span className="text-muted-foreground ml-1">{activity.action}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>

                  {/* Activity Content */}
                  {activity.content && (
                    <div className="ml-8 mt-2">
                      {activity.type === "join" ? (
                        <Badge variant="secondary" className="gap-1">
                          <UserPlus className="h-3 w-3" />
                          {activity.content.school}
                        </Badge>
                      ) : (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            {activity.content.type === "video" ? (
                              <Video className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium text-sm">{activity.content.title}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {activity.content.school}
                            </Badge>
                            {activity.engagement && (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                            <p className="text-sm text-foreground mt-2 pl-2 border-l-2 border-primary/30">
                              {activity.content.comment}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
