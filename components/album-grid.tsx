"use client"

import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Heart, MessageCircle, Video, ImageIcon, Plus } from "lucide-react"
import { useState } from "react"

const mockMedia = [
  {
    id: 1,
    type: "image",
    url: "/graduation-ceremony-group-photo.jpg",
    title: "卒業式の集合写真",
    school: "東京大学",
    date: "2024年3月",
    uploadedBy: { name: "山田 花子", avatar: "/japanese-woman.png" },
    views: 45,
    likes: 12,
    comments: 5,
    liked: false,
    viewers: [
      { name: "佐藤 健", time: "2時間前" },
      { name: "鈴木 美咲", time: "5時間前" },
      { name: "高橋 誠", time: "1日前" },
    ],
  },
  {
    id: 2,
    type: "video",
    url: "/sports-day-video-thumbnail.jpg",
    title: "体育祭のリレー",
    school: "桜ヶ丘高校",
    date: "2023年10月",
    uploadedBy: { name: "伊藤 大輔", avatar: "/japanese-young-man.jpg" },
    views: 78,
    likes: 23,
    comments: 8,
    liked: true,
    viewers: [
      { name: "小林 愛", time: "30分前" },
      { name: "渡辺 翔", time: "3時間前" },
      { name: "中村 優子", time: "6時間前" },
    ],
  },
  {
    id: 3,
    type: "image",
    url: "/school-trip-mountain.jpg",
    title: "修学旅行 in 京都",
    school: "桜ヶ丘高校",
    date: "2023年6月",
    uploadedBy: { name: "田中 太郎", avatar: "/friendly-japanese-man.jpg" },
    views: 92,
    likes: 31,
    comments: 12,
    liked: false,
    viewers: [
      { name: "木村 梨花", time: "1時間前" },
      { name: "斎藤 拓也", time: "4時間前" },
      { name: "松本 結衣", time: "8時間前" },
      { name: "前田 航", time: "12時間前" },
    ],
  },
  {
    id: 4,
    type: "image",
    url: "/school-festival-stage-performance.jpg",
    title: "文化祭のバンド演奏",
    school: "桜ヶ丘高校",
    date: "2023年9月",
    uploadedBy: { name: "吉田 優", avatar: "/japanese-teenager.jpg" },
    views: 156,
    likes: 45,
    comments: 18,
    liked: true,
    viewers: [
      { name: "清水 真理", time: "15分前" },
      { name: "池田 剛", time: "2時間前" },
      { name: "橋本 沙織", time: "5時間前" },
    ],
  },
]

export function AlbumGrid() {
  const [mediaItems, setMediaItems] = useState(mockMedia)

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              liked: !item.liked,
              likes: item.liked ? item.likes - 1 : item.likes + 1,
            }
          : item,
      ),
    )
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 p-8 border-2 border-dashed border-border rounded-lg hover:border-foreground/30 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-3">
          <div className="p-3 rounded-full bg-secondary group-hover:bg-foreground group-hover:text-background transition-colors">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-sm">Upload Photo</p>
            <p className="text-xs text-muted-foreground mt-0.5">Share your memories</p>
          </div>
        </div>

        <div className="flex-1 p-8 border-2 border-dashed border-border rounded-lg hover:border-foreground/30 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-3">
          <div className="p-3 rounded-full bg-secondary group-hover:bg-foreground group-hover:text-background transition-colors">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-sm">Upload Video</p>
            <p className="text-xs text-muted-foreground mt-0.5">Share video moments</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Shared memories</p>
        <h2 className="text-2xl font-serif">みんなの思い出</h2>
      </div>

      {/* Media Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {mediaItems.map((media) => (
          <div key={media.id} className="group cursor-pointer">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted mb-4">
              <img
                src={media.url || "/placeholder.svg"}
                alt={media.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {media.type === "video" && (
                <Badge className="absolute top-3 right-3 bg-foreground/80 text-background backdrop-blur-sm rounded-full text-xs">
                  <Video className="h-3 w-3 mr-1" />
                  Video
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium">{media.title}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{media.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5 border border-border">
                  <AvatarImage src={media.uploadedBy.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-[10px]">{media.uploadedBy.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{media.uploadedBy.name}</span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1.5 text-xs"
                  onClick={(e) => handleLike(media.id, e)}
                >
                  <Heart className={`h-3.5 w-3.5 ${media.liked ? "fill-accent text-accent" : ""}`} />
                  {media.likes}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {media.comments}
                </Button>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                  <Eye className="h-3.5 w-3.5" />
                  {media.views}
                </span>
              </div>

              {media.viewers.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recent viewers</p>
                  <div className="space-y-1.5">
                    {media.viewers.slice(0, 3).map((viewer, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span>{viewer.name}</span>
                        <span className="text-muted-foreground">{viewer.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
