"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ChevronDown, GitBranch, ImageIcon, Video, Calendar, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  isLast?: boolean
  onAddEvent?: (parentId: string) => void
}

// イベント追加ダイアログ
function AddEventDialog({ 
  parentName, 
  onAdd, 
  trigger 
}: { 
  parentName: string
  onAdd: (name: string, date: string) => void
  trigger: React.ReactNode 
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [date, setDate] = useState("")

  const handleSubmit = () => {
    if (name && date) {
      onAdd(name, date)
      setName("")
      setDate("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>イベントを追加</DialogTitle>
          <DialogDescription>
            「{parentName}」に新しいイベント（ブランチ）を作成します
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="event-name">イベント名</Label>
            <Input
              id="event-name"
              placeholder="例: クラス写真撮影"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-date">日付</Label>
            <Input
              id="event-date"
              placeholder="例: 2024年4月8日"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !date}>
            作成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BranchNodeItem({ node, depth, albumId, isLast = false, onAddEvent }: BranchNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children.length > 0
  const isRoot = depth === 0
  
  return (
    <div className="relative">
      {/* 縦の罫線 - 最後のアイテム以外で表示 */}
      {!isRoot && !isLast && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60" style={{ left: "-16px" }} />
      )}
      {/* 縦の罫線 - 最後のアイテムは中間まで */}
      {!isRoot && isLast && (
        <div className="absolute w-px bg-border/60" style={{ left: "-16px", top: 0, height: "24px" }} />
      )}
      
      {/* 横のコネクター */}
      {!isRoot && (
        <div className="absolute top-6 h-px bg-border/60" style={{ left: "-16px", width: "16px" }} />
      )}
      
      {/* イベントカード */}
      <div className={cn(
        "relative rounded-xl border border-border/50 bg-card/50 overflow-hidden",
        "transition-all duration-200 hover:border-accent/50 hover:bg-accent/5",
        isRoot && "border-accent/30 bg-accent/5"
      )}>
        <div className="p-3">
          <div className="flex items-center gap-3">
            {/* Thumbnail - リンク付き */}
            <Link href={`/album/${albumId}/event/${node.id}`} className="flex-shrink-0">
              {node.thumbnail ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-foreground/5">
                  <Image
                    src={node.thumbnail || "/placeholder.svg"}
                    alt={node.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-foreground/30" />
                </div>
              )}
            </Link>
            
            {/* Info - リンク付き */}
            <Link href={`/album/${albumId}/event/${node.id}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "font-medium truncate",
                  isRoot ? "text-sm" : "text-sm"
                )}>
                  {node.name}
                </h3>
                {isRoot && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] bg-accent/20 text-accent-foreground rounded-full">
                    main
                  </span>
                )}
              </div>
              
              {/* Stats inline */}
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-foreground/50">
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" />
                  {node.date}
                </span>
                <span className="text-foreground/30">·</span>
                <span className="flex items-center gap-0.5">
                  <ImageIcon className="w-3 h-3" />
                  {node.imageCount}
                </span>
                {node.videoCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Video className="w-3 h-3" />
                    {node.videoCount}
                  </span>
                )}
              </div>
            </Link>
            
            {/* 展開ボタン */}
            {hasChildren && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-foreground/50" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-foreground/50" />
                )}
              </button>
            )}
            
            {/* 子がない場合はプラスボタン */}
            {!hasChildren && onAddEvent && (
              <AddEventDialog
                parentName={node.name}
                onAdd={(name, date) => console.log("Add event:", name, date, "to", node.id)}
                trigger={
                  <button
                    type="button"
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-foreground/40" />
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>
      
      {/* 子イベント */}
      {hasChildren && isExpanded && (
        <div className="relative mt-2 ml-6 space-y-2">
          {/* 縦の罫線 */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60" style={{ left: "-16px" }} />
          
          {node.children.map((child, index) => (
            <BranchNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              albumId={albumId}
              isLast={index === node.children.length - 1}
              onAddEvent={onAddEvent}
            />
          ))}
          
          {/* 子イベント追加ボタン */}
          {onAddEvent && (
            <AddEventDialog
              parentName={node.name}
              onAdd={(name, date) => console.log("Add event:", name, date, "to", node.id)}
              trigger={
                <button
                  type="button"
                  className="relative flex items-center gap-2 ml-0 py-1.5 px-3 text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
                >
                  {/* コネクター */}
                  <div className="absolute h-px bg-border/60" style={{ left: "-16px", top: "50%", width: "16px" }} />
                  <Plus className="w-3 h-3" />
                  <span>イベントを追加</span>
                </button>
              }
            />
          )}
        </div>
      )}
    </div>
  )
}

interface AlbumBranchTreeProps {
  albumId?: string
}

export function AlbumBranchTree({ albumId = "1" }: AlbumBranchTreeProps) {
  const handleAddEvent = (parentId: string) => {
    console.log("Add event to:", parentId)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <GitBranch className="w-4 h-4" />
          <span>イベントツリー</span>
        </div>
        
        {/* ルートにイベント追加ボタン */}
        <AddEventDialog
          parentName={sampleBranchData.name}
          onAdd={(name, date) => console.log("Add root event:", name, date)}
          trigger={
            <button
              type="button"
              className="flex items-center gap-1.5 py-1.5 px-3 text-xs text-foreground/60 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>イベント追加</span>
            </button>
          }
        />
      </div>
      
      {/* Tree visualization */}
      <div className="space-y-2">
        {/* Root node */}
        <BranchNodeItem
          node={sampleBranchData}
          depth={0}
          albumId={albumId}
          onAddEvent={handleAddEvent}
        />
        
        {/* Event branches */}
        <div className="relative ml-6 space-y-2">
          {/* 縦の罫線 */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60" style={{ left: "-16px" }} />
          
          {sampleBranchData.children.map((child, index) => (
            <BranchNodeItem
              key={child.id}
              node={child}
              depth={1}
              albumId={albumId}
              isLast={index === sampleBranchData.children.length - 1}
              onAddEvent={handleAddEvent}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
