"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import { IOSLayout } from "@/components/ios-navigation"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import { 
  Video, 
  ImageIcon, 
  Heart, 
  Eye, 
  Plus, 
  Upload, 
  X, 
  Calendar,
  GitBranch,
  Camera,
  Film,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

// アルバムデータのマッピング
const albumsData: Record<string, { name: string; year: string }> = {
  "1": { name: "桜ヶ丘高校 3年A組", year: "2017" },
  "2": { name: "東京大学工学部", year: "2021" },
  "3": { name: "桜丘中学校", year: "2014" },
  "4": { name: "桜丘小学校", year: "2011" },
  "5": { name: "さくら幼稚園", year: "2005" },
  "6": { name: "渋谷区立第一中", year: "2012" },
  "7": { name: "明治学院大学", year: "2019" },
  "8": { name: "港区立白金小", year: "2009" },
  "9": { name: "慶應義塾高校", year: "2016" },
  "10": { name: "早稲田実業学校", year: "2015" },
}

// イベントデータのマッピング（子イベント情報を含む）
const eventsData: Record<string, { name: string; date: string; description?: string; children?: string[] }> = {
  "root": { name: "アルバム", date: "", children: ["entrance", "sports-2014", "culture-2014", "trip-2015", "sports-2015", "culture-2015", "sports-2016", "culture-2016", "graduation"] },
  "entrance": { name: "入学式", date: "2014年4月8日", children: ["entrance-ceremony", "entrance-class", "entrance-after", "entrance-prep"] },
  "entrance-ceremony": { name: "式典", date: "2014年4月8日 午前" },
  "entrance-class": { name: "クラス写真撮影", date: "2014年4月8日 午後" },
  "entrance-after": { name: "下校", date: "2014年4月8日 夕方" },
  "entrance-prep": { name: "会場準備", date: "2014年4月7日" },
  "sports-2014": { name: "体育祭", date: "2014年9月15日", children: ["sports-2014-relay", "sports-2014-cheer", "sports-2014-awards"] },
  "sports-2014-relay": { name: "クラス対抗リレー", date: "2014年9月15日" },
  "sports-2014-cheer": { name: "応援合戦", date: "2014年9月15日" },
  "sports-2014-awards": { name: "表彰式", date: "2014年9月15日" },
  "culture-2014": { name: "文化祭", date: "2014年11月3日", children: ["culture-2014-stage", "culture-2014-class", "culture-2014-prep"] },
  "culture-2014-stage": { name: "ステージ発表", date: "2014年11月3日" },
  "culture-2014-class": { name: "クラス展示", date: "2014年11月3日" },
  "culture-2014-prep": { name: "準備期間", date: "2014年10月28日-11月2日" },
  "trip-2015": { name: "修学旅行", date: "2015年6月10日-12日", children: ["trip-2015-day1", "trip-2015-day2", "trip-2015-day3"] },
  "trip-2015-day1": { name: "1日目 - 京都", date: "2015年6月10日" },
  "trip-2015-day2": { name: "2日目 - 奈良", date: "2015年6月11日" },
  "trip-2015-day3": { name: "3日目 - 大阪", date: "2015年6月12日" },
  "sports-2015": { name: "体育祭", date: "2015年9月14日" },
  "culture-2015": { name: "文化祭", date: "2015年11月2日" },
  "sports-2016": { name: "体育祭", date: "2016年9月12日" },
  "culture-2016": { name: "文化祭", date: "2016年11月5日" },
  "graduation": { name: "卒業式", date: "2017年3月15日", children: ["graduation-ceremony", "graduation-photo", "graduation-party"] },
  "graduation-ceremony": { name: "式典", date: "2017年3月15日 午前" },
  "graduation-photo": { name: "記念撮影", date: "2017年3月15日 午後" },
  "graduation-party": { name: "謝恩会", date: "2017年3月15日 夕方" },
}

