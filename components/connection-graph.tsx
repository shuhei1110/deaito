"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, Upload, Sparkles, TrendingUp } from "lucide-react"

// つなぐポイントの内訳
const pointBreakdown = {
  views: 234,      // 閲覧
  likes: 89,       // いいね
  uploads: 42,     // アップロード
  comments: 31,    // コメント
}

// ポイント推移データ（過去30日間）- 日単位
const pointHistory = [
  { day: 1, points: 50 },
  { day: 2, points: 55 },
  { day: 3, points: 62 },
  { day: 4, points: 58 },
  { day: 5, points: 70 },
  { day: 6, points: 75 },
  { day: 7, points: 82 },
  { day: 8, points: 88 },
  { day: 9, points: 95 },
  { day: 10, points: 105 },
  { day: 11, points: 112 },
  { day: 12, points: 120 },
  { day: 13, points: 128 },
  { day: 14, points: 135 },
  { day: 15, points: 148 },
  { day: 16, points: 160 },
  { day: 17, points: 175 },
  { day: 18, points: 188 },
  { day: 19, points: 200 },
  { day: 20, points: 215 },
  { day: 21, points: 232 },
  { day: 22, points: 248 },
  { day: 23, points: 265 },
  { day: 24, points: 282 },
  { day: 25, points: 298 },
  { day: 26, points: 315 },
  { day: 27, points: 335 },
  { day: 28, points: 355 },
  { day: 29, points: 375 },
  { day: 30, points: 396, isToday: true },
]

// 最近のアクティビティ（匿名）
const recentActivity = [
  { type: "view", count: 3, timeAgo: "2分前", message: "誰かが思い出を見ています" },
  { type: "like", count: 1, timeAgo: "5分前", message: "想いが届きました" },
  { type: "upload", count: 1, timeAgo: "1時間前", message: "新しい思い出が追加されました" },
  { type: "view", count: 5, timeAgo: "3時間前", message: "みんなが振り返っています" },
]

// つなぐのセリフ
const tsunaguMessages = [
  "みんなの想いが集まってきているよ...",
  "もうすぐ、再会の時が訪れそう",
  "懐かしい思い出、たくさんの人が見てるね",
  "きっと、みんな同じ気持ちだよ",
]

