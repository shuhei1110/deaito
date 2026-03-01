"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, ChevronRight } from "lucide-react"

interface TsunaguMiniCardProps {
  albumId: string
  totalPoints: number
  targetPoints: number
}

export function TsunaguMiniCard({
  albumId,
  totalPoints,
  targetPoints,
}: TsunaguMiniCardProps) {
  const [isClient, setIsClient] = useState(false)
  const progress = Math.min((totalPoints / targetPoints) * 100, 100)
  
  // ハイドレーションエラー防止
  useEffect(() => {
    setIsClient(true)
  }, [])

  // つなぐの状態を判定（控えめ）
  const getStatus = () => {
    if (progress >= 90) return { color: "#e8a87c", pulse: true }
    if (progress >= 70) return { color: "#d4a574", pulse: false }
    return { color: "#c9a87c", pulse: false }
  }

  const status = getStatus()

  if (!isClient) {
    return (
      <div className="ios-card p-2.5 opacity-0">
        <div className="h-8" />
      </div>
    )
  }

  return (
    <Link href={`/album/${albumId}/connections`}>
      <div 
        className="ios-card p-3 transition-all duration-200 active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg, #faf8f6 0%, #f7f4f1 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* つなぐアイコン */}
          <div className="relative flex-shrink-0">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f5e6d8 0%, #ece0d4 100%)",
              }}
            >
              <Sparkles 
                className="h-4 w-4" 
                style={{ color: "#c9a87c" }}
              />
            </div>
            {/* 動き出しそうなときの控えめなパルス */}
            {status.pulse && (
              <div 
                className="absolute inset-0 rounded-full animate-ping"
                style={{ 
                  backgroundColor: "rgba(232, 168, 124, 0.2)",
                  animationDuration: "2.5s",
                }}
              />
            )}
          </div>

          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            {/* ラベル */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs text-foreground/60">つなぐポイント</span>
            </div>
            
            {/* ポイントバー */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, #d4c4a8 0%, ${status.color} 100%)`,
                  }}
                />
              </div>
              <span className="text-[11px] text-foreground/50 tabular-nums font-medium">
                {totalPoints}<span className="text-foreground/30">/{targetPoints}</span>
              </span>
            </div>
          </div>

          {/* 矢印 */}
          <ChevronRight className="h-4 w-4 text-foreground/20 flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}
