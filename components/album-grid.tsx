"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Video, ImageIcon, Heart, Eye, GitBranch } from "lucide-react"

const mockMedia = [
  {
    id: 1,
    type: "image",
    url: "/graduation-ceremony-group-photo.jpg",
    title: "卒業式の集合写真",
    eventId: "graduation",
    eventName: "卒業式",
    date: "2017年3月",
    views: 45,
    likes: 12,
  },
  {
    id: 2,
    type: "video",
    url: "/sports-day-video-thumbnail.jpg",
    title: "体育祭のリレー",
    eventId: "sports-2014-relay",
    eventName: "クラス対抗リレー",
    date: "2014年9月",
    views: 78,
    likes: 23,
  },
  {
    id: 3,
    type: "image",
    url: "/school-trip-mountain.jpg",
    title: "修学旅行 in 京都",
    eventId: "trip-2015-day1",
    eventName: "1日目 - 京都",
    date: "2015年6月",
    views: 92,
    likes: 31,
  },
  {
    id: 4,
    type: "image",
    url: "/school-festival-stage-performance.jpg",
    title: "文化祭のバンド演奏",
    eventId: "culture-2014-stage",
    eventName: "ステージ発表",
    date: "2014年11月",
    views: 156,
    likes: 45,
  },
  {
    id: 5,
    type: "image",
    url: "/graduation-ceremony-group-photo.jpg",
    title: "入学式の記念撮影",
    eventId: "entrance-class",
    eventName: "クラス写真撮影",
    date: "2014年4月",
    views: 67,
    likes: 28,
  },
  {
    id: 6,
    type: "video",
    url: "/school-festival-stage-performance.jpg",
    title: "応援合戦の様子",
    eventId: "sports-2014-cheer",
    eventName: "応援合戦",
    date: "2014年9月",
    views: 89,
    likes: 34,
  },
]

interface AlbumGridProps {
  albumId?: string
}

export function AlbumGrid({ albumId = "1" }: AlbumGridProps) {
  // Shuffle media for random display
  const shuffledMedia = [...mockMedia].sort(() => Math.random() - 0.5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-foreground/50 mb-2">
          <ImageIcon className="w-4 h-4" />
          <span>ギャラリー</span>
        </div>
        <p className="text-sm text-foreground/60">
          タップしてイベントに移動
        </p>
      </div>

      {/* Masonry-style Grid */}
      <div className="grid grid-cols-2 gap-3">
        {shuffledMedia.map((media, index) => (
          <Link
            key={media.id}
            href={`/album/${albumId}/event/${media.eventId}`}
            className={`group relative overflow-hidden rounded-xl bg-foreground/5 ${
              index % 3 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
            }`}
          >
            {/* Image */}
            <img
              src={media.url || "/placeholder.svg"}
              alt={media.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Video badge */}
            {media.type === "video" && (
              <Badge className="absolute top-2 right-2 bg-foreground/80 text-background backdrop-blur-sm rounded-full text-[10px] px-1.5 py-0.5">
                <Video className="h-3 w-3" />
              </Badge>
            )}
            
            {/* Info overlay on hover */}
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center gap-1 text-white/90 text-[10px] mb-1">
                <GitBranch className="w-3 h-3" />
                <span className="truncate">{media.eventName}</span>
              </div>
              <p className="text-white text-xs font-medium truncate">{media.title}</p>
              <div className="flex items-center gap-3 mt-1.5 text-white/70 text-[10px]">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {media.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {media.likes}
                </span>
              </div>
            </div>
            
            {/* Subtle event indicator */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-2 py-1 text-[10px] bg-white/20 backdrop-blur-sm text-white rounded-full">
                {media.date}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
