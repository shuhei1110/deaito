"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Sparkles, Users } from "lucide-react"
import type { CarouselAlbumPoint } from "@/lib/album-types"

interface TsunaguPointsCarouselProps {
  albums: CarouselAlbumPoint[]
}

export function TsunaguPointsCarousel({ albums }: TsunaguPointsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // スクロール位置からアクティブなインデックスを計算
  const handleScroll = () => {
    if (!containerRef.current) return
    const container = containerRef.current
    const cardWidth = 180 + 12 // カード幅 + gap
    const scrollPosition = container.scrollLeft
    const newIndex = Math.round(scrollPosition / cardWidth)
    setActiveIndex(Math.max(0, Math.min(newIndex, albums.length - 1)))
  }

  // 特定のカードへスクロール
  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return
    const cardWidth = 180 + 12
    containerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    })
  }

  // ドラッグ操作
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // タッチ操作
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    const x = e.touches[0].pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  if (albums.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f5d9c8] to-[#e8a87c] flex items-center justify-center">
            <span className="text-xs">🌱</span>
          </div>
          <h3 className="text-sm font-medium text-foreground/70">つなぐポイント</h3>
        </div>
        <div className="ios-card p-8 mx-4 text-center text-foreground/40 text-sm">
          アルバムに参加するとポイントが表示されます
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f5d9c8] to-[#e8a87c] flex items-center justify-center">
            <span className="text-xs">🌱</span>
          </div>
          <h3 className="text-sm font-medium text-foreground/70">つなぐポイント</h3>
        </div>
        <p className="text-[10px] text-muted-foreground">← スワイプ →</p>
      </div>

      {/* カルーセル */}
      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-[calc(50%-90px)] snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {albums.map((album, index) => {
          const isActive = index === activeIndex
          const percentage = Math.min((album.points / album.threshold) * 100, 100)
          const isNearThreshold = percentage >= 90

          return (
            <Link
              href={`/album/${album.id}`}
              key={album.id}
              className={`flex-shrink-0 snap-center transition-all duration-300 ${
                isActive ? "scale-100 opacity-100" : "scale-90 opacity-60"
              }`}
              style={{ width: 180 }}
              onClick={(e) => {
                if (!isActive) {
                  e.preventDefault()
                  scrollToIndex(index)
                }
              }}
            >
              <div className={`relative border rounded-2xl overflow-hidden transition-all duration-300 ${
                isActive ? "border-[#e8a87c]/50 shadow-lg shadow-[#e8a87c]/10" : "border-border"
              }`}>
                {/* 液体ビジュアル部分 */}
                <div className="relative h-32 bg-gradient-to-b from-card to-muted/30 overflow-hidden">
                  {/* 液体 */}
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                    style={{ height: `${percentage}%` }}
                  >
                    <div className={`absolute inset-0 ${
                      isNearThreshold
                        ? "bg-gradient-to-t from-[#e8a87c]/80 via-[#f0c4a8]/60 to-[#f5d9c8]/50"
                        : "bg-gradient-to-t from-[#e8a87c]/60 via-[#f0c4a8]/40 to-[#f5d9c8]/30"
                    }`} />

                    {/* 波 */}
                    <svg className="absolute top-0 left-0 w-full h-4 -translate-y-1/2" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path
                        d="M0,10 Q25,5 50,10 T100,10 V20 H0 Z"
                        fill={isNearThreshold ? "rgba(232, 168, 124, 0.5)" : "rgba(232, 168, 124, 0.3)"}
                      >
                        <animate
                          attributeName="d"
                          values="M0,10 Q25,5 50,10 T100,10 V20 H0 Z;M0,10 Q25,15 50,10 T100,10 V20 H0 Z;M0,10 Q25,5 50,10 T100,10 V20 H0 Z"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>

                    {/* 泡 */}
                    {isActive && (
                      <>
                        <div className="absolute bottom-4 left-[20%] w-2 h-2 rounded-full bg-[#f5d9c8]/60 animate-bounce" style={{ animationDelay: "0s" }} />
                        <div className="absolute bottom-8 left-[50%] w-1.5 h-1.5 rounded-full bg-[#f5d9c8]/50 animate-bounce" style={{ animationDelay: "0.5s" }} />
                        <div className="absolute bottom-6 left-[70%] w-2 h-2 rounded-full bg-[#f5d9c8]/60 animate-bounce" style={{ animationDelay: "1s" }} />
                      </>
                    )}
                  </div>

                  {/* ポイント表示 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className={`font-light tracking-tight transition-all ${isActive ? "text-3xl" : "text-2xl"}`}>
                        {album.points}
                      </p>
                      <p className="text-[10px] text-muted-foreground">pt</p>
                    </div>
                  </div>

                  {/* しきい値に近い場合のハイライト */}
                  {isNearThreshold && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-[#e8a87c]/20 px-2 py-0.5 rounded-full">
                        <Sparkles className="h-2.5 w-2.5 text-[#e8a87c]" />
                        <span className="text-[9px] font-medium text-[#e8a87c]">もうすぐ</span>
                      </div>
                    </div>
                  )}

                  {/* トレンド */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] text-[#c9a992] font-medium">{album.trend}</span>
                  </div>
                </div>

                {/* 情報部分 */}
                <div className="p-3 bg-background">
                  <p className="text-xs font-medium truncate">{album.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-muted-foreground">{album.year}</p>
                    <div className="flex items-center gap-1">
                      <Users className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{album.activeUsers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* インジケーター */}
      <div className="flex items-center justify-center gap-1.5">
        {albums.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 rounded-full ${
              index === activeIndex
                ? "w-4 h-1.5 bg-[#e8a87c]"
                : "w-1.5 h-1.5 bg-border hover:bg-[#e8a87c]/50"
            }`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
