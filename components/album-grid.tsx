"use client"

import { useState } from "react"
import { ImageIcon, Camera, Play, Loader2 } from "lucide-react"
import { MediaViewer } from "@/components/media-viewer"
import type { MediaAssetRow } from "@/lib/album-types"

interface AlbumGridProps {
  albumId: string
  media: MediaAssetRow[]
  totalCount: number
  currentUserId?: string | null
  currentUserRole?: "owner" | "admin" | "member" | null
  onMediaDeleted?: (mediaId: string) => void
  onLoadMore?: () => Promise<void>
}

export function AlbumGrid({ albumId, media, totalCount, currentUserId, currentUserRole, onMediaDeleted, onLoadMore }: AlbumGridProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const hasMore = media.length < totalCount

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      await onLoadMore()
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 空状態
  if (media.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <ImageIcon className="w-4 h-4" />
          <span>ギャラリー</span>
        </div>
        <div className="py-12 text-center">
          <Camera className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/40 text-sm mb-1">まだ写真・動画がありません</p>
          <p className="text-foreground/30 text-xs">イベントページからアップロードしましょう</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-foreground/50 mb-2">
          <ImageIcon className="w-4 h-4" />
          <span>ギャラリー ({totalCount})</span>
        </div>
        <p className="text-sm text-foreground/60">
          タップして拡大表示
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 gap-1.5">
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
            {/* サムネイル */}
            {item.media_type === "video" ? (
              <>
                <video
                  src={item.object_path}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full object-cover"
                />
                {/* 再生アイコン */}
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
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-foreground/20" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* もっと見る */}
      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="w-full py-3 text-sm text-accent font-medium rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoadingMore ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              読み込み中...
            </>
          ) : (
            <>もっと見る（残り{totalCount - media.length}件）</>
          )}
        </button>
      )}

      {/* Media Viewer */}
      <MediaViewer
        media={media}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onMediaDeleted={onMediaDeleted}
      />
    </div>
  )
}
