"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, Upload, Sparkles, Users } from "lucide-react"

// つなぐポイントの内訳
const pointBreakdown = {
  views: 234,      // 閲覧
  likes: 89,       // いいね
  uploads: 42,     // アップロード
  comments: 31,    // コメント
}

// 最近のアクティビティ（匿名）
const recentActivity = [
  { type: "view", count: 3, timeAgo: "2分前", message: "誰かが思い出を見ています" },
  { type: "like", count: 1, timeAgo: "5分前", message: "想いが届きました" },
  { type: "upload", count: 1, timeAgo: "1時間前", message: "新しい思い出が追加されました" },
  { type: "view", count: 5, timeAgo: "3時間前", message: "みんなが振り返っています" },
]

// つなぐくんのセリフ
const tsunaguMessages = [
  "みんなの想いが少しずつ集まってきてるよ",
  "あともう少しで、再会の時かな？",
  "懐かしい思い出、みんな見てるね",
  "きっと、みんな同じ気持ちだよ",
]

export function ConnectionGraph() {
  const [fillLevel, setFillLevel] = useState(0)
  const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number; delay: number }[]>([])
  
  const totalPoints = Object.values(pointBreakdown).reduce((a, b) => a + b, 0)
  const threshold = 500 // 再会提案のしきい値
  const percentage = Math.min((totalPoints / threshold) * 100, 100)
  
  useEffect(() => {
    // 液体レベルのアニメーション
    const timer = setTimeout(() => setFillLevel(percentage), 100)
    
    // 泡のランダム生成
    const newBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 3,
    }))
    setBubbles(newBubbles)
    
    return () => clearTimeout(timer)
  }, [percentage])

  const currentMessage = tsunaguMessages[Math.floor(Date.now() / 10000) % tsunaguMessages.length]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Collective memories</p>
        <h2 className="text-2xl font-serif">つなぐポイント</h2>
      </div>

      {/* つなぐくんとボトル */}
      <div className="relative border border-border rounded-2xl p-6 bg-gradient-to-b from-secondary/40 to-transparent overflow-hidden">
        
        {/* つなぐくんのアバターとメッセージ */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f5d9c8] to-[#e8a87c] flex items-center justify-center shadow-sm border border-[#e8a87c]/30">
              <span className="text-2xl">🌱</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#e8a87c] rounded-full border-2 border-background flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1 bg-secondary/60 rounded-2xl rounded-tl-sm p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">つなぐくん</p>
            <p className="text-sm leading-relaxed">{currentMessage}</p>
          </div>
        </div>

        {/* メインのボトル/容器 */}
        <div className="relative mx-auto w-full max-w-[280px] aspect-[3/4]">
          {/* 容器の背景 */}
          <div className="absolute inset-0 rounded-3xl border-2 border-border bg-gradient-to-b from-card/80 to-muted/30 overflow-hidden">
            
            {/* 液体 */}
            <div 
              className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
              style={{ height: `${fillLevel}%` }}
            >
              {/* 液体のグラデーション - 暖色系 */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#e8a87c]/70 via-[#f0c4a8]/50 to-[#f5d9c8]/40" />
              
              {/* 波のアニメーション */}
              <svg className="absolute top-0 left-0 w-full h-8 -translate-y-1/2" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path
                  d="M0,10 Q25,0 50,10 T100,10 V20 H0 Z"
                  fill="url(#waveGradientWarm)"
                  className="animate-pulse"
                >
                  <animate
                    attributeName="d"
                    values="M0,10 Q25,0 50,10 T100,10 V20 H0 Z;M0,10 Q25,20 50,10 T100,10 V20 H0 Z;M0,10 Q25,0 50,10 T100,10 V20 H0 Z"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>
                <defs>
                  <linearGradient id="waveGradientWarm" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(245, 217, 200, 0.6)" />
                    <stop offset="100%" stopColor="rgba(232, 168, 124, 0.6)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* 泡 - 暖色系 */}
              {bubbles.map((bubble) => (
                <div
                  key={bubble.id}
                  className="absolute rounded-full bg-[#f5d9c8]/50 animate-bounce"
                  style={{
                    left: `${bubble.x}%`,
                    bottom: `${10 + Math.random() * 60}%`,
                    width: bubble.size,
                    height: bubble.size,
                    animationDelay: `${bubble.delay}s`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>

            {/* しきい値ライン */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-[#e8a87c]/60 flex items-center"
              style={{ bottom: "100%" }}
            >
              <span className="absolute -top-5 right-2 text-[10px] text-[#c9a992] font-medium">
                再会の時 ✨
              </span>
            </div>

            {/* 中央のポイント表示 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-light tracking-tight">{totalPoints}</p>
                <p className="text-xs text-muted-foreground mt-1">pt</p>
              </div>
            </div>
          </div>

          {/* 光の反射エフェクト */}
          <div className="absolute top-4 left-4 w-8 h-24 bg-gradient-to-b from-white/15 to-transparent rounded-full blur-sm transform -rotate-12" />
        </div>

        {/* 進捗テキスト */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            あと <span className="font-medium text-foreground">{threshold - totalPoints}</span> ポイントで再会提案
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">12人がこのアルバムを見ています</p>
          </div>
        </div>
      </div>

      {/* ポイント内訳 */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-medium text-sm">ポイントの内訳</h3>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border">
          <div className="p-4 bg-background flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center">
              <Eye className="h-4 w-4 text-[#c9a992]" />
            </div>
            <div>
              <p className="text-lg font-medium">{pointBreakdown.views}</p>
              <p className="text-xs text-muted-foreground">閲覧</p>
            </div>
          </div>
          <div className="p-4 bg-background flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center">
              <Heart className="h-4 w-4 text-[#c9655a]" />
            </div>
            <div>
              <p className="text-lg font-medium">{pointBreakdown.likes}</p>
              <p className="text-xs text-muted-foreground">いいね</p>
            </div>
          </div>
          <div className="p-4 bg-background flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center">
              <Upload className="h-4 w-4 text-[#c9a992]" />
            </div>
            <div>
              <p className="text-lg font-medium">{pointBreakdown.uploads}</p>
              <p className="text-xs text-muted-foreground">アップロード</p>
            </div>
          </div>
          <div className="p-4 bg-background flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#e8a87c]" />
            </div>
            <div>
              <p className="text-lg font-medium">{pointBreakdown.comments}</p>
              <p className="text-xs text-muted-foreground">コメント</p>
            </div>
          </div>
        </div>
      </div>

      {/* 最近のアクティビティ */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-medium text-sm">みんなの動き</h3>
          <p className="text-xs text-muted-foreground mt-0.5">匿名で表示されます</p>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center">
                {activity.type === "view" && <Eye className="h-3.5 w-3.5 text-[#c9a992]" />}
                {activity.type === "like" && <Heart className="h-3.5 w-3.5 text-[#c9655a]" />}
                {activity.type === "upload" && <Upload className="h-3.5 w-3.5 text-[#c9a992]" />}
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
              </div>
              {activity.count > 1 && (
                <Badge variant="secondary" className="rounded-full text-xs">
                  ×{activity.count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
