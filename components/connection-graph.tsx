"use client"

import { useState, useEffect, useMemo } from "react"
import { Eye, Heart, Upload, Sparkles, TrendingUp, TrendingDown, MessageCircle, Loader2, ChevronDown } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type {
  TsunaguPointBreakdown,
  TsunaguPointHistoryEntry,
  TsunaguRecentActivity,
  MetricType,
  MetricPeriod,
  MetricHistoryEntry,
  MetricSummary,
} from "@/lib/album-types"

interface ConnectionGraphProps {
  albumId: string
  pointBreakdown: TsunaguPointBreakdown
  pointHistory: TsunaguPointHistoryEntry[]
  recentActivity: TsunaguRecentActivity[]
  memberCount: number
  connectionCount: number
  threshold: number
  metricHistory: MetricHistoryEntry[] | null
  metricSummary: MetricSummary | null
  metric: MetricType
  period: MetricPeriod
  isLoading: boolean
  onMetricChange: (metric: MetricType) => void
  onPeriodChange: (period: MetricPeriod) => void
}

const METRIC_OPTIONS: { value: MetricType; label: string }[] = [
  { value: "points", label: "ポイント" },
  { value: "views", label: "閲覧数" },
  { value: "likes", label: "いいね数" },
  { value: "uploads", label: "アップロード数" },
  { value: "comments", label: "コメント数" },
]

const PERIOD_OPTIONS: { value: MetricPeriod; label: string }[] = [
  { value: "1d", label: "1日" },
  { value: "7d", label: "1週間" },
  { value: "30d", label: "1ヶ月" },
  { value: "all", label: "全期間" },
]

function getTsunaguMessage(percentage: number): string {
  if (percentage >= 100) return "再会の時が来たよ！みんなに声をかけてみよう"
  if (percentage >= 70) return "もうすぐ、再会の時が訪れそう"
  if (percentage >= 40) return "みんなの想いが集まってきているよ..."
  if (percentage >= 10) return "懐かしい思い出、たくさんの人が見てるね"
  return "きっと、みんな同じ気持ちだよ"
}

function formatXAxisDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || !payload.length || !label) return null
  const d = new Date(label)
  const dateLabel = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  return (
    <div className="bg-foreground text-background px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
      <p>{dateLabel}</p>
      <p className="font-bold tabular-nums">{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export function ConnectionGraph({
  pointBreakdown,
  pointHistory,
  recentActivity,
  memberCount,
  connectionCount,
  threshold,
  metricHistory,
  metricSummary,
  metric,
  period,
  isLoading,
  onMetricChange,
  onPeriodChange,
}: ConnectionGraphProps) {
  const [fillLevel, setFillLevel] = useState(0)
  const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number; delay: number; bottom: number }[]>([])
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false)

  const totalPoints = pointBreakdown.total
  const percentage = Math.min((totalPoints / threshold) * 100, 100)
  const currentMessage = getTsunaguMessage(percentage)

  useEffect(() => {
    const timer = setTimeout(() => setFillLevel(percentage), 100)
    const newBubbles = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      size: 4 + Math.random() * 10,
      delay: Math.random() * 2,
      bottom: 10 + Math.random() * 60,
    }))
    setBubbles(newBubbles)
    return () => clearTimeout(timer)
  }, [percentage])

  // グラフ表示データ: 動的取得があればそちら、なければ SSR データ
  const chartData = useMemo(() => {
    if (metricHistory) return metricHistory
    return pointHistory.map((h) => ({ day: h.day, value: h.points }))
  }, [metricHistory, pointHistory])

  // サマリー: 動的取得があればそちら、なければポイント SSR データから算出
  const summary = useMemo<MetricSummary | null>(() => {
    if (metricSummary) return metricSummary
    if (metric === "points" && period === "30d") {
      return { current: totalPoints, previous: 0, changePercent: 0 }
    }
    return null
  }, [metricSummary, metric, period, totalPoints])

  const metricLabel = METRIC_OPTIONS.find((o) => o.value === metric)?.label ?? "ポイント"

  const avatarCount = Math.min(memberCount, 5)
  const remainingMembers = memberCount - avatarCount

  const breakdownItems = [
    { key: "views", icon: Eye, label: "閲覧", score: pointBreakdown.views, raw: pointBreakdown.rawViews, color: "#b8a08c", hoverStyle: "" },
    { key: "uploads", icon: Upload, label: "アップロード", score: pointBreakdown.uploads, raw: pointBreakdown.rawUploads, color: "#c9a992", hoverStyle: "-translate-y-0.5" },
    { key: "likes", icon: Heart, label: "いいね", score: pointBreakdown.likes, raw: pointBreakdown.rawLikes, color: "#c9655a", hoverStyle: "fill-[#c9655a]" },
    { key: "comments", icon: MessageCircle, label: "コメント", score: pointBreakdown.comments, raw: pointBreakdown.rawComments, color: "#e8a87c", hoverStyle: "" },
  ]

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
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#e8a87c] via-[#f5d9c8] to-[#e8a87c] flex items-center justify-center shadow-md border-2 border-white/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-accent/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent animate-shimmer" />
              <Sparkles className="h-6 w-6 text-white relative z-10" strokeWidth={2.5} />
            </div>
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
          <div className="absolute inset-0 rounded-3xl border-2 border-border bg-gradient-to-b from-card/80 to-muted/30 overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
              style={{ height: `${fillLevel}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#e8a87c]/70 via-[#f0c4a8]/50 to-[#f5d9c8]/40" />
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
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-[#e8a87c]/60 flex items-center"
              style={{ bottom: "100%" }}
            >
              <span className="absolute -top-5 right-2 text-[10px] text-[#c9a992] font-medium">再会の時</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-light tracking-tight">{totalPoints}</p>
                <p className="text-xs text-muted-foreground mt-1">pt</p>
              </div>
            </div>
          </div>
          <div className="absolute top-4 left-4 w-8 h-24 bg-gradient-to-b from-white/15 to-transparent rounded-full blur-sm transform -rotate-12" />
        </div>

        {/* 進捗テキスト */}
        <div className="text-center mt-4 space-y-3">
          {totalPoints >= threshold ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-accent">再会の準備が整いました！</p>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border">
              <TrendingUp className="h-4 w-4 text-accent" />
              <p className="text-sm">
                あと <span className="font-bold text-accent tabular-nums">{threshold - totalPoints}</span> ポイントで再会提案
              </p>
            </div>
          )}
          <div className="flex items-center justify-center gap-1">
            <div className="flex -space-x-2">
              {[...Array(avatarCount)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f5d9c8] to-[#e8a87c] border-2 border-background transition-all duration-200 hover:scale-110 hover:z-10"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    animation: "fadeIn 300ms ease-out forwards",
                    opacity: 0,
                  }}
                />
              ))}
              {remainingMembers > 0 && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-muted to-muted-foreground/30 border-2 border-background flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-medium">+{remainingMembers}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground ml-2">{memberCount}人がこのアルバムに参加しています</p>
          </div>
        </div>
      </div>

      {/* Analytics ダッシュボード */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {/* ヘッダー: 指標プルダウン + 期間フィルタ */}
        <div className="p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* 指標プルダウン */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMetricDropdownOpen(!metricDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                {metricLabel}
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${metricDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {metricDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMetricDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 z-20 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                    {METRIC_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onMetricChange(opt.value)
                          setMetricDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-secondary/50 ${
                          metric === opt.value ? "text-accent font-medium" : ""
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 期間ボタングループ */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onPeriodChange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    period === opt.value
                      ? "bg-accent text-accent-foreground"
                      : "bg-background text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* サマリーカード */}
        {summary && (
          <div className="px-4 pt-4 flex items-baseline gap-3">
            <span className="text-3xl font-light tabular-nums">{summary.current.toLocaleString()}</span>
            {summary.previous > 0 && (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  summary.changePercent >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {summary.changePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {summary.changePercent >= 0 ? "+" : ""}
                {summary.changePercent}%
              </span>
            )}
          </div>
        )}

        {/* recharts グラフ */}
        <div className="p-4 relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          )}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8a87c" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#e8a87c" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={formatXAxisDate}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#e8a87c"
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#e8a87c", stroke: "white", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* ポイント内訳 */}
      <div className="border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-accent/5">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            ポイントの内訳
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">多くの人が参加するほどポイントが上がります</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
          {breakdownItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                onMouseEnter={() => setHoveredStat(item.key)}
                onMouseLeave={() => setHoveredStat(null)}
                className="p-4 bg-background flex flex-col items-center gap-2 transition-all duration-150 hover:bg-secondary/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <div className={`w-10 h-10 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center transition-all duration-150 ${hoveredStat === item.key ? "scale-110 bg-[#f5d9c8]/80" : ""}`}>
                  <Icon className={`h-4 w-4 transition-all duration-150 ${hoveredStat === item.key ? `scale-110 ${item.hoverStyle}` : ""}`} style={{ color: item.color }} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium tabular-nums">{item.score}</p>
                  <p className="text-[10px] text-muted-foreground/60 tabular-nums">{item.raw}件</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 最近のアクティビティ */}
      {recentActivity.length > 0 && (
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
                  animation: "fadeIn 300ms ease-out forwards",
                  opacity: 0,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#f5d9c8]/50 flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:bg-[#f5d9c8]/80">
                  {activity.type === "view" && <Eye className="h-3.5 w-3.5 text-[#b8a08c]" />}
                  {activity.type === "like" && <Heart className="h-3.5 w-3.5 text-[#c9655a]" />}
                  {activity.type === "upload" && <Upload className="h-3.5 w-3.5 text-[#c9a992]" />}
                  {activity.type === "comment" && <MessageCircle className="h-3.5 w-3.5 text-[#e8a87c]" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アクティビティがない場合 */}
      {recentActivity.length === 0 && (
        <div className="border border-border rounded-xl p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#f5d9c8]/30 flex items-center justify-center mb-3">
            <Sparkles className="h-5 w-5 text-[#c9a87c]" />
          </div>
          <p className="text-sm text-muted-foreground">まだアクティビティがありません</p>
          <p className="text-xs text-muted-foreground/60 mt-1">写真をアップロードしてつなぐポイントを貯めよう</p>
        </div>
      )}

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
