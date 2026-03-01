import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  TsunaguPointBreakdown,
  TsunaguPointHistoryEntry,
  TsunaguRecentActivity,
  MetricType,
  MetricPeriod,
  MetricHistoryEntry,
  MetricSummary,
  AlbumWithMemberCount,
  CarouselAlbumPoint,
} from "@/lib/album-types"

/**
 * アルバムのつなぐポイント（重み付きスコア）を取得
 * RPC calculate_tsunagu_points を使用
 */
export async function getAlbumTsunaguPoints(
  albumId: string
): Promise<TsunaguPointBreakdown> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc("calculate_tsunagu_points", {
    p_album_id: albumId,
  })

  if (error) {
    console.error("Failed to calculate tsunagu points:", error)
    return {
      views: 0, uploads: 0, likes: 0, comments: 0, total: 0,
      rawViews: 0, rawUploads: 0, rawLikes: 0, rawComments: 0,
    }
  }

  const r = data as {
    views: number; uploads: number; likes: number; comments: number; total: number
    raw_views: number; raw_uploads: number; raw_likes: number; raw_comments: number
  }

  return {
    views: r.views,
    uploads: r.uploads,
    likes: r.likes,
    comments: r.comments,
    total: r.total,
    rawViews: r.raw_views,
    rawUploads: r.raw_uploads,
    rawLikes: r.raw_likes,
    rawComments: r.raw_comments,
  }
}

/**
 * アルバムのポイント推移（過去N日間）を取得
 * 日別生カウント累積を、現在の weighted/raw 比率でスケーリング
 */
export async function getAlbumPointHistory(
  albumId: string,
  days = 30
): Promise<TsunaguPointHistoryEntry[]> {
  const supabase = await createSupabaseServerClient()
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()
  const sinceDateStr = sinceISO.slice(0, 10)

  // 現在の重み付きスコアを取得
  const currentPoints = await getAlbumTsunaguPoints(albumId)
  const totalWeighted = currentPoints.total

  // 期間内の日別生カウント取得（4カテゴリ）
  const [uploadsRes, likesRes, commentsRes, viewsRes] = await Promise.all([
    supabase
      .from("media_assets")
      .select("created_at")
      .eq("album_id", albumId)
      .gte("created_at", sinceISO),
    supabase
      .from("media_reactions")
      .select("created_at, media_assets!inner(album_id)")
      .eq("media_assets.album_id", albumId)
      .gte("created_at", sinceISO),
    supabase
      .from("media_comments")
      .select("created_at, media_assets!inner(album_id)")
      .eq("media_assets.album_id", albumId)
      .gte("created_at", sinceISO),
    supabase
      .from("album_views")
      .select("viewed_date, view_count")
      .eq("album_id", albumId)
      .gte("viewed_date", sinceDateStr),
  ])

  // 日別カウント集計
  const dayCounts = new Map<string, number>()
  const allDates = [
    ...(uploadsRes.data ?? []).map((r) => r.created_at),
    ...(likesRes.data ?? []).map((r) => r.created_at),
    ...(commentsRes.data ?? []).map((r) => r.created_at),
  ]
  for (const ts of allDates) {
    const day = ts.slice(0, 10)
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
  }
  for (const row of viewsRes.data ?? []) {
    const day = row.viewed_date
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + (row.view_count ?? 1))
  }

  // ベースライン（期間前の生カウント）
  const [baseUploads, baseLikes, baseComments, baseViews] = await Promise.all([
    supabase
      .from("media_assets")
      .select("*", { count: "exact", head: true })
      .eq("album_id", albumId)
      .lt("created_at", sinceISO),
    supabase
      .from("media_reactions")
      .select("*, media_assets!inner(album_id)", { count: "exact", head: true })
      .eq("media_assets.album_id", albumId)
      .lt("created_at", sinceISO),
    supabase
      .from("media_comments")
      .select("*, media_assets!inner(album_id)", { count: "exact", head: true })
      .eq("media_assets.album_id", albumId)
      .lt("created_at", sinceISO),
    supabase
      .from("album_views")
      .select("view_count")
      .eq("album_id", albumId)
      .lt("viewed_date", sinceDateStr),
  ])

  const baseViewCount = (baseViews.data ?? []).reduce(
    (sum, r) => sum + ((r.view_count as number) ?? 1),
    0
  )
  let rawCumulative =
    (baseUploads.count ?? 0) +
    (baseLikes.count ?? 0) +
    (baseComments.count ?? 0) +
    baseViewCount

  // 生カウント累積シリーズ
  const rawSeries: { day: string; rawCum: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().slice(0, 10)
    rawCumulative += dayCounts.get(dayStr) ?? 0
    rawSeries.push({ day: dayStr, rawCum: rawCumulative })
  }

  // 比例スケーリング: 今日の生カウント → 今日の重み付きスコア
  const totalRaw = rawCumulative
  const scaleFactor = totalRaw > 0 ? totalWeighted / totalRaw : 0

  return rawSeries.map(({ day, rawCum }) => ({
    day,
    points: Math.round(rawCum * scaleFactor),
  }))
}

