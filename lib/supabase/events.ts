import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { generateSignedReadUrl } from "@/lib/gcs"
import type { EventRow, EventTreeNode, MediaAssetRow } from "@/lib/album-types"

export type { EventRow, EventTreeNode, MediaAssetRow } from "@/lib/album-types"

/** object_path を署名付き読み取りURLに変換（既にURLならそのまま返す） */
async function signPath(path: string | null): Promise<string | null> {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return generateSignedReadUrl(path)
}

/** アルバムの全イベントを取得（フラット） */
export async function getEventsByAlbumId(albumId: string): Promise<EventRow[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order")
    .order("starts_at", { ascending: true, nullsFirst: true })

  if (error) throw error
  return (data ?? []) as EventRow[]
}

/** イベント別のメディア数を集計（image/video別） */
async function getMediaCountsByAlbumEvents(
  albumId: string
): Promise<Map<string, { images: number; videos: number }>> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("media_assets")
    .select("event_id, media_type")
    .eq("album_id", albumId)

  if (error) throw error

  const counts = new Map<string, { images: number; videos: number }>()
  for (const row of data ?? []) {
    const eventId = (row.event_id ?? "__album__") as string
    const current = counts.get(eventId) ?? { images: 0, videos: 0 }
    if (row.media_type === "image") current.images++
    else if (row.media_type === "video") current.videos++
    counts.set(eventId, current)
  }

  return counts
}

/** イベント別の最初のメディアサムネイルを取得 */
async function getThumbnailsByAlbumEvents(
  albumId: string
): Promise<Map<string, string | null>> {
  const supabase = await createSupabaseServerClient()

  // 各イベントの最新メディア1件を取得
  const { data, error } = await supabase
    .from("media_assets")
    .select("event_id, thumbnail_path, object_path")
    .eq("album_id", albumId)
    .order("created_at", { ascending: false })

  if (error) throw error

  // 各イベントの最初のサムネイル用パスを収集
  const rawPaths = new Map<string, string | null>()
  for (const row of data ?? []) {
    const eventId = row.event_id as string | null
    if (eventId && !rawPaths.has(eventId)) {
      rawPaths.set(eventId, (row.thumbnail_path ?? row.object_path) as string | null)
    }
  }

  // 署名付きURLに変換
  const thumbnails = new Map<string, string | null>()
  await Promise.all(
    Array.from(rawPaths.entries()).map(async ([eventId, path]) => {
      thumbnails.set(eventId, await signPath(path))
    })
  )

  return thumbnails
}

/** フラットなイベント配列を再帰ツリーに変換（純関数） */
function buildEventTree(
  events: EventRow[],
  mediaCounts: Map<string, { images: number; videos: number }>,
  thumbnails: Map<string, string | null>
): EventTreeNode[] {
  const childrenMap = new Map<string | null, EventRow[]>()

  for (const event of events) {
    const parentId = event.parent_event_id
    const siblings = childrenMap.get(parentId) ?? []
    siblings.push(event)
    childrenMap.set(parentId, siblings)
  }

  function buildNode(event: EventRow): EventTreeNode {
    const counts = mediaCounts.get(event.id) ?? { images: 0, videos: 0 }
    const children = (childrenMap.get(event.id) ?? []).map(buildNode)

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      location: event.location,
      sort_order: event.sort_order,
      image_count: counts.images,
      video_count: counts.videos,
      thumbnail_path: thumbnails.get(event.id) ?? null,
      children,
    }
  }

  // ルートノード（parent_event_id が null）を返す
  return (childrenMap.get(null) ?? []).map(buildNode)
}

/** アルバムのイベントツリーを構築して返す */
export async function getAlbumEventTree(albumId: string): Promise<EventTreeNode[]> {
  const [events, mediaCounts, thumbnails] = await Promise.all([
    getEventsByAlbumId(albumId),
    getMediaCountsByAlbumEvents(albumId),
    getThumbnailsByAlbumEvents(albumId),
  ])

  return buildEventTree(events, mediaCounts, thumbnails)
}

/** 単一イベントをIDで取得 */
export async function getEventById(eventId: string): Promise<EventRow | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle()

  if (error) throw error
  return data as EventRow | null
}

/** 子イベント一覧を取得 */
export async function getChildEvents(eventId: string): Promise<EventRow[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("parent_event_id", eventId)
    .order("sort_order")
    .order("starts_at", { ascending: true, nullsFirst: true })

  if (error) throw error
  return (data ?? []) as EventRow[]
}

/** イベントを作成する（全メンバーが RLS で許可） */
export async function createEvent(input: {
  albumId: string
  parentEventId?: string
  name: string
  startsAt?: string
  endsAt?: string
  description?: string
  location?: string
  createdBy: string
}): Promise<EventRow> {
  const supabase = await createSupabaseServerClient()

  // sort_order を兄弟ノードの最大値 + 1 で設定
  const { data: maxRow } = await supabase
    .from("events")
    .select("sort_order")
    .eq("album_id", input.albumId)
    .is("parent_event_id", input.parentEventId ?? null)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSort = ((maxRow?.sort_order as number | null) ?? -1) + 1

  const { data, error } = await supabase
    .from("events")
    .insert({
      album_id: input.albumId,
      parent_event_id: input.parentEventId ?? null,
      name: input.name,
      starts_at: input.startsAt ?? null,
      ends_at: input.endsAt ?? null,
      description: input.description ?? null,
      location: input.location ?? null,
      sort_order: nextSort,
      created_by: input.createdBy,
    })
    .select("*")
    .single()

  if (error) throw error
  return data as EventRow
}

