"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ChevronDown, Plus, GitBranch, ImageIcon, Video, Calendar, Users, MoreHorizontal, Upload, FolderPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Branch node type
interface BranchNode {
  id: string
  name: string
  date: string
  description?: string
  imageCount: number
  videoCount: number
  memberCount?: number
  thumbnail?: string
  children: BranchNode[]
}

// Sample data - Git-like tree structure
const sampleBranchData: BranchNode = {
  id: "root",
  name: "桜ヶ丘高校 3年A組",
  date: "2017年4月",
  description: "3年間の思い出",
  imageCount: 342,
  videoCount: 28,
  memberCount: 42,
  thumbnail: "/graduation-ceremony-group-photo.jpg",
  children: [
    {
      id: "entrance",
      name: "入学式",
      date: "2014年4月",
      imageCount: 45,
      videoCount: 3,
      thumbnail: "/school-trip-mountain.jpg",
      children: []
    },
    {
      id: "year1",
      name: "1年生",
      date: "2014年",
      imageCount: 87,
      videoCount: 5,
      children: [
        {
          id: "year1-sports",
          name: "体育祭",
          date: "2014年9月",
          imageCount: 34,
          videoCount: 2,
          thumbnail: "/sports-day-video-thumbnail.jpg",
          children: [
            {
              id: "year1-sports-relay",
              name: "クラス対抗リレー",
              date: "2014年9月15日",
              imageCount: 12,
              videoCount: 1,
              children: []
            },
            {
              id: "year1-sports-cheer",
              name: "応援合戦",
              date: "2014年9月15日",
              imageCount: 8,
              videoCount: 1,
              children: []
            }
          ]
        },
        {
          id: "year1-culture",
          name: "文化祭",
          date: "2014年11月",
          imageCount: 53,
          videoCount: 3,
          thumbnail: "/school-festival-stage-performance.jpg",
          children: [
            {
              id: "year1-culture-stage",
              name: "ステージ発表",
              date: "2014年11月3日",
              imageCount: 28,
              videoCount: 2,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: "year2",
      name: "2年生",
      date: "2015年",
      imageCount: 112,
      videoCount: 8,
      children: [
        {
          id: "year2-trip",
          name: "修学旅行",
          date: "2015年6月",
          imageCount: 67,
          videoCount: 4,
          thumbnail: "/school-trip-mountain.jpg",
          children: [
            {
              id: "year2-trip-day1",
              name: "1日目 - 京都",
              date: "2015年6月10日",
              imageCount: 23,
              videoCount: 1,
              children: []
            },
            {
              id: "year2-trip-day2",
              name: "2日目 - 奈良",
              date: "2015年6月11日",
              imageCount: 21,
              videoCount: 2,
              children: []
            },
            {
              id: "year2-trip-day3",
              name: "3日目 - 大阪",
              date: "2015年6月12日",
              imageCount: 23,
              videoCount: 1,
              children: []
            }
          ]
        },
        {
          id: "year2-sports",
          name: "体育祭",
          date: "2015年9月",
          imageCount: 45,
          videoCount: 4,
          children: []
        }
      ]
    },
    {
      id: "year3",
      name: "3年生",
      date: "2016年",
      imageCount: 98,
      videoCount: 12,
      children: [
        {
          id: "year3-graduation",
          name: "卒業式",
          date: "2017年3月",
          imageCount: 56,
          videoCount: 5,
          thumbnail: "/graduation-ceremony-group-photo.jpg",
          children: [
            {
              id: "year3-graduation-ceremony",
              name: "式典",
              date: "2017年3月15日",
              imageCount: 32,
              videoCount: 3,
              children: []
            },
            {
              id: "year3-graduation-party",
              name: "謝恩会",
              date: "2017年3月15日",
              imageCount: 24,
              videoCount: 2,
              children: []
            }
          ]
        }
      ]
    }
  ]
}

interface BranchNodeProps {
  node: BranchNode
  depth: number
  isLast: boolean
  parentExpanded?: boolean[]
}

function BranchNodeItem({ node, depth, isLast, parentExpanded = [] }: BranchNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 1)
  const hasChildren = node.children.length > 0
  
  return (
    <div className="relative">
      {/* Branch line connectors */}
      <div className="absolute left-0 top-0 bottom-0 flex">
        {parentExpanded.map((expanded, i) => (
          <div 
            key={i} 
            className="w-6 flex-shrink-0 relative"
          >
            {expanded && (
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
            )}
          </div>
        ))}
        {depth > 0 && (
          <div className="w-6 flex-shrink-0 relative">
            <div className={cn(
              "absolute left-3 w-px bg-border",
              isLast ? "top-0 h-5" : "top-0 bottom-0"
            )} />
            <div className="absolute left-3 top-5 w-3 h-px bg-border" />
          </div>
        )}
      </div>
      
      {/* Node content */}
      <div 
        className={cn("relative", depth > 0 && "ml-6")}
        style={{ paddingLeft: depth > 0 ? `${(parentExpanded.length) * 24}px` : 0 }}
      >
        <div 
          className={cn(
            "group flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
            "hover:bg-foreground/5 cursor-pointer",
            depth === 0 && "bg-foreground/5"
          )}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          {/* Expand/collapse button or branch icon */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
            {hasChildren ? (
              <button
                type="button"
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-foreground/10 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-foreground/60" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-foreground/60" />
                )}
              </button>
            ) : (
              <div className="w-2 h-2 rounded-full bg-accent/60" />
            )}
          </div>
          
          {/* Thumbnail */}
          {node.thumbnail && (
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-foreground/5">
              <Image
                src={node.thumbnail || "/placeholder.svg"}
                alt={node.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-medium truncate",
                depth === 0 ? "text-base" : "text-sm"
              )}>
                {node.name}
              </h3>
              {depth === 0 && (
                <span className="flex-shrink-0 px-2 py-0.5 text-[10px] bg-accent/20 text-accent-foreground rounded-full">
                  main
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-foreground/50">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {node.date}
              </span>
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
              {node.memberCount && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {node.memberCount}
                </span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/album/1/branch/${node.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
            >
              <GitBranch className="w-4 h-4 text-foreground/60" />
            </Link>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-foreground/60" />
            </button>
          </div>
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map((child, index) => (
              <BranchNodeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                isLast={index === node.children.length - 1}
                parentExpanded={[...parentExpanded, !isLast]}
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

export function AlbumBranchTree({ albumId }: AlbumBranchTreeProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <GitBranch className="w-4 h-4" />
          <span>ブランチツリー</span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                <FolderPlus className="w-3.5 h-3.5" />
                ブランチ作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-base font-medium">新しいブランチを作成</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs text-foreground/60">ブランチ名</label>
                  <input
                    type="text"
                    placeholder="例: 体育祭2024"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-foreground/60">日付</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-foreground/60">親ブランチ</label>
                  <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50">
                    <option>main (桜ヶ丘高校 3年A組)</option>
                    <option>3年生</option>
                    <option>2年生</option>
                    <option>1年生</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCreateDialog(false)}>
                    キャンセル
                  </Button>
                  <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">
                    作成
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            アップロード
          </Button>
        </div>
      </div>
      
      {/* Tree visualization */}
      <div className="bg-card/50 rounded-2xl p-4 border border-border/50">
        <BranchNodeItem
          node={sampleBranchData}
          depth={0}
          isLast={true}
        />
      </div>
      
      {/* Fork option */}
      <div className="flex items-center justify-center pt-4">
        <Button variant="outline" size="sm" className="text-xs gap-2 bg-transparent">
          <GitBranch className="w-3.5 h-3.5" />
          このアルバムをForkして新しいアルバムを作成
        </Button>
      </div>
    </div>
  )
}
