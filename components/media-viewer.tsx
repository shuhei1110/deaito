"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  X,
  Heart,
  MessageCircle,
  User,
  GitBranch,
  Calendar,
  Eye,
  Send,
  ChevronDown,
  Trash2,
} from "lucide-react"
import type { MediaAssetRow } from "@/lib/album-types"
import {
  recordMediaViewAction,
  getMediaLikeStatusAction,
  toggleMediaLikeAction,
  getMediaCommentsAction,
  postMediaCommentAction,
  deleteMediaAction,
} from "@/app/album/[id]/media-actions"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MediaViewerProps {
  media: MediaAssetRow[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 現在のユーザーID（削除権限判定用） */
  currentUserId?: string | null
  /** 現在のユーザーのアルバム内ロール（削除権限判定用） */
  currentUserRole?: "owner" | "admin" | "member" | null
  /** メディア削除後のコールバック */
  onMediaDeleted?: (mediaId: string) => void
}

interface Comment {
  id: string
  body: string
  createdAt: string
  userName: string
}

/* ------------------------------------------------------------------ */
/*  CommentDrawer                                                      */
/* ------------------------------------------------------------------ */

function CommentDrawer({
  mediaId,
  open,
  onClose,
  onCommentCountChange,
}: {
  mediaId: string
  open: boolean
  onClose: () => void
  onCommentCountChange: (mediaId: string, count: number) => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // コメント取得
  useEffect(() => {
    if (!open) return
    getMediaCommentsAction(mediaId)
      .then((d) => {
        const list = d.comments ?? []
        setComments(list)
        onCommentCountChange(mediaId, list.length)
      })
      .catch(() => {})
  }, [open, mediaId, onCommentCountChange])

  // スクロールを最下部へ
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [comments])

  const handleSubmit = async () => {
    if (!body.trim() || sending) return
    setSending(true)
    try {
      const postData = await postMediaCommentAction(mediaId, body.trim())
      setBody("")

      // コメント数を親に通知
      if (postData.commentCount != null) {
        onCommentCountChange(mediaId, postData.commentCount)
      }

      // コメント一覧をリフレッシュ
      const d = await getMediaCommentsAction(mediaId)
      setComments(d.comments ?? [])
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[10002] transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* 背景タップで閉じる */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* ドロワー */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-zinc-900 rounded-t-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "60vh" }}
      >
        {/* ハンドル */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-white font-medium text-sm">
            コメント ({comments.length})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* コメント一覧 */}
        <div
          ref={listRef}
          className="overflow-y-auto px-4 py-3 space-y-3"
          style={{ maxHeight: "calc(60vh - 110px)" }}
        >
          {comments.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-6">
              まだコメントはありません
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-xs font-medium">
                      {c.userName}
                    </span>
                    <span className="text-white/30 text-[10px]">
                      {new Intl.DateTimeFormat("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(c.createdAt))}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mt-0.5 break-words">
                    {c.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 入力エリア */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="コメントを追加..."
            className="flex-1 bg-white/10 text-white placeholder:text-white/30 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-white/30"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!body.trim() || sending}
            className="w-9 h-9 rounded-full bg-blue-500 disabled:bg-white/10 flex items-center justify-center text-white transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MediaViewer                                                        */
/* ------------------------------------------------------------------ */

export function MediaViewer({
  media,
  initialIndex,
  open,
  onOpenChange,
  currentUserId,
  currentUserRole,
  onMediaDeleted,
}: MediaViewerProps) {
  const [index, setIndex] = useState(initialIndex)
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const didInitScroll = useRef(false)

  // いいね状態（mediaId → { liked, count }）
  const [likeState, setLikeState] = useState<
    Map<string, { liked: boolean; count: number }>
  >(new Map())

  // 閲覧数（mediaId → count）
  const [viewCounts, setViewCounts] = useState<Map<string, number>>(new Map())

  // コメント数（mediaId → count, サーバーから取得した値を上書き用）
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(
    new Map()
  )

  // コメントドロワー
  const [commentOpen, setCommentOpen] = useState(false)
  const [commentMediaId, setCommentMediaId] = useState<string | null>(null)

  // 削除確認
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 閲覧記録済み
  const viewedIds = useRef(new Set<string>())

  // クライアント側でのみマウント
  useEffect(() => {
    setMounted(true)
  }, [])

  // initialIndex が変わったら同期 + 初期スクロール
  useEffect(() => {
    if (!open) {
      didInitScroll.current = false
      return
    }
    setIndex(initialIndex)

    const raf = requestAnimationFrame(() => {
      const container = scrollRef.current
      if (container && !didInitScroll.current) {
        container.scrollTo({
          top: initialIndex * window.innerHeight,
          behavior: "instant",
        })
        didInitScroll.current = true
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [initialIndex, open])

  // body スクロールをロック
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // 表示中のメディアのいいね状態を取得
  useEffect(() => {
    if (!open) return
    const item = media[index]
    if (!item || likeState.has(item.id)) return

    getMediaLikeStatusAction(item.id)
      .then((d) => {
        setLikeState((prev) => {
          const next = new Map(prev)
          next.set(item.id, { liked: d.liked, count: d.likeCount })
          return next
        })
      })
      .catch(() => {})
  }, [open, index, media, likeState])

  // 表示中のメディアの閲覧を記録
  useEffect(() => {
    if (!open) return
    const item = media[index]
    if (!item || viewedIds.current.has(item.id)) return

    viewedIds.current.add(item.id)
    recordMediaViewAction(item.id)
      .then((d) => {
        setViewCounts((prev) => {
          const next = new Map(prev)
          next.set(item.id, d.viewCount)
          return next
        })
      })
      .catch(() => {})
  }, [open, index, media])

  // スクロールで index を更新
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const newIndex = Math.round(container.scrollTop / window.innerHeight)
    if (newIndex >= 0 && newIndex < media.length) {
      setIndex(newIndex)
    }
  }, [media.length])

  // IntersectionObserver で動画の自動再生/停止
  useEffect(() => {
    if (!open) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        }
      },
      { threshold: 0.5 }
    )

    const timer = setTimeout(() => {
      for (const video of videoRefs.current.values()) {
        observer.observe(video)
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [open, media])

  // キーボードナビゲーション + Escape
  useEffect(() => {
    if (!open) return

    const handleKey = (e: KeyboardEvent) => {
      if (commentOpen) return // コメントドロワー中はスクロール無効

      const container = scrollRef.current
      if (!container) return

      if (e.key === "Escape") {
        e.preventDefault()
        onOpenChange(false)
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault()
        if (index < media.length - 1) {
          container.scrollTo({
            top: (index + 1) * window.innerHeight,
            behavior: "smooth",
          })
        }
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault()
        if (index > 0) {
          container.scrollTo({
            top: (index - 1) * window.innerHeight,
            behavior: "smooth",
          })
        }
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, index, media.length, onOpenChange, commentOpen])

  // ダイアログが閉じたら全動画を停止 + 状態リセット
  useEffect(() => {
    if (!open) {
      for (const video of videoRefs.current.values()) {
        video.pause()
      }
      setCommentOpen(false)
    }
  }, [open])

  const setVideoRef = useCallback(
    (el: HTMLVideoElement | null, i: number) => {
      if (el) {
        videoRefs.current.set(i, el)
      } else {
        videoRefs.current.delete(i)
      }
    },
    []
  )

  // いいねトグル
  const handleLike = useCallback(
    async (mediaId: string) => {
      // 楽観的更新
      setLikeState((prev) => {
        const next = new Map(prev)
        const cur = next.get(mediaId) ?? { liked: false, count: 0 }
        next.set(mediaId, {
          liked: !cur.liked,
          count: cur.liked ? cur.count - 1 : cur.count + 1,
        })
        return next
      })

      try {
        const d = await toggleMediaLikeAction(mediaId)
        setLikeState((prev) => {
          const next = new Map(prev)
          next.set(mediaId, { liked: d.liked, count: d.likeCount })
          return next
        })
      } catch {
        // ロールバック
        setLikeState((prev) => {
          const next = new Map(prev)
          const cur = next.get(mediaId) ?? { liked: false, count: 0 }
          next.set(mediaId, {
            liked: !cur.liked,
            count: cur.liked ? cur.count - 1 : cur.count + 1,
          })
          return next
        })
      }
    },
    []
  )

  const openComments = useCallback((mediaId: string) => {
    setCommentMediaId(mediaId)
    setCommentOpen(true)
  }, [])

  // 削除実行
  const handleDelete = useCallback(
    async (mediaId: string) => {
      setDeleting(true)
      try {
        const result = await deleteMediaAction(mediaId)
        if (result.success) {
          setDeleteConfirmId(null)
          onMediaDeleted?.(mediaId)
          // メディアが1件だけだった場合はビューワーを閉じる
          if (media.length <= 1) {
            onOpenChange(false)
          }
        }
      } catch {
        // ignore
      } finally {
        setDeleting(false)
      }
    },
    [media.length, onMediaDeleted, onOpenChange]
  )

  if (!open || !mounted) return null

  const viewer = (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="メディアビューワー"
    >
      {/* 閉じるボタン */}
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="fixed top-4 left-4 z-[10001] w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {/* カウンター */}
      <div className="fixed top-4 right-4 z-[10001] text-white/60 text-sm font-medium">
        {index + 1} / {media.length}
      </div>

      {/* Reels風スクロールコンテナ */}
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
        onScroll={handleScroll}
        style={{ scrollbarWidth: "none" }}
      >
        {media.map((item, i) => {
          const dateStr = item.captured_at
            ? new Intl.DateTimeFormat("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(item.captured_at))
            : null

          const like = likeState.get(item.id)
          const liked = like?.liked ?? false
          const likeCount = like?.count ?? item.like_count ?? 0
          const viewCount = viewCounts.get(item.id) ?? 0
          const cCount =
            commentCounts.get(item.id) ?? item.comment_count ?? 0

          // 削除権限: アップローダー本人 or アルバムオーナー/管理者
          const canDelete =
            currentUserId != null &&
            (item.uploader_id === currentUserId ||
              currentUserRole === "owner" ||
              currentUserRole === "admin")

          return (
            <div
              key={item.id}
              className="relative w-full snap-start snap-always flex items-center justify-center bg-black"
              style={{ height: "100vh" }}
            >
              {/* メディア */}
              {item.media_type === "video" ? (
                <video
                  ref={(el) => setVideoRef(el, i)}
                  src={item.object_path}
                  controls
                  playsInline
                  muted
                  loop
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={item.object_path}
                  alt=""
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                />
              )}

              {/* 右サイドアクション（Instagram Reels風） */}
              <div className="absolute right-3 bottom-28 z-[10000] flex flex-col items-center gap-5">
                {/* いいね */}
                <button
                  type="button"
                  onClick={() => handleLike(item.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                      liked ? "bg-red-500/80" : "bg-white/10"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        liked ? "text-white fill-white" : "text-white"
                      }`}
                    />
                  </div>
                  <span className="text-white/80 text-[11px]">{likeCount}</span>
                </button>

                {/* コメント */}
                <button
                  type="button"
                  onClick={() => openComments(item.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white/80 text-[11px]">{cCount}</span>
                </button>

                {/* 閲覧数 */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white/80 text-[11px]">{viewCount}</span>
                </div>

                {/* 削除 */}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>
                  </button>
                )}
              </div>

              {/* 下部メタ情報 */}
              <div className="absolute bottom-0 inset-x-0 z-[10000] p-4 pb-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                {/* アップローダー */}
                {item.uploader_name && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-white/80" />
                    </div>
                    <span className="text-white font-medium text-sm">
                      {item.uploader_name}
                    </span>
                  </div>
                )}

                {/* イベント名 / 撮影日 */}
                <div className="flex items-center gap-4 text-white/70 text-xs">
                  {item.event_name && (
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5" />
                      {item.event_name}
                    </span>
                  )}
                  {dateStr && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* コメントドロワー */}
      {commentMediaId && (
        <CommentDrawer
          mediaId={commentMediaId}
          open={commentOpen}
          onClose={() => setCommentOpen(false)}
          onCommentCountChange={(id, count) => {
            setCommentCounts((prev) => {
              const next = new Map(prev)
              next.set(id, count)
              return next
            })
          }}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !deleting && setDeleteConfirmId(null)}
          />
          <div className="relative bg-zinc-900 rounded-2xl p-6 mx-6 max-w-sm w-full shadow-xl">
            <h3 className="text-white font-semibold text-base mb-2">
              メディアを削除しますか？
            </h3>
            <p className="text-white/60 text-sm mb-6">
              この操作は取り消せません。いいね・コメント・閲覧記録もすべて削除されます。
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(viewer, document.body)
}