export function ConnectionGraph() {
  const [fillLevel, setFillLevel] = useState(0)
  const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number; delay: number; bottom: number }[]>([])
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)
  
  const totalPoints = Object.values(pointBreakdown).reduce((a, b) => a + b, 0)
  const threshold = 500 // 再会提案のしきい値
  const percentage = Math.min((totalPoints / threshold) * 100, 100)
  
  useEffect(() => {
    // 液体レベルのアニメーション
    const timer = setTimeout(() => setFillLevel(percentage), 100)
    
    // 泡のランダム生成 - クライアントサイドでのみ実行
    const newBubbles = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      size: 4 + Math.random() * 10,
      delay: Math.random() * 2,
      bottom: 10 + Math.random() * 60,
    }))
    setBubbles(newBubbles)
    
    // メッセージのランダム選択
    setMessageIndex(Math.floor(Math.random() * tsunaguMessages.length))
    
    return () => clearTimeout(timer)
  }, [percentage])

  const currentMessage = tsunaguMessages[messageIndex]

  // グラフの最大値を計算
  const maxPoints = Math.max(...pointHistory.map(d => d.points))

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="relative">
        <div className="absolute -left-1 top-0 w-1 h-8 bg-gradient-to-b from-accent to-transparent rounded-full" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Collective memories</p>
        <h2 className="text-2xl font-serif">つなぐポイント</h2>
        <p className="text-sm text-muted-foreground mt-1">みんなの想いが集まる場所</p>
      </div>

      {/* つなぐとボトル */}
      <div className="relative border border-border rounded-2xl p-6 bg-gradient-to-b from-secondary/40 to-transparent overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
        
        {/* つなぐのアバターとメッセージ */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative group cursor-pointer">
            {/* グラデーションアイコン */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#e8a87c] via-[#f5d9c8] to-[#e8a87c] flex items-center justify-center shadow-md border-2 border-white/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-accent/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent animate-shimmer" />
              <Sparkles className="h-6 w-6 text-white relative z-10" strokeWidth={2.5} />
            </div>
            {/* ステータスインジケーター */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#e8a87c] rounded-full border-2 border-background flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex-1 bg-secondary/60 rounded-2xl rounded-tl-sm p-4 border border-border transition-all duration-200 hover:bg-secondary/80">
            <p className="text-xs text-muted-foreground mb-1">つなぐ</p>
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
                    bottom: `${bubble.bottom}%`,
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
        <div className="text-center mt-4 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border">
            <TrendingUp className="h-4 w-4 text-accent" />
            <p className="text-sm">
              あと <span className="font-bold text-accent tabular-nums">{threshold - totalPoints}</span> ポイントで再会提案
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-1">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f5d9c8] to-[#e8a87c] border-2 border-background transition-all duration-200 hover:scale-110 hover:z-10"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    animation: 'fadeIn 300ms ease-out forwards',
                    opacity: 0
                  }}
                />
              ))}
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-muted to-muted-foreground/30 border-2 border-background flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground font-medium">+7</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-2">12人がこのアルバムを見ています</p>
          </div>
        </div>
      </div>

      {/* つなぐポイント推移グラフ */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            つなぐポイント推移
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">過去30日間の動き</p>
        </div>
        <div className="p-6">
          <div className="relative h-40">
            {/* グリッドライン */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-t border-dashed border-border/30" />
              ))}
            </div>
            
            {/* エリアチャート */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e8a87c" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#e8a87c" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* エリア */}
              <path
                d={`M 0,${160 - (pointHistory[0].points / maxPoints) * 140} ${pointHistory
                  .map((d, i) => `L ${(i / (pointHistory.length - 1)) * 600},${160 - (d.points / maxPoints) * 140}`)
                  .join(" ")} L 600,160 L 0,160 Z`}
                fill="url(#areaGradient)"
                className="transition-all duration-500"
              />
              
              {/* ライン */}
              <path
                d={`M 0,${160 - (pointHistory[0].points / maxPoints) * 140} ${pointHistory
                  .map((d, i) => `L ${(i / (pointHistory.length - 1)) * 600},${160 - (d.points / maxPoints) * 140}`)
                  .join(" ")}`}
                fill="none"
                stroke="#e8a87c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />
              
              {/* ポイント - 5日ごとと今日のみ表示 */}
              {pointHistory.map((d, i) => {
                const shouldShow = d.isToday || (d.day % 5 === 0)
                if (!shouldShow) return null
                return (
                  <circle
                    key={i}
                    cx={(i / (pointHistory.length - 1)) * 600}
                    cy={160 - (d.points / maxPoints) * 140}
                    r={d.isToday ? "5" : "3"}
                    fill={d.isToday ? "#e8a87c" : "#c9a992"}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredDay(i)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                )
              })}
            </svg>
            
            {/* ホバーツールチップ */}
            {hoveredDay !== null && (
              <div 
                className="absolute bg-foreground text-background px-3 py-2 rounded-lg text-xs font-medium shadow-lg z-10 transition-all duration-150 pointer-events-none"
                style={{
                  left: `${(hoveredDay / (pointHistory.length - 1)) * 100}%`,
                  top: `${100 - (pointHistory[hoveredDay].points / maxPoints) * 85}%`,
                  transform: "translate(-50%, -120%)"
                }}
              >
                <p className="font-bold">{pointHistory[hoveredDay].day}日前</p>
                <p>{pointHistory[hoveredDay].points} ポイント</p>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="border-4 border-transparent border-t-foreground" />
                </div>
              </div>
            )}
          </div>
          
          {/* X軸ラベル */}
          <div className="flex justify-between mt-4 text-[10px] text-muted-foreground">
            <span>30日前</span>
            <span>20日前</span>
            <span>10日前</span>
            <span className="font-bold text-accent">今日</span>
          </div>
        </div>
      </div>

      {/* ポイント内訳 */}
      <div className="border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-accent/5">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            ポイントの内訳
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border">
          <button
            type="button"
            onMouseEnter={() => setHoveredStat("views")}
            onMouseLeave={() => setHoveredStat(null)}
            className="p-4 bg-background flex items-center gap-3 transition-all duration-150 hover:bg-secondary/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <div className={`w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center transition-all duration-150 ${hoveredStat === "views" ? "scale-110 bg-[#f5d9c8]/80" : ""}`}>
              <Eye className={`h-4 w-4 text-[#c9a992] transition-transform duration-150 ${hoveredStat === "views" ? "scale-110" : ""}`} />
            </div>
            <div className="text-left">
              <p className="text-lg font-medium tabular-nums">{pointBreakdown.views}</p>
              <p className="text-xs text-muted-foreground">閲覧</p>
            </div>
          </button>
          <button
            type="button"
            onMouseEnter={() => setHoveredStat("likes")}
            onMouseLeave={() => setHoveredStat(null)}
            className="p-4 bg-background flex items-center gap-3 transition-all duration-150 hover:bg-secondary/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <div className={`w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center transition-all duration-150 ${hoveredStat === "likes" ? "scale-110 bg-[#f5d9c8]/80" : ""}`}>
              <Heart className={`h-4 w-4 text-[#c9655a] transition-all duration-150 ${hoveredStat === "likes" ? "scale-110 fill-[#c9655a]" : ""}`} />
            </div>
            <div className="text-left">
              <p className="text-lg font-medium tabular-nums">{pointBreakdown.likes}</p>
              <p className="text-xs text-muted-foreground">いいね</p>
            </div>
          </button>
          <button
            type="button"
            onMouseEnter={() => setHoveredStat("uploads")}
            onMouseLeave={() => setHoveredStat(null)}
            className="p-4 bg-background flex items-center gap-3 transition-all duration-150 hover:bg-secondary/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <div className={`w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center transition-all duration-150 ${hoveredStat === "uploads" ? "scale-110 bg-[#f5d9c8]/80" : ""}`}>
              <Upload className={`h-4 w-4 text-[#c9a992] transition-transform duration-150 ${hoveredStat === "uploads" ? "scale-110 -translate-y-0.5" : ""}`} />
            </div>
            <div className="text-left">
              <p className="text-lg font-medium tabular-nums">{pointBreakdown.uploads}</p>
              <p className="text-xs text-muted-foreground">アップロード</p>
            </div>
          </button>
          <button
            type="button"
            onMouseEnter={() => setHoveredStat("comments")}
            onMouseLeave={() => setHoveredStat(null)}
            className="p-4 bg-background flex items-center gap-3 transition-all duration-150 hover:bg-secondary/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <div className={`w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center transition-all duration-150 ${hoveredStat === "comments" ? "scale-110 bg-[#f5d9c8]/80" : ""}`}>
              <Sparkles className={`h-4 w-4 text-[#e8a87c] transition-all duration-150 ${hoveredStat === "comments" ? "scale-110 rotate-12" : ""}`} />
            </div>
            <div className="text-left">
              <p className="text-lg font-medium tabular-nums">{pointBreakdown.comments}</p>
              <p className="text-xs text-muted-foreground">コメント</p>
            </div>
          </button>
        </div>
      </div>

      {/* 最近のアクティビティ */}
      <div className="border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-accent/5">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            みんなの動き
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">匿名で表示されます</p>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity, idx) => (
            <div 
              key={idx} 
              className="p-4 flex items-center gap-3 transition-all duration-150 hover:bg-secondary/30 cursor-default group"
              style={{ 
                animationDelay: `${idx * 100}ms`,
                animation: 'fadeIn 300ms ease-out forwards',
                opacity: 0
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:bg-[#f5d9c8]/80">
                {activity.type === "view" && <Eye className="h-3.5 w-3.5 text-[#c9a992]" />}
                {activity.type === "like" && <Heart className="h-3.5 w-3.5 text-[#c9655a]" />}
                {activity.type === "upload" && <Upload className="h-3.5 w-3.5 text-[#c9a992]" />}
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
              </div>
              {activity.count > 1 && (
                <Badge variant="secondary" className="rounded-full text-xs transition-all duration-150 group-hover:scale-105">
                  ×{activity.count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* アニメーションキーフレーム */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          50% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
