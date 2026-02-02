"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ChevronDown, GitBranch, ImageIcon, Video, Calendar, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Branch node type - Event based
interface BranchNode {
  id: string
  name: string
  date: string
  description?: string
  imageCount: number
  videoCount: number
  thumbnail?: string
  children: BranchNode[]
}

// Sample data - Event-based tree structure
const sampleBranchData: BranchNode = {
  id: "root",
  name: "桜ヶ丘高校 3年A組",
  date: "2014年 - 2017年",
  description: "3年間の思い出",
  imageCount: 342,
  videoCount: 28,
  thumbnail: "/graduation-ceremony-group-photo.jpg",
  children: [
    {
      id: "entrance",
      name: "入学式",
      date: "2014年4月8日",
      imageCount: 45,
      videoCount: 3,
      thumbnail: "/school-trip-mountain.jpg",
      children: [
        {
          id: "entrance-ceremony",
          name: "式典",
          date: "2014年4月8日 午前",
          imageCount: 18,
          videoCount: 1,
          children: []
        },
        {
          id: "entrance-class",
          name: "クラス写真撮影",
          date: "2014年4月8日 午後",
          imageCount: 12,
          videoCount: 0,
          children: []
        },
        {
          id: "entrance-after",
          name: "下校",
          date: "2014年4月8日 夕方",
          imageCount: 8,
          videoCount: 1,
          children: []
        },
        {
          id: "entrance-prep",
          name: "会場準備",
          date: "2014年4月7日",
          imageCount: 7,
          videoCount: 1,
          children: []
        }
      ]
    },
    {
      id: "sports-2014",
      name: "体育祭",
      date: "2014年9月15日",
      imageCount: 67,
      videoCount: 8,
      thumbnail: "/sports-day-video-thumbnail.jpg",
      children: [
        {
          id: "sports-2014-relay",
          name: "クラス対抗リレー",
          date: "2014年9月15日",
          imageCount: 24,
          videoCount: 3,
          children: []
        },
        {
          id: "sports-2014-cheer",
          name: "応援合戦",
          date: "2014年9月15日",
          imageCount: 18,
          videoCount: 2,
          children: []
        },
        {
          id: "sports-2014-awards",
          name: "表彰式",
          date: "2014年9月15日",
          imageCount: 12,
          videoCount: 1,
          children: []
        }
      ]
    },
    {
      id: "culture-2014",
      name: "文化祭",
      date: "2014年11月3日",
      imageCount: 89,
      videoCount: 6,
      thumbnail: "/school-festival-stage-performance.jpg",
      children: [
        {
          id: "culture-2014-stage",
          name: "ステージ発表",
          date: "2014年11月3日",
          imageCount: 34,
          videoCount: 3,
          children: []
        },
        {
          id: "culture-2014-class",
          name: "クラス展示",
          date: "2014年11月3日",
          imageCount: 28,
          videoCount: 1,
          children: []
        },
        {
          id: "culture-2014-prep",
          name: "準備期間",
          date: "2014年10月28日-11月2日",
          imageCount: 27,
          videoCount: 2,
          children: []
        }
      ]
    },
    {
      id: "trip-2015",
      name: "修学旅行",
      date: "2015年6月10日-12日",
      imageCount: 112,
      videoCount: 8,
      thumbnail: "/school-trip-mountain.jpg",
      children: [
        {
          id: "trip-2015-day1",
          name: "1日目 - 京都",
          date: "2015年6月10日",
          imageCount: 38,
          videoCount: 2,
          children: []
        },
        {
          id: "trip-2015-day2",
          name: "2日目 - 奈良",
          date: "2015年6月11日",
          imageCount: 35,
          videoCount: 3,
          children: []
        },
        {
          id: "trip-2015-day3",
          name: "3日目 - 大阪",
          date: "2015年6月12日",
          imageCount: 39,
          videoCount: 3,
          children: []
        }
      ]
    },
    {
      id: "sports-2015",
      name: "体育祭",
      date: "2015年9月14日",
      imageCount: 58,
      videoCount: 5,
      children: []
    },
    {
      id: "culture-2015",
      name: "文化祭",
      date: "2015年11月2日",
      imageCount: 72,
      videoCount: 4,
      children: []
    },
    {
      id: "sports-2016",
      name: "体育祭",
      date: "2016年9月12日",
      imageCount: 45,
      videoCount: 4,
      children: []
    },
    {
      id: "culture-2016",
      name: "文化祭",
      date: "2016年11月5日",
      imageCount: 68,
      videoCount: 5,
      children: []
    },
    {
      id: "graduation",
      name: "卒業式",
      date: "2017年3月15日",
      imageCount: 78,
      videoCount: 7,
      thumbnail: "/graduation-ceremony-group-photo.jpg",
      children: [
        {
          id: "graduation-ceremony",
          name: "式典",
          date: "2017年3月15日 午前",
          imageCount: 32,
          videoCount: 3,
          children: []
        },
        {
          id: "graduation-photo",
          name: "記念撮影",
          date: "2017年3月15日 午後",
          imageCount: 24,
          videoCount: 1,
          children: []
        },
        {
          id: "graduation-party",
          name: "謝恩会",
          date: "2017年3月15日 夕方",
          imageCount: 22,
          videoCount: 3,
          children: []
        }
      ]
    }
  ]
}

