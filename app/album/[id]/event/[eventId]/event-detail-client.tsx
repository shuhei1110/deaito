"use client"

import { useState, useTransition, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
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
  Plus,
  Upload,
  Calendar,
  GitBranch,
  Camera,
  Film,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventRow, MediaAssetRow, UserAlbumRole } from "@/lib/album-types"
import { MediaViewer } from "@/components/media-viewer"
import { createEventAction } from "@/app/album/[id]/actions"

/** 日付フォーマット */
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

// クライアント側の MIME / サイズ定数
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"]
const IMAGE_MAX_BYTES = 20 * 1024 * 1024
const VIDEO_MAX_BYTES = 200 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

function UploadModal({
  open,
  onClose,
  albumId,
  eventId,
  eventName,
}: {
  open: boolean
  onClose: () => void
  albumId: string
  eventId: string
  eventName: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [quota, setQuota] = useState<{ usedBytes: number; quotaBytes: number } | null>(null)

  // クォータ取得
  useEffect(() => {
    if (!open) return
    fetch("/api/uploads/quota")
      .then((res) => res.json())
      .then((data) => {
        if (data.quotaBytes != null) setQuota({ usedBytes: data.usedBytes, quotaBytes: data.quotaBytes })
      })
      .catch(() => {})
  }, [open])

  const reset = useCallback(() => {
    setUploadType(null)
    setSelectedFiles([])
    setStatus("idle")
    setProgress(0)
    setCurrentFileIndex(0)
    setErrorMessage("")
  }, [])

  const handleClose = useCallback(() => {
    if (status === "uploading") return
    reset()
    onClose()
  }, [status, reset, onClose])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      if (files.length === 0) return

      const allowed = uploadType === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES
      const maxBytes = uploadType === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES

      const errors: string[] = []
      const valid: File[] = []

      for (const file of files) {
        if (!allowed.includes(file.type)) {
          errors.push(`${file.name}: サポートされていないファイル形式です`)
        } else if (file.size > maxBytes) {
          errors.push(`${file.name}: ファイルサイズが上限(${Math.round(maxBytes / (1024 * 1024))}MB)を超えています`)
        } else {
          valid.push(file)
        }
      }

      if (errors.length > 0) {
        setErrorMessage(errors.join("\n"))
      } else {
        setErrorMessage("")
      }

      setSelectedFiles(valid)
    },
    [uploadType]
  )

  const uploadFile = useCallback(
    async (file: File): Promise<boolean> => {
      // 1. Reserve
      const reserveRes = await fetch("/api/uploads/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId,
          eventId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      })

      if (!reserveRes.ok) {
        const err = await reserveRes.json()
        throw new Error(err.message ?? "予約に失敗しました")
      }

      const { signedUrl, objectPath, mediaType } = await reserveRes.json()

      // 2. Upload to GCS via XHR (for progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", signedUrl)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`アップロードに失敗しました (${xhr.status})`))
        }
        xhr.onerror = () => reject(new Error("ネットワークエラーが発生しました"))
        xhr.send(file)
      })

      // 3. Complete
      const completeRes = await fetch("/api/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId, eventId, objectPath, mediaType, mimeType: file.type }),
      })

      if (!completeRes.ok) {
        const err = await completeRes.json()
        throw new Error(err.message ?? "完了処理に失敗しました")
      }

      return true
    },
    [albumId, eventId]
  )

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return

    setStatus("uploading")
    setProgress(0)
    setCurrentFileIndex(0)
    setErrorMessage("")

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFileIndex(i)
        setProgress(0)
        await uploadFile(selectedFiles[i])
      }
      setStatus("success")
      // クォータ再取得
      fetch("/api/uploads/quota")
        .then((res) => res.json())
        .then((data) => {
          if (data.quotaBytes != null) setQuota({ usedBytes: data.usedBytes, quotaBytes: data.quotaBytes })
        })
        .catch(() => {})
    } catch (err) {
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "アップロードに失敗しました")
    }
  }, [selectedFiles, uploadFile])

  const handleDone = useCallback(() => {
    reset()
    onClose()
    router.refresh()
  }, [reset, onClose, router])

  const acceptTypes =
    uploadType === "image"
      ? ALLOWED_IMAGE_TYPES.join(",")
      : ALLOWED_VIDEO_TYPES.join(",")

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>メディアを追加</DialogTitle>
          <DialogDescription>
            「{eventName}」に写真・動画を追加します
          </DialogDescription>
        </DialogHeader>

        {/* クォータ表示 */}
        {quota && (
          <div className="px-1">
            <div className="flex items-center justify-between text-xs text-foreground/50 mb-1">
              <span>使用量</span>
              <span>{formatBytes(quota.usedBytes)} / {formatBytes(quota.quotaBytes)}</span>
            </div>
            <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${Math.min(100, (quota.usedBytes / quota.quotaBytes) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: 種類選択 */}
        {!uploadType && status === "idle" && (
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
        )}

        {/* Step 2: ファイル選択 */}
        {uploadType && status === "idle" && (
          <div className="space-y-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptTypes}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border hover:border-accent rounded-xl p-6 text-center transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-foreground/40" />
              <p className="text-sm text-foreground/60">
                タップして{uploadType === "image" ? "写真" : "動画"}を選択
              </p>
              <p className="text-xs text-foreground/40 mt-1">
                {uploadType === "image" ? "JPEG, PNG, WebP, HEIC (最大20MB)" : "MP4, MOV, WebM (最大200MB)"}
              </p>
            </button>

            {/* 選択済みファイルプレビュー */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-3 p-2 rounded-lg bg-foreground/5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {uploadType === "image" ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="w-4 h-4 text-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-foreground/50">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="text-foreground/30 hover:text-foreground/60"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap">{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: アップロード中 */}
        {status === "uploading" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-accent animate-spin" />
              <p className="text-sm font-medium">
                アップロード中... ({currentFileIndex + 1}/{selectedFiles.length})
              </p>
              <p className="text-xs text-foreground/50 mt-1">
                {selectedFiles[currentFileIndex]?.name}
              </p>
            </div>
            <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs text-foreground/50">{progress}%</p>
          </div>
        )}

        {/* 完了 */}
        {status === "success" && (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500" />
            <p className="text-sm font-medium">アップロード完了</p>
            <p className="text-xs text-foreground/50 mt-1">
              {selectedFiles.length}件のファイルをアップロードしました
            </p>
          </div>
        )}

        {/* エラー */}
        {status === "error" && (
          <div className="py-4 space-y-3">
            <div className="text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-destructive" />
              <p className="text-sm font-medium">アップロードに失敗しました</p>
            </div>
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {status === "idle" && uploadType && (
            <>
              <Button variant="outline" onClick={() => { setUploadType(null); setSelectedFiles([]); setErrorMessage("") }}>
                戻る
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0}
              >
                アップロード ({selectedFiles.length})
              </Button>
            </>
          )}
          {status === "idle" && !uploadType && (
            <Button variant="outline" onClick={handleClose}>
              閉じる
            </Button>
          )}
          {status === "success" && (
            <Button onClick={handleDone}>閉じる</Button>
          )}
          {status === "error" && (
            <>
              <Button variant="outline" onClick={reset}>
                やり直す
              </Button>
              <Button variant="outline" onClick={handleClose}>
                閉じる
              </Button>
            </>
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
  albumId,
  parentEventId,
  parentEventName,
}: {
  open: boolean
  onClose: () => void
  albumId: string
  parentEventId: string
  parentEventName: string
}) {
  const router = useRouter()
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
        onClose()
        router.refresh()
      }
    })
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
            <Label>日付</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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

// 子イベントカード
function ChildEventCard({ event, albumId }: { event: EventRow; albumId: string }) {
  const dateStr = formatEventDate(event.starts_at, event.ends_at)

  return (
    <Link
      href={`/album/${albumId}/event/${event.id}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:border-accent/50 hover:bg-accent/5 transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
        <GitBranch className="w-4 h-4 text-foreground/30" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{event.name}</h4>
        {dateStr && (
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-foreground/50">
            <Calendar className="w-3 h-3" />
            <span>{dateStr}</span>
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-foreground/30 flex-shrink-0" />
    </Link>
  )
}

export function EventDetailClient({
  albumId,
  albumName,
  event,
  childEvents,
  media: initialMedia,
  userRole,
  currentUserId,
  userProfile,
  notificationCount,
}: {
  albumId: string
  albumName: string
  event: EventRow
  childEvents: EventRow[]
  media: MediaAssetRow[]
  userRole: UserAlbumRole
  currentUserId: string
  userProfile: TopBarProfile
  notificationCount: number
}) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [createBranchOpen, setCreateBranchOpen] = useState(false)
  const [showChildren, setShowChildren] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [media, setMedia] = useState(initialMedia)

  const canEdit = userRole !== null // 全メンバーがイベント作成・アップロード可能
  const hasChildren = childEvents.length > 0
  const dateStr = formatEventDate(event.starts_at, event.ends_at)
  const imageCount = media.filter((m) => m.media_type === "image").length
  const videoCount = media.filter((m) => m.media_type === "video").length

  return (
    <>
      <IOSLayout
        breadcrumbs={[
          { label: "ホーム", href: "/" },
          { label: "アルバム", href: "/albums" },
          { label: albumName, href: `/album/${albumId}` },
          { label: event.name },
        ]}
        userProfile={userProfile}
        notificationCount={notificationCount}
      >
        {/* ヘッダー */}
        <div className="py-4">
          <div className="flex items-center gap-2 text-xs text-foreground/50 mb-2">
            <GitBranch className="w-4 h-4" />
            <span>{albumName}</span>
          </div>
          <h2 className="text-xl font-serif font-light mb-1">{event.name}</h2>
          {dateStr && (
            <div className="flex items-center gap-1.5 text-foreground/50 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{dateStr}</span>
            </div>
          )}
          {event.description && (
            <p className="text-foreground/60 text-sm mt-2">{event.description}</p>
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
              <ChevronRight
                className={cn("w-3 h-3 transition-transform", showChildren && "rotate-90")}
              />
            </button>
          )}
        </div>

        {/* 子イベントツリー */}
        {hasChildren && showChildren && (
          <div className="mb-6 p-4 rounded-xl bg-foreground/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-foreground/50">
                <GitBranch className="w-4 h-4" />
                <span>子イベント</span>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setCreateBranchOpen(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs text-foreground/60 hover:text-foreground bg-background hover:bg-foreground/5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>追加</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              {childEvents.map((child) => (
                <ChildEventCard key={child.id} event={child} albumId={albumId} />
              ))}
            </div>
          </div>
        )}

        {/* 子イベントがない場合のブランチ追加ボタン */}
        {!hasChildren && canEdit && (
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

        {/* ギャラリー */}
        <div className="flex items-center gap-2 text-xs text-foreground/50 mb-3">
          <ImageIcon className="w-4 h-4" />
          <span>ギャラリー</span>
        </div>

        {media.length === 0 ? (
          <div className="py-12 text-center pb-24">
            <Camera className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
            <p className="text-foreground/40 text-sm mb-1">まだ写真・動画がありません</p>
            <p className="text-foreground/30 text-xs">右下のボタンからアップロードしましょう</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-1.5 pb-24">
            {media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setViewerIndex(index)
                  setViewerOpen(true)
                }}
                className="relative break-inside-avoid mb-1.5 rounded-xl overflow-hidden bg-foreground/5 block w-full text-left group"
              >
                {item.media_type === "video" ? (
                  <>
                    <video
                      src={item.object_path}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : item.thumbnail_path || item.object_path ? (
                  <img
                    src={item.thumbnail_path ?? item.object_path}
                    alt=""
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-foreground/20" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </IOSLayout>

      {/* Media Viewer */}
      <MediaViewer
        media={media}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        currentUserId={currentUserId}
        currentUserRole={userRole}
        onMediaDeleted={(mediaId) => {
          setMedia((prev) => prev.filter((m) => m.id !== mediaId))
        }}
      />

      {/* FAB */}
      {canEdit && (
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:bg-accent/90 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* アップロードモーダル */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        albumId={albumId}
        eventId={event.id}
        eventName={event.name}
      />

      {/* 子ブランチ作成モーダル */}
      <CreateBranchModal
        open={createBranchOpen}
        onClose={() => setCreateBranchOpen(false)}
        albumId={albumId}
        parentEventId={event.id}
        parentEventName={event.name}
      />
    </>
  )
}
