export type AlbumCategory = "school" | "club" | "circle" | "friends" | "seminar" | "company"

export interface AlbumWithMemberCount {
  id: string
  name: string
  category: AlbumCategory
  year: number | null
  location: string | null
  description: string | null
  visibility: "private" | "members" | "public"
  owner_id: string
  created_at: string
  updated_at: string
  member_count: number
  tsunagu_threshold: number
}

/** ホーム画面カルーセル用のアルバムポイントデータ */
export interface CarouselAlbumPoint {
  id: string
  name: string
  year: string
  points: number
  threshold: number
  activeUsers: number
  trend: string
}

/** 検索結果用の拡張型（作成者名を含む） */
export interface AlbumSearchResult extends AlbumWithMemberCount {
  owner_name: string
}

/** DB events テーブルの行 */
export interface EventRow {
  id: string
  album_id: string
  parent_event_id: string | null
  name: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  location: string | null
  sort_order: number
  created_by: string
  created_at: string
  updated_at: string
}

/** イベントツリーノード（再帰構造、ブランチツリーUI用） */
export interface EventTreeNode {
  id: string
  name: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  location: string | null
  sort_order: number
  image_count: number
  video_count: number
  thumbnail_path: string | null
  children: EventTreeNode[]
}

/** DB media_assets テーブルの行 + join情報 */
export interface MediaAssetRow {
  id: string
  album_id: string
  event_id: string | null
  uploader_id: string
  media_type: "image" | "video"
  object_path: string
  thumbnail_path: string | null
  captured_at: string | null
  created_at: string
  event_name?: string | null
  like_count?: number
  comment_count?: number
  uploader_name?: string | null
}

/** アルバムメンバー + プロフィール情報 */
export interface AlbumMemberWithProfile {
  user_id: string
  role: "owner" | "admin" | "member"
  membership_status: "active" | "pending" | "left"
  joined_at: string | null
  display_name: string
  username: string | null
  avatar_url: string | null
}

/** ユーザーのアルバム内ロール（非メンバーは null） */
export type UserAlbumRole = "owner" | "admin" | "member" | null

/** 招待ステータス */
export type InvitationStatus = "pending" | "accepted" | "declined" | "cancelled"

/** 招待状一覧表示用（sender/album の情報を join） */
export interface InvitationWithDetails {
  id: string
  album_id: string
  album_name: string
  album_category: AlbumCategory
  album_year: number | null
  sender_id: string
  sender_display_name: string
  sender_avatar_url: string | null
  message: string | null
  status: InvitationStatus
  sent_at: string | null
  created_at: string
}

/** つなぐポイント内訳（重み付きスコア） */
export interface TsunaguPointBreakdown {
  views: number
  uploads: number
  likes: number
  comments: number
  total: number
  rawViews: number
  rawUploads: number
  rawLikes: number
  rawComments: number
}

/** つなぐポイント推移（1日分） */
export interface TsunaguPointHistoryEntry {
  day: string // ISO date (YYYY-MM-DD)
  points: number
}

/** つなぐ最近のアクティビティ（匿名） */
export interface TsunaguRecentActivity {
  type: "upload" | "like" | "comment" | "view"
  timeAgo: string
  message: string
}

/** Analytics ダッシュボード: 期間・指標 */
export type MetricPeriod = "1d" | "7d" | "30d" | "all"
export type MetricType = "points" | "views" | "uploads" | "likes" | "comments"

export interface MetricHistoryEntry {
  day: string   // "YYYY-MM-DD"
  value: number
}

export interface MetricSummary {
  current: number
  previous: number
  changePercent: number // 増減率 (%)
}

/** ホーム画面アクティビティフィード用 */
export type HomeActivityType = "upload" | "like" | "comment" | "join"

export interface HomeActivity {
  id: string
  type: HomeActivityType
  user: { id: string; name: string; avatar_url: string | null }
  action: string
  content: {
    type?: "image" | "video"
    title?: string
    albumName: string
    albumId: string
    comment?: string
  }
  createdAt: string
  timeAgo: string
}

// 本棚UIの背表紙カラーを決定するためのパレット
const SPINE_COLORS = [
  "#f5e6d8", "#e8ddd0", "#e5d8c8", "#ddd2c4",
  "#d9cfc2", "#e2d5c6", "#f0e5d8", "#dcd1c3",
  "#e6dace", "#d8cdc0", "#e3d6c7", "#ede2d5",
]

/** UUIDから決定的に背表紙カラーを導出 */
export function getSpineColor(albumId: string): { color: string; textColor: string } {
  let hash = 0
  for (const ch of albumId) {
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  }
  const index = Math.abs(hash) % SPINE_COLORS.length
  return { color: SPINE_COLORS[index], textColor: "#5c5248" }
}