interface BranchNodeProps {
  node: BranchNode
  depth: number
  albumId: string
}

function BranchNodeItem({ node, depth, albumId }: BranchNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children.length > 0
  const isRoot = depth === 0
  
  return (
    <div className="relative">
      {/* Branch line for non-root */}
      {!isRoot && (
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60" />
      )}
      
      {/* Node content */}
      <div className={cn("relative", !isRoot && "ml-4 pl-4")}>
        {/* Horizontal connector */}
        {!isRoot && (
          <div className="absolute left-0 top-6 w-4 h-px bg-border/60" />
        )}
        
        {/* Event card */}
        <div className={cn(
          "relative rounded-xl border border-border/50 bg-card/50 overflow-hidden",
          "transition-all duration-200 hover:border-border",
          isRoot && "border-accent/30 bg-accent/5"
        )}>
          {/* Main content - always visible */}
          <div className="p-3">
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              {node.thumbnail ? (
                <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-foreground/5">
                  <Image
                    src={node.thumbnail || "/placeholder.svg"}
                    alt={node.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-foreground/30" />
                </div>
              )}
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className={cn(
                      "font-medium truncate",
                      isRoot ? "text-base" : "text-sm"
                    )}>
                      {node.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-foreground/50">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{node.date}</span>
                    </div>
                  </div>
                  
                  {isRoot && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-[10px] bg-accent/20 text-accent-foreground rounded-full">
                      main
                    </span>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-3 mt-2 text-xs text-foreground/50">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {node.imageCount}
                  </span>
                  {node.videoCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {node.videoCount}
                    </span>
                  )}
                  {hasChildren && (
                    <span className="flex items-center gap-1 text-accent">
                      <GitBranch className="w-3 h-3" />
                      {node.children.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
              {/* Navigate to event */}
              <Link
                href={`/album/${albumId}/event/${node.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                <span>イベントを見る</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              
              {/* Expand children */}
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>閉じる</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>子イベント ({node.children.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Children - expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {node.children.map((child) => (
              <BranchNodeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                albumId={albumId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface AlbumBranchTreeProps {
  albumId?: string
}

export function AlbumBranchTree({ albumId = "1" }: AlbumBranchTreeProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-foreground/50">
        <GitBranch className="w-4 h-4" />
        <span>イベントツリー</span>
      </div>
      
      {/* Tree visualization */}
      <div className="space-y-3">
        {/* Root node */}
        <BranchNodeItem
          node={sampleBranchData}
          depth={0}
          albumId={albumId}
        />
        
        {/* Event branches */}
        <div className="relative pl-4">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60" />
          <div className="space-y-3 pl-4">
            {sampleBranchData.children.map((child) => (
              <BranchNodeItem
                key={child.id}
                node={child}
                depth={1}
                albumId={albumId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
