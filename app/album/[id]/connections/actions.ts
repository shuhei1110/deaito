"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  getAlbumMetricHistory,
  getAlbumMetricSummary,
} from "@/lib/supabase/connections"
import type {
  MetricType,
  MetricPeriod,
  MetricHistoryEntry,
  MetricSummary,
} from "@/lib/album-types"

async function getAuthUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("認証が必要です")
  return user.id
}

export async function fetchMetricDataAction(
  albumId: string,
  metric: MetricType,
  period: MetricPeriod
): Promise<{ history?: MetricHistoryEntry[]; summary?: MetricSummary; error?: string }> {
  try {
    await getAuthUserId()
    const [history, summary] = await Promise.all([
      getAlbumMetricHistory(albumId, metric, period),
      getAlbumMetricSummary(albumId, metric, period),
    ])
    return { history, summary }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "データの取得に失敗しました" }
  }
}