// サンプルメディアデータ
const sampleMedia = [
  {
    id: 1,
    type: "image",
    url: "/graduation-ceremony-group-photo.jpg",
    title: "集合写真",
    date: "2014年4月8日",
    views: 45,
    likes: 12,
  },
  {
    id: 2,
    type: "image",
    url: "/school-trip-mountain.jpg",
    title: "思い出の一枚",
    date: "2014年4月8日",
    views: 92,
    likes: 31,
  },
  {
    id: 3,
    type: "image",
    url: "/school-festival-stage-performance.jpg",
    title: "みんなで撮影",
    date: "2014年4月8日",
    views: 156,
    likes: 45,
  },
  {
    id: 4,
    type: "image",
    url: "/graduation-ceremony-group-photo.jpg",
    title: "スナップ写真",
    date: "2014年4月8日",
    views: 67,
    likes: 28,
  },
  {
    id: 5,
    type: "image",
    url: "/gallery-001.png",
    title: "ギャラリー",
    date: "2014年4月8日",
    views: 34,
    likes: 8,
  },
  {
    id: 6,
    type: "image",
    url: "/gallery-002.png",
    title: "ギャラリー",
    date: "2014年4月8日",
    views: 41,
    likes: 15,
  },
  {
    id: 7,
    type: "image",
    url: "/gallery-003.png",
    title: "ギャラリー",
    date: "2014年4月8日",
    views: 52,
    likes: 19,
  },
  {
    id: 8,
    type: "image",
    url: "/gallery-005.jpeg",
    title: "ギャラリー",
    date: "2014年5月12日",
    views: 28,
    likes: 11,
  },
  {
    id: 9,
    type: "image",
    url: "/gallery-006.jpeg",
    title: "ギャラリー",
    date: "2014年5月15日",
    views: 36,
    likes: 14,
  },
  {
    id: 10,
    type: "image",
    url: "/gallery-007.jpeg",
    title: "ギャラリー",
    date: "2014年5月20日",
    views: 44,
    likes: 17,
  },
  {
    id: 11,
    type: "image",
    url: "/gallery-008.jpeg",
    title: "ギャラリー",
    date: "2014年6月3日",
    views: 39,
    likes: 12,
  },
  {
    id: 12,
    type: "image",
    url: "/gallery-009.jpeg",
    title: "ギャラリー",
    date: "2014年6月10日",
    views: 47,
    likes: 20,
  },
  {
    id: 13,
    type: "image",
    url: "/gallery-010.jpeg",
    title: "ギャラリー",
    date: "2014年6月18日",
    views: 55,
    likes: 23,
  },
  {
    id: 14,
    type: "image",
    url: "/gallery-011.jpeg",
    title: "ギャラリー",
    date: "2014年7月5日",
    views: 31,
    likes: 9,
  },
  {
    id: 15,
    type: "image",
    url: "/gallery-012.jpeg",
    title: "ギャラリー",
    date: "2014年7月12日",
    views: 42,
    likes: 16,
  },
  {
    id: 16,
    type: "image",
    url: "/gallery-013.jpeg",
    title: "ギャラリー",
    date: "2014年7月20日",
    views: 38,
    likes: 13,
  },
  {
    id: 17,
    type: "image",
    url: "/gallery-014.jpeg",
    title: "ギャラリー",
    date: "2014年8月2日",
    views: 49,
    likes: 18,
  },
  {
    id: 18,
    type: "image",
    url: "/gallery-015.jpeg",
    title: "ギャラリー",
    date: "2014年8月10日",
    views: 56,
    likes: 22,
  },
  {
    id: 19,
    type: "image",
    url: "/gallery-016.jpeg",
    title: "ギャラリー",
    date: "2014年8月18日",
    views: 33,
    likes: 10,
  },
  {
    id: 20,
    type: "image",
    url: "/gallery-017.jpeg",
    title: "ギャラリー",
    date: "2014年9月5日",
    views: 45,
    likes: 17,
  },
  {
    id: 21,
    type: "image",
    url: "/gallery-018.jpeg",
    title: "ギャラリー",
    date: "2014年9月12日",
    views: 51,
    likes: 21,
  },
  {
    id: 22,
    type: "image",
    url: "/gallery-019.jpeg",
    title: "ギャラリー",
    date: "2014年9月20日",
    views: 40,
    likes: 14,
  },
  {
    id: 23,
    type: "image",
    url: "/gallery-020.jpeg",
    title: "ギャラリー",
    date: "2014年10月3日",
    views: 48,
    likes: 19,
  },
  {
    id: 24,
    type: "image",
    url: "/gallery-021.jpeg",
    title: "ギャラリー",
    date: "2014年10月11日",
    views: 37,
    likes: 12,
  },
  {
    id: 25,
    type: "image",
    url: "/gallery-022.jpeg",
    title: "ギャラリー",
    date: "2014年10月18日",
    views: 43,
    likes: 16,
  },
  {
    id: 26,
    type: "image",
    url: "/gallery-023.jpeg",
    title: "ギャラリー",
    date: "2014年11月2日",
    views: 54,
    likes: 24,
  },
  {
    id: 27,
    type: "image",
    url: "/gallery-024.jpeg",
    title: "ギャラリー",
    date: "2014年11月10日",
    views: 35,
    likes: 11,
  },
  {
    id: 28,
    type: "image",
    url: "/gallery-025.jpeg",
    title: "ギャラリー",
    date: "2014年11月18日",
    views: 46,
    likes: 18,
  },
  {
    id: 29,
    type: "image",
    url: "/gallery-026.jpeg",
    title: "ギャラリー",
    date: "2014年12月5日",
    views: 50,
    likes: 20,
  },
  {
    id: 30,
    type: "image",
    url: "/gallery-027.jpeg",
    title: "ギャラリー",
    date: "2014年12月12日",
    views: 32,
    likes: 9,
  },
  {
    id: 31,
    type: "image",
    url: "/gallery-028.jpeg",
    title: "ギャラリー",
    date: "2014年12月20日",
    views: 41,
    likes: 15,
  },
  {
    id: 32,
    type: "image",
    url: "/gallery-029.jpeg",
    title: "ギャラリー",
    date: "2015年1月8日",
    views: 53,
    likes: 22,
  },
  {
    id: 33,
    type: "image",
    url: "/gallery-030.jpeg",
    title: "ギャラリー",
    date: "2015年1月15日",
    views: 38,
    likes: 13,
  },
  {
    id: 34,
    type: "image",
    url: "/gallery-031.jpeg",
    title: "ギャラリー",
    date: "2015年1月22日",
    views: 47,
    likes: 19,
  },
  {
    id: 35,
    type: "image",
    url: "/gallery-032.jpeg",
    title: "ギャラリー",
    date: "2015年2月5日",
    views: 44,
    likes: 17,
  },
  {
    id: 36,
    type: "image",
    url: "/gallery-033.jpeg",
    title: "ギャラリー",
    date: "2015年2月12日",
    views: 36,
    likes: 12,
  },
  {
    id: 37,
    type: "image",
    url: "/gallery-034.jpeg",
    title: "ギャラリー",
    date: "2015年2月20日",
    views: 49,
    likes: 20,
  },
  {
    id: 38,
    type: "image",
    url: "/gallery-035.jpeg",
    title: "ギャラリー",
    date: "2015年3月5日",
    views: 55,
    likes: 23,
  },
  {
    id: 39,
    type: "image",
    url: "/gallery-036.jpeg",
    title: "ギャラリー",
    date: "2015年3月12日",
    views: 31,
    likes: 10,
  },
  {
    id: 40,
    type: "image",
    url: "/gallery-037.jpeg",
    title: "ギャラリー",
    date: "2015年3月20日",
    views: 42,
    likes: 16,
  },
  {
    id: 41,
    type: "image",
    url: "/gallery-038.jpeg",
    title: "ギャラリー",
    date: "2015年4月3日",
    views: 48,
    likes: 18,
  },
  {
    id: 42,
    type: "image",
    url: "/gallery-039.jpeg",
    title: "ギャラリー",
    date: "2015年4月10日",
    views: 39,
    likes: 14,
  },
  {
    id: 43,
    type: "image",
    url: "/gallery-040.jpeg",
    title: "ギャラリー",
    date: "2015年4月18日",
    views: 52,
    likes: 21,
  },
  {
    id: 44,
    type: "image",
    url: "/gallery-041.jpeg",
    title: "ギャラリー",
    date: "2015年5月2日",
    views: 45,
    likes: 17,
  },
  {
    id: 45,
    type: "image",
    url: "/gallery-042.jpeg",
    title: "ギャラリー",
    date: "2015年5月10日",
    views: 34,
    likes: 11,
  },
  {
    id: 46,
    type: "image",
    url: "/gallery-043.jpeg",
    title: "ギャラリー",
    date: "2015年5月18日",
    views: 51,
    likes: 22,
  },
  {
    id: 47,
    type: "image",
    url: "/gallery-044.jpeg",
    title: "ギャラリー",
    date: "2015年6月5日",
    views: 40,
    likes: 15,
  },
  {
    id: 48,
    type: "image",
    url: "/gallery-045.jpeg",
    title: "ギャラリー",
    date: "2015年6月12日",
    views: 46,
    likes: 19,
  },
  {
    id: 49,
    type: "image",
    url: "/gallery-046.jpeg",
    title: "ギャラリー",
    date: "2015年6月20日",
    views: 37,
    likes: 13,
  },
]

