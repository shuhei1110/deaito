"use client"

import { useState, useCallback } from "react"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { ConnectionGraph } from "@/components/connection-graph"
import type {
  TsunaguPointBreakdown,
  TsunaguPointHistoryEntry,
  TsunaguRecentActivity,
  MetricType,
  MetricPeriod,
  MetricHistoryEntry,
  MetricSummary,
} from "@/lib/album-types"
import { fetchMetricDataAction } from "./actions"

interface ConnectionsClientProps {
  albumId: string
  albumName: string
  pointBreakdown: TsunaguPointBreakdown
  pointHistory: TsunaguPointHistoryEntry[]
  recentActivity: TsunaguRecentActivity[]
  memberCount: number
  connectionCount: number
  threshold: number
  userProfile: TopBarProfile
  notificationCount: number
}

export function ConnectionsClient({
  albumId,
  albumName,
  pointBreakdown,
  pointHistory,
  recentActivity,
  memberCount,
  connectionCount,
  threshold,
  userProfile,
  notificationCount,
}: ConnectionsClientProps) {
  const [metric, setMetric] = useState<MetricType>("points")
  const [period, setPeriod] = useState<MetricPeriod>("30d")
  const [metricHistory, setMetricHistory] = useState<MetricHistoryEntry[] | null>(null)
  const [metricSummary, setMetricSummary] = useState<MetricSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async (m: MetricType, p: MetricPeriod) => {
    // 初期状態(points + 30d)なら SSR データを使う
    if (m === "points" && p === "30d") {
      setMetricHistory(null)
      setMetricSummary(null)
      return
    }
    setIsLoading(true)
    const result = await fetchMetricDataAction(albumId, m, p)
    setIsLoading(false)
    if (!result.error) {
      setMetricHistory(result.history ?? null)
      setMetricSummary(result.summary ?? null)
    }
  }, [albumId])

  const handleMetricChange = useCallback((m: MetricType) => {
    setMetric(m)
    fetchData(m, period)
  }, [period, fetchData])

  const handlePeriodChange = useCallback((p: MetricPeriod) => {
    setPeriod(p)
    fetchData(metric, p)
  }, [metric, fetchData])

  return (
    <IOSLayout
      breadcrumbs={[
        { label: "ホーム", href: "/" },
        { label: "アルバム", href: "/albums" },
        { label: albumName, href: `/album/${albumId}` },
        { label: "つながり" },
      ]}
      userProfile={userProfile}
      notificationCount={notificationCount}
    >
      <div className="py-4">
        <h2 className="text-xl font-serif font-light mb-1">つながり</h2>
        <p className="text-foreground/50 text-xs">{albumName}のつなぐポイントと再会の準備状況</p>
      </div>

      <ConnectionGraph
        albumId={albumId}
        pointBreakdown={pointBreakdown}
        pointHistory={pointHistory}
        recentActivity={recentActivity}
        memberCount={memberCount}
        connectionCount={connectionCount}
        threshold={threshold}
        metricHistory={metricHistory}
        metricSummary={metricSummary}
        metric={metric}
        period={period}
        isLoading={isLoading}
        onMetricChange={handleMetricChange}
        onPeriodChange={handlePeriodChange}
      />
    </IOSLayout>
  )
}
