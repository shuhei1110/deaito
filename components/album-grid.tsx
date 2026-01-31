"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Heart, MessageCircle, Calendar, Video, ImageIcon } from "lucide-react"
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-dashed border-primary/50 hover:border-primary transition-colors cursor-pointer group">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="bg-primary/20 p-4 rounded-full group-hover:scale-110 transition-transform">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">写真をアップロード</h3>
              <p className="text-sm text-muted-foreground">クリックして思い出の写真を共有</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-dashed border-accent/50 hover:border-accent transition-colors cursor-pointer group">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="bg-accent/20 p-4 rounded-full group-hover:scale-110 transition-transform">
              <Video className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">動画をアップロード</h3>
              <p className="text-sm text-muted-foreground">クリックして思い出の動画を共有</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-balance mb-2">みんなの思い出</h2>
        <p className="text-muted-foreground text-sm">クラスメイトがアップロードした写真・動画</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mediaItems.map((media) => (
          <Card key={media.id} className="overflow-hidden hover:shadow-lg transition-all hover:border-primary/50">
            <div className="relative aspect-video overflow-hidden bg-muted cursor-pointer group">
              <img
                src={media.url || "/placeholder.svg"}
                alt={media.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {media.type === "video" && (
                <Badge className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm">
                  <Video className="h-3 w-3 mr-1" />
                  動画
                </Badge>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                <h3 className="font-semibold text-white text-balance">{media.title}</h3>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline">{media.school}</Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {media.date}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={media.uploadedBy.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{media.uploadedBy.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{media.uploadedBy.name}</span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 hover:text-destructive"
                  onClick={(e) => handleLike(media.id, e)}
                >
                  <Heart className={`h-4 w-4 ${media.liked ? "fill-destructive text-destructive" : ""}`} />
                  <span className="text-sm">{media.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{media.comments}</span>
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                  <Eye className="h-4 w-4" />
                  {media.views}
                </div>
              </div>

              {media.viewers.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">最近閲覧した人</p>
                  <div className="space-y-1">
                    {media.viewers.slice(0, 3).map((viewer, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-foreground">{viewer.name}</span>
                        <span className="text-muted-foreground">{viewer.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