// 配列をシャッフルする関数
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// メディア詳細モーダル
function MediaDetailModal({ 
  media, 
  onClose 
}: { 
  media: typeof sampleMedia[0] | null
  onClose: () => void 
}) {
  if (!media) return null

  return (
    <Dialog open={!!media} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
        <div className="relative">
          <img
            src={media.url}
            alt={media.title}
            className="w-full aspect-video object-cover"
          />
          {media.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-foreground ml-1" />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <DialogHeader>
            <DialogTitle className="text-lg">{media.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              {media.date}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 text-sm text-foreground/60">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {media.views} 閲覧
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              {media.likes} いいね
            </span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              閉じる
            </Button>
            <Button className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              いいね
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// アップロードモーダル
function UploadModal({ 
  open, 
  onClose,
  eventName
}: { 
  open: boolean
  onClose: () => void
  eventName: string
}) {
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null)
  const [title, setTitle] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleSubmit = () => {
    console.log("Upload:", { type: uploadType, title, files: selectedFiles })
    setUploadType(null)
    setTitle("")
    setSelectedFiles([])
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>メディアを追加</DialogTitle>
          <DialogDescription>
            「{eventName}」に写真・動画を追加します
          </DialogDescription>
        </DialogHeader>

        {!uploadType ? (
          <div className="grid grid-cols-2 gap-3 py-4">
            <button
              type="button"
              onClick={() => setUploadType("image")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm font-medium">写真</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadType("video")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Film className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm font-medium">動画</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* ファイル選択エリア */}
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept={uploadType === "image" ? "image/*" : "video/*"}
                multiple={uploadType === "image"}
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-foreground/40" />
              <p className="text-sm text-foreground/60">
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length}ファイル選択済み`
                  : "クリックしてファイルを選択"
                }
              </p>
              <p className="text-xs text-foreground/40 mt-1">
                {uploadType === "image" ? "JPG, PNG, GIF" : "MP4, MOV, WebM"}
              </p>
            </div>

            {/* タイトル入力 */}
            <div className="space-y-2">
              <Label htmlFor="media-title">タイトル</Label>
              <Input
                id="media-title"
                placeholder="例: みんなで撮った写真"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {uploadType && (
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadType(null)
                setSelectedFiles([])
              }}
            >
              戻る
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            キャンセル
          </Button>
          {uploadType && (
            <Button 
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0}
            >
              アップロード
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 子ブランチ作成モーダル
function CreateBranchModal({
  open,
  onClose,
  parentEventName
}: {
  open: boolean
  onClose: () => void
  parentEventName: string
}) {
  const [name, setName] = useState("")
  const [date, setDate] = useState("")

  const handleSubmit = () => {
    console.log("Create branch:", { name, date })
    setName("")
    setDate("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>子ブランチを作成</DialogTitle>
          <DialogDescription>
            「{parentEventName}」に新しいイベント（ブランチ）を作成します
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="branch-name">イベント名</Label>
            <Input
              id="branch-name"
              placeholder="例: 午後の部"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branch-date">日付</Label>
            <Input
              id="branch-date"
              placeholder="例: 2024年4月8日 午後"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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

// 子イベントカード
function ChildEventCard({
  eventId,
  albumId
}: {
  eventId: string
  albumId: string
}) {
  const event = eventsData[eventId]
  if (!event) return null

  const hasGrandchildren = event.children && event.children.length > 0

  return (
    <Link
      href={`/album/${albumId}/event/${eventId}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:border-accent/50 hover:bg-accent/5 transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
        <GitBranch className="w-4 h-4 text-foreground/30" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{event.name}</h4>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-foreground/50">
          <span className="flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {event.date}
          </span>
          {hasGrandchildren && (
            <>
              <span className="text-foreground/30">·</span>
              <span className="flex items-center gap-0.5 text-accent">
                <GitBranch className="w-3 h-3" />
                {event.children!.length}
              </span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-foreground/30 flex-shrink-0" />
    </Link>
  )
}

export default function EventPage({ 
  params 
}: { 
  params: Promise<{ id: string; eventId: string }> 
}) {
  const { id, eventId } = use(params)
  const [selectedMedia, setSelectedMedia] = useState<typeof sampleMedia[0] | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [createBranchOpen, setCreateBranchOpen] = useState(false)
  const [showChildren, setShowChildren] = useState(false)
  
  const album = albumsData[id] || { name: "アルバム", year: "----" }
  const event = eventsData[eventId] || { name: "イベント", date: "" }
  const childEvents = event.children || []
  const hasChildren = childEvents.length > 0

  // メディアをランダムにシャッフル（初回のみ）
  const shuffledMedia = useMemo(() => shuffleArray(sampleMedia), [])

  // 統計
  const imageCount = shuffledMedia.filter(m => m.type === "image").length
  const videoCount = shuffledMedia.filter(m => m.type === "video").length

  return (
    <>
      <IOSLayout 
        breadcrumbs={[
          { label: "ホーム", href: "/" }, 
          { label: "アルバム", href: "/albums" },
          { label: album.name, href: `/album/${id}` },
          { label: event.name }
        ]}
      >
        {/* ヘッダー */}
        <div className="py-4">
          <div className="flex items-center gap-2 text-xs text-foreground/50 mb-2">
            <GitBranch className="w-4 h-4" />
            <span>{album.name}</span>
          </div>
          <h2 className="text-xl font-serif font-light mb-1">{event.name}</h2>
          {event.date && (
            <div className="flex items-center gap-1.5 text-foreground/50 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{event.date}</span>
            </div>
          )}
        </div>

        {/* 統計 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 text-sm">
            <ImageIcon className="w-4 h-4 text-foreground/50" />
            <span>{imageCount} 枚</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 text-sm">
            <Video className="w-4 h-4 text-foreground/50" />
            <span>{videoCount} 本</span>
          </div>
          {hasChildren && (
            <button
              type="button"
              onClick={() => setShowChildren(!showChildren)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                showChildren ? "bg-accent/20 text-accent" : "bg-foreground/5 hover:bg-foreground/10"
              )}
            >
              <GitBranch className="w-4 h-4" />
              <span>{childEvents.length} ブランチ</span>
              <ChevronRight className={cn(
                "w-3 h-3 transition-transform",
                showChildren && "rotate-90"
              )} />
            </button>
          )}
        </div>

        {/* 子イベントツリー（展開時のみ表示） */}
        {hasChildren && showChildren && (
          <div className="mb-6 p-4 rounded-xl bg-foreground/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-foreground/50">
                <GitBranch className="w-4 h-4" />
                <span>子イベント</span>
              </div>
              <button
                type="button"
                onClick={() => setCreateBranchOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 text-xs text-foreground/60 hover:text-foreground bg-background hover:bg-foreground/5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>追加</span>
              </button>
            </div>
            <div className="space-y-2">
              {childEvents.map((childId) => (
                <ChildEventCard key={childId} eventId={childId} albumId={id} />
              ))}
            </div>
          </div>
        )}

        {/* 子イベントがない場合のブランチ追加ボタン */}
        {!hasChildren && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setCreateBranchOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm text-foreground/50 hover:text-foreground border border-dashed border-border hover:border-accent/50 rounded-xl transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              <span>子ブランチを作成</span>
            </button>
          </div>
        )}

        {/* ギャラリーヘッダー */}
        <div className="flex items-center gap-2 text-xs text-foreground/50 mb-3">
          <ImageIcon className="w-4 h-4" />
          <span>ギャラリー</span>
        </div>

        {/* ギャラリーグリッド */}
        <div className="grid grid-cols-2 gap-3 pb-24">
          {shuffledMedia.map((media, index) => (
            <button
              key={media.id}
              type="button"
              onClick={() => setSelectedMedia(media)}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-foreground/5 text-left",
                index % 3 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
              )}
            >
              {/* 画像 */}
              <img
                src={media.url || "/placeholder.svg"}
                alt={media.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* オーバーレイ */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* 動画バッジ */}
              {media.type === "video" && (
                <Badge className="absolute top-2 right-2 bg-foreground/80 text-background backdrop-blur-sm rounded-full text-[10px] px-1.5 py-0.5">
                  <Video className="h-3 w-3" />
                </Badge>
              )}
              
              {/* ホバー時情報 */}
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
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
            </button>
          ))}
        </div>
      </IOSLayout>

      {/* 右下の追加ボタン (FAB) */}
      <button
        type="button"
        onClick={() => setUploadOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:bg-accent/90 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* メディア詳細モーダル */}
      <MediaDetailModal 
        media={selectedMedia} 
        onClose={() => setSelectedMedia(null)} 
      />

      {/* アップロードモーダル */}
      <UploadModal 
        open={uploadOpen} 
        onClose={() => setUploadOpen(false)}
        eventName={event.name}
      />

      {/* 子ブランチ作成モーダル */}
      <CreateBranchModal
        open={createBranchOpen}
        onClose={() => setCreateBranchOpen(false)}
        parentEventName={event.name}
      />
    </>
  )
}