/** アップローダー名をバッチ取得 */
async function batchFetchUploaderNames(
  uploaderIds: string[]
): Promise<Map<string, string>> {
  if (uploaderIds.length === 0) return new Map()
  const { supabaseAdmin } = await import("@/lib/supabase/admin")
  const unique = [...new Set(uploaderIds)]
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name")
    .in("id", unique)
  if (error) return new Map()
  const map = new Map<string, string>()
  for (const row of data ?? []) {
    map.set(row.id as string, row.display_name as string)
  }
  return map
}

/** いいね数・コメント数をバッチ取得（N+1解消） */
async function batchFetchMediaCounts(
  mediaIds: string[]
): Promise<{ likes: Map<string, number>; comments: Map<string, number> }> {
  if (mediaIds.length === 0) {
    return { likes: new Map(), comments: new Map() }
  }
  const supabase = await createSupabaseServerClient()

  const [likesRes, commentsRes] = await Promise.all([
    supabase.from("media_reactions").select("media_id").in("media_id", mediaIds),
    supabase.from("media_comments").select("media_id").in("media_id", mediaIds),
  ])

  const likes = new Map<string, number>()
  for (const row of likesRes.data ?? []) {
    likes.set(row.media_id, (likes.get(row.media_id) ?? 0) + 1)
  }
  const comments = new Map<string, number>()
  for (const row of commentsRes.data ?? []) {
    comments.set(row.media_id, (comments.get(row.media_id) ?? 0) + 1)
  }

  return { likes, comments }
}

/** メディア行を署名付きURLに変換しつつ MediaAssetRow に整形 */
async function enrichMediaRows(
  data: Record<string, unknown>[],
  counts: { likes: Map<string, number>; comments: Map<string, number> },
  uploaderNames: Map<string, string>
): Promise<MediaAssetRow[]> {
  return Promise.all(
    data.map(async (row) => {
      const event = row.events as unknown as { name: string } | null
      const objPath = row.object_path as string
      const thumbPath = row.thumbnail_path as string | null
      const id = row.id as string
      const [signedObj, signedThumb] = await Promise.all([
        signPath(objPath),
        signPath(thumbPath),
      ])
      return {
        id,
        album_id: row.album_id as string,
        event_id: row.event_id as string | null,
        uploader_id: row.uploader_id as string,
        media_type: row.media_type as "image" | "video",
        object_path: signedObj ?? objPath,
        thumbnail_path: signedThumb,
        captured_at: row.captured_at as string | null,
        created_at: row.created_at as string,
        event_name: event?.name ?? null,
        like_count: counts.likes.get(id) ?? 0,
        comment_count: counts.comments.get(id) ?? 0,
        uploader_name: uploaderNames.get(row.uploader_id as string) ?? null,
      }
    })
  )
}

/** アルバムのメディアをページネーション付きで取得 */
export async function getMediaByAlbumId(
  albumId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ media: MediaAssetRow[]; total: number }> {
  const supabase = await createSupabaseServerClient()
  const limit = options.limit ?? 20
  const offset = options.offset ?? 0

  const query = supabase
    .from("media_assets")
    .select("id, album_id, event_id, uploader_id, media_type, object_path, thumbnail_path, captured_at, created_at, events(name)", { count: "exact" })
    .eq("album_id", albumId)
    .order("captured_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) throw error
  if (!data || data.length === 0) return { media: [], total: count ?? 0 }

  const mediaIds = data.map((r) => r.id as string)
  const uploaderIds = data.map((r) => r.uploader_id as string)

  const [counts, uploaderNames] = await Promise.all([
    batchFetchMediaCounts(mediaIds),
    batchFetchUploaderNames(uploaderIds),
  ])

  const media = await enrichMediaRows(data, counts, uploaderNames)
  return { media, total: count ?? media.length }
}

/** イベントのメディアを取得（いいね数・コメント数・アップローダー名付き） */
export async function getMediaByEventId(eventId: string): Promise<MediaAssetRow[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("media_assets")
    .select("id, album_id, event_id, uploader_id, media_type, object_path, thumbnail_path, captured_at, created_at, events(name)")
    .eq("event_id", eventId)
    .order("captured_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  if (!data || data.length === 0) return []

  const mediaIds = data.map((r) => r.id as string)
  const uploaderIds = data.map((r) => r.uploader_id as string)

  const [counts, uploaderNames] = await Promise.all([
    batchFetchMediaCounts(mediaIds),
    batchFetchUploaderNames(uploaderIds),
  ])

  return enrichMediaRows(data, counts, uploaderNames)
}