/**
 * アルバムの最近のアクティビティ（匿名）を取得
 */
export async function getAlbumRecentActivity(
  albumId: string,
  limit = 5
): Promise<TsunaguRecentActivity[]> {
  const supabase = await createSupabaseServerClient()

  const [uploadsRes, likesRes, commentsRes, viewsRes] = await Promise.all([
    supabase
      .from("media_assets")
      .select("created_at")
      .eq("album_id", albumId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("media_reactions")
      .select("created_at, media_assets!inner(album_id)")
      .eq("media_assets.album_id", albumId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("media_comments")
      .select("created_at, media_assets!inner(album_id)")
      .eq("media_assets.album_id", albumId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("album_views")
      .select("created_at")
      .eq("album_id", albumId)
      .order("created_at", { ascending: false })
      .limit(limit),
  ])

  type RawActivity = { type: "upload" | "like" | "comment" | "view"; created_at: string }
  const all: RawActivity[] = [
    ...(uploadsRes.data ?? []).map((r) => ({ type: "upload" as const, created_at: r.created_at })),
    ...(likesRes.data ?? []).map((r) => ({ type: "like" as const, created_at: r.created_at })),
    ...(commentsRes.data ?? []).map((r) => ({ type: "comment" as const, created_at: r.created_at })),
    ...(viewsRes.data ?? []).map((r) => ({ type: "view" as const, created_at: r.created_at })),
  ]

  all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const top = all.slice(0, limit)

  const messageMap: Record<string, string> = {
    upload: "新しい思い出が追加されました",
    like: "想いが届きました",
    comment: "メッセージが届きました",
    view: "アルバムが閲覧されました",
  }

  return top.map((a) => ({
    type: a.type,
    timeAgo: formatTimeAgo(a.created_at),
    message: messageMap[a.type],
  }))
}

/**
 * アルバムのconnection数を取得
 */
export async function getAlbumConnectionCount(albumId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count } = await supabase
    .from("connections")
    .select("*", { count: "exact", head: true })
    .eq("album_id", albumId)
    .eq("status", "active")
  return count ?? 0
}

/**
 * アルバムの全 active メンバー間の connections を自動生成（ON CONFLICT DO NOTHING）
 */
export async function ensureAlbumConnections(albumId: string): Promise<void> {
  const { data: members } = await supabaseAdmin
    .from("album_members")
    .select("user_id")
    .eq("album_id", albumId)
    .eq("membership_status", "active")

  if (!members || members.length < 2) return

  const userIds = members.map((m) => m.user_id).sort()

  const pairs: { album_id: string; user_low_id: string; user_high_id: string }[] = []
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      pairs.push({
        album_id: albumId,
        user_low_id: userIds[i],
        user_high_id: userIds[j],
      })
    }
  }

  if (pairs.length === 0) return

  await supabaseAdmin
    .from("connections")
    .upsert(pairs, { onConflict: "album_id,user_low_id,user_high_id", ignoreDuplicates: true })
}

/**
 * アルバム閲覧を記録（RPC: increment_album_view）
 */
export async function recordAlbumView(
  albumId: string,
  viewerId: string
): Promise<void> {
  await supabaseAdmin.rpc("increment_album_view", {
    p_album_id: albumId,
    p_viewer_id: viewerId,
  })
}

/**
 * 指標別・期間別の日別データを取得
 */
export async function getAlbumMetricHistory(
  albumId: string,
  metric: MetricType,
  period: MetricPeriod
): Promise<MetricHistoryEntry[]> {
  if (metric === "points") {
    const days = periodToDays(period)
    const history = await getAlbumPointHistory(albumId, days ?? 365)
    return history.map((h) => ({ day: h.day, value: h.points }))
  }

  const supabase = await createSupabaseServerClient()
  const days = periodToDays(period)
  const since = new Date()
  if (days) {
    since.setDate(since.getDate() - days)
  } else {
    since.setFullYear(since.getFullYear() - 10) // "all": 10年前まで
  }
  const sinceISO = since.toISOString()
  const sinceDateStr = sinceISO.slice(0, 10)

  // 日別カウント取得
  const dayCounts = new Map<string, number>()

  if (metric === "views") {
    const { data } = await supabase
      .from("album_views")
      .select("viewed_date, view_count")
      .eq("album_id", albumId)
      .gte("viewed_date", sinceDateStr)
    for (const row of data ?? []) {
      const day = row.viewed_date
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + (row.view_count ?? 1))
    }
  } else if (metric === "uploads") {
    const { data } = await supabase
      .from("media_assets")
      .select("created_at")
      .eq("album_id", albumId)
      .gte("created_at", sinceISO)
    for (const row of data ?? []) {
      const day = row.created_at.slice(0, 10)
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
    }
  } else if (metric === "likes") {
    const { data } = await supabase
      .from("media_reactions")
      .select("created_at, media_assets!inner(album_id)")
      .eq("media_assets.album_id", albumId)
      .gte("created_at", sinceISO)
    for (const row of data ?? []) {
      const day = row.created_at.slice(0, 10)
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
    }
  } else if (metric === "comments") {
    const { data } = await supabase
      .from("media_comments")
      .select("created_at, media_assets!inner(album_id)")
      .eq("media_assets.album_id", albumId)
      .gte("created_at", sinceISO)
    for (const row of data ?? []) {
      const day = row.created_at.slice(0, 10)
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
    }
  }

  // 期間の全日を埋める
  const numDays = days ?? Math.max(
    Math.ceil((Date.now() - since.getTime()) / 86400000),
    1
  )
  const result: MetricHistoryEntry[] = []
  const today = new Date()
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().slice(0, 10)
    result.push({ day: dayStr, value: dayCounts.get(dayStr) ?? 0 })
  }
  return result
}

