"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronDown, GitBranch, ImageIcon, Video, Calendar, Plus, Loader2 } from "lucide-react"
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
import { DatePicker } from "@/components/date-picker"
import type { EventTreeNode, UserAlbumRole } from "@/lib/album-types"
import { createEventAction } from "@/app/album/[id]/actions"

/** 日付フォーマット: ISO → 日本語表示 */
function formatEventDate(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt) return ""
  const fmt = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric" })
  const start = fmt.format(new Date(startsAt))
  if (endsAt) {
    const end = fmt.format(new Date(endsAt))
    return start === end ? start : `${start} - ${end}`
  }
  return start
}

// イベント追加ダイアログ
function AddEventDialog({
  albumId,
  parentEventId,
  parentName,
  trigger,
}: {
  albumId: string
  parentEventId?: string
  parentName: string
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!name) return
    startTransition(async () => {
      const result = await createEventAction({
        albumId,
        parentEventId,
        name,
        startsAt: date || undefined,
      })
      if (!result.error) {
        setName("")
        setDate("")
        setOpen(false)
        router.refresh()
      }
    })
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
            <Label>日付</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!name || isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface BranchNodeProps {
  node: EventTreeNode
  depth: number
  albumId: string
  isLast?: boolean
  canEdit: boolean
}

function BranchNodeItem({ node, depth, albumId, isLast = false, canEdit }: BranchNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children.length > 0
  const isRoot = depth === 0
  const dateStr = formatEventDate(node.starts_at, node.ends_at)

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
            {/* Thumbnail */}
            <Link href={`/album/${albumId}/event/${node.id}`} className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-foreground/30" />
              </div>
            </Link>

            {/* Info */}
            <Link href={`/album/${albumId}/event/${node.id}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium truncate">{node.name}</h3>
                {isRoot && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] bg-accent/20 text-accent-foreground rounded-full">
                    main
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-foreground/50">
                {dateStr && (
                  <>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                    <span className="text-foreground/30">·</span>
                  </>
                )}
                <span className="flex items-center gap-0.5">
                  <ImageIcon className="w-3 h-3" />
                  {node.image_count}
                </span>
                {node.video_count > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Video className="w-3 h-3" />
                    {node.video_count}
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

            {/* 子がない場合はプラスボタン（編集権限がある場合のみ） */}
            {!hasChildren && canEdit && (
              <AddEventDialog
                albumId={albumId}
                parentEventId={node.id}
                parentName={node.name}
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
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60" style={{ left: "-16px" }} />
          {node.children.map((child, index) => (
            <BranchNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              albumId={albumId}
              isLast={index === node.children.length - 1}
              canEdit={canEdit}
            />
          ))}
          {canEdit && (
            <AddEventDialog
              albumId={albumId}
              parentEventId={node.id}
              parentName={node.name}
              trigger={
                <button
                  type="button"
                  className="relative flex items-center gap-2 ml-0 py-1.5 px-3 text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
                >
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
  albumId: string
  topLevelNodes: EventTreeNode[]
  userRole: UserAlbumRole
}

export function AlbumBranchTree({ albumId, topLevelNodes, userRole }: AlbumBranchTreeProps) {
  const canEdit = userRole !== null // 全メンバーがイベント作成可能

  // 空状態
  if (topLevelNodes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <GitBranch className="w-4 h-4" />
          <span>イベントツリー</span>
        </div>
        <div className="py-12 text-center">
          <GitBranch className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/40 text-sm mb-1">まだイベントがありません</p>
          <p className="text-foreground/30 text-xs mb-4">最初のイベントを作成して思い出を整理しましょう</p>
          {canEdit && (
            <AddEventDialog
              albumId={albumId}
              parentName="アルバム"
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  イベントを作成
                </Button>
              }
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <GitBranch className="w-4 h-4" />
          <span>イベントツリー</span>
        </div>
        {canEdit && (
          <AddEventDialog
            albumId={albumId}
            parentName="アルバム"
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
        )}
      </div>

      {/* Tree visualization */}
      <div className="space-y-2">
        {topLevelNodes.map((node, index) => (
          <BranchNodeItem
            key={node.id}
            node={node}
            depth={0}
            albumId={albumId}
            isLast={index === topLevelNodes.length - 1}
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  )
}