/**
 * 指標の期間サマリー + 前期間比を取得
 */
export async function getAlbumMetricSummary(
  albumId: string,
  metric: MetricType,
  period: MetricPeriod
): Promise<MetricSummary> {
  const days = periodToDays(period)

  if (metric === "points") {
    // ポイントは累積なので current = 今の合計, previous は概算
    const breakdown = await getAlbumTsunaguPoints(albumId)
    return { current: breakdown.total, previous: 0, changePercent: 0 }
  }

  const supabase = await createSupabaseServerClient()
  const now = new Date()

  // current期間
  const currentSince = new Date(now)
  if (days) currentSince.setDate(currentSince.getDate() - days)
  else currentSince.setFullYear(currentSince.getFullYear() - 10)

  // previous期間
  const previousSince = new Date(currentSince)
  if (days) previousSince.setDate(previousSince.getDate() - days)
  else previousSince.setFullYear(previousSince.getFullYear() - 10)

  const currentCount = await getMetricCount(supabase, albumId, metric, currentSince.toISOString(), now.toISOString())
  const previousCount = await getMetricCount(supabase, albumId, metric, previousSince.toISOString(), currentSince.toISOString())

  let changePercent = 0
  if (previousCount > 0) {
    changePercent = Math.round(((currentCount - previousCount) / previousCount) * 100)
  } else if (currentCount > 0) {
    changePercent = 100
  }

  return { current: currentCount, previous: previousCount, changePercent }
}

/** 期間 → 日数変換 */
function periodToDays(period: MetricPeriod): number | null {
  switch (period) {
    case "1d": return 1
    case "7d": return 7
    case "30d": return 30
    case "all": return null
  }
}

/** 指標のカウントを期間で取得 */
async function getMetricCount(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  albumId: string,
  metric: MetricType,
  sinceISO: string,
  untilISO: string
): Promise<number> {
  const sinceDateStr = sinceISO.slice(0, 10)
  const untilDateStr = untilISO.slice(0, 10)

  if (metric === "views") {
    const { data } = await supabase
      .from("album_views")
      .select("view_count")
      .eq("album_id", albumId)
      .gte("viewed_date", sinceDateStr)
      .lt("viewed_date", untilDateStr)
    return (data ?? []).reduce((sum, r) => sum + ((r.view_count as number) ?? 1), 0)
  } else if (metric === "uploads") {
    const { count } = await supabase
      .from("media_assets")
      .select("*", { count: "exact", head: true })
      .eq("album_id", albumId)
      .gte("created_at", sinceISO)
      .lt("created_at", untilISO)
    return count ?? 0
  } else if (metric === "likes") {
    const { count } = await supabase
      .from("media_reactions")
      .select("*, media_assets!inner(album_id)", { count: "exact", head: true })
      .eq("media_assets.album_id", albumId)
      .gte("created_at", sinceISO)
      .lt("created_at", untilISO)
    return count ?? 0
  } else if (metric === "comments") {
    const { count } = await supabase
      .from("media_comments")
      .select("*, media_assets!inner(album_id)", { count: "exact", head: true })
      .eq("media_assets.album_id", albumId)
      .gte("created_at", sinceISO)
      .lt("created_at", untilISO)
    return count ?? 0
  }
  return 0
}

/** 相対時間表示 */
export function formatTimeAgo(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "たった今"
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}日前`
  const weeks = Math.floor(days / 7)
  return `${weeks}週間前`
}

/**
 * ホーム画面カルーセル用: 複数アルバムのつなぐポイントを一括取得
 * 各アルバムの現在ポイント + 直近7日間のトレンドを算出
 */
export async function getCarouselAlbumPoints(
  albums: AlbumWithMemberCount[]
): Promise<CarouselAlbumPoint[]> {
  if (albums.length === 0) return []

  const results = await Promise.all(
    albums.map(async (album) => {
      const [breakdown, history] = await Promise.all([
        getAlbumTsunaguPoints(album.id),
        getAlbumPointHistory(album.id, 7),
      ])
      const oldestValue = history.length > 0 ? history[0].points : breakdown.total
      const diff = breakdown.total - oldestValue

      return {
        id: album.id,
        name: album.name,
        year: album.year ? `${album.year}年` : "",
        points: breakdown.total,
        threshold: album.tsunagu_threshold,
        activeUsers: album.member_count,
        trend: diff >= 0 ? `+${diff}` : `${diff}`,
      }
    })
  )
  return results
}
