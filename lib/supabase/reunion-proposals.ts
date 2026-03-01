import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getMyAlbums, getAlbumMembers } from "@/lib/supabase/albums"
import { getAlbumTsunaguPoints } from "@/lib/supabase/connections"

export interface ReunionProposalMember {
  userId: string
  displayName: string
  avatarUrl: string | null
  activityLabels: string[]
}

export interface ReunionProposal {
  id: string
  albumId: string
  title: string
  reason: string
  members: ReunionProposalMember[]
  matchScore: number
  commonActivities: string[]
}

/** メンバー毎のアクティビティ数を取得 */
async function getMemberActivityCounts(
  albumId: string
): Promise<
  Map<string, { uploads: number; likes: number; comments: number }>
> {
  const supabase = await createSupabaseServerClient()

  // アップロード数
  const { data: uploads } = await supabase
    .from("media_assets")
    .select("uploader_id")
    .eq("album_id", albumId)

  // アルバム内メディアID取得
  const { data: mediaIds } = await supabase
    .from("media_assets")
    .select("id")
    .eq("album_id", albumId)

  const ids = (mediaIds ?? []).map((m) => m.id)

  let likesData: { user_id: string }[] = []
  let commentsData: { user_id: string }[] = []

  if (ids.length > 0) {
    const [likesRes, commentsRes] = await Promise.all([
      supabase.from("media_reactions").select("user_id").in("media_id", ids),
      supabase.from("media_comments").select("user_id").in("media_id", ids),
    ])
    likesData = (likesRes.data ?? []) as { user_id: string }[]
    commentsData = (commentsRes.data ?? []) as { user_id: string }[]
  }

  const counts = new Map<
    string,
    { uploads: number; likes: number; comments: number }
  >()

  const getOrCreate = (userId: string) => {
    if (!counts.has(userId)) {
      counts.set(userId, { uploads: 0, likes: 0, comments: 0 })
    }
    return counts.get(userId)!
  }

  for (const row of uploads ?? []) {
    getOrCreate(row.uploader_id).uploads++
  }
  for (const row of likesData) {
    getOrCreate(row.user_id).likes++
  }
  for (const row of commentsData) {
    getOrCreate(row.user_id).comments++
  }

  return counts
}

/** アクティビティ数からラベルを生成 */
function generateActivityLabels(activity: {
  uploads: number
  likes: number
  comments: number
}): string[] {
  const labels: string[] = []
  const total = activity.uploads + activity.likes + activity.comments

  if (activity.uploads >= 3) labels.push("写真好き")
  if (activity.likes >= 5) labels.push("いいね上手")
  if (activity.comments >= 3) labels.push("コメント上手")
  if (total >= 10 && labels.length === 0) labels.push("アクティブ")

  return labels
}

/** アルバム全体の共通アクティビティラベルを生成 */
function generateCommonActivities(points: {
  rawUploads: number
  rawLikes: number
  rawComments: number
  rawViews: number
}): string[] {
  const activities: string[] = []
  if (points.rawUploads > 0) activities.push("写真共有")
  if (points.rawLikes > 0) activities.push("いいね")
  if (points.rawComments > 0) activities.push("コメント")
  if (points.rawViews > 0) activities.push("閲覧")
  return activities
}

/** ユーザーの参加アルバムから同窓会提案を自動生成 */
export async function generateReunionProposals(
  userId: string
): Promise<ReunionProposal[]> {
  const albums = await getMyAlbums(userId)
  if (albums.length === 0) return []

  const proposals: ReunionProposal[] = []

  await Promise.all(
    albums.map(async (album) => {
      // メンバー3人以上のみ対象
      if (album.member_count < 3) return

      const [members, points, activityCounts] = await Promise.all([
        getAlbumMembers(album.id),
        getAlbumTsunaguPoints(album.id),
        getMemberActivityCounts(album.id),
      ])

      // アクティビティが全くないアルバムは提案しない
      if (points.total === 0) return

      const threshold = album.tsunagu_threshold || 100
      const matchScore = Math.min(
        100,
        Math.round((points.total / threshold) * 100)
      )

      const proposalMembers: ReunionProposalMember[] = members.map((m) => {
        const activity = activityCounts.get(m.user_id) ?? {
          uploads: 0,
          likes: 0,
          comments: 0,
        }
        return {
          userId: m.user_id,
          displayName: m.display_name,
          avatarUrl: m.avatar_url,
          activityLabels: generateActivityLabels(activity),
        }
      })

      const yearLabel = album.year ? `${album.year}年` : ""
      const reason =
        points.rawUploads > 0 && points.rawComments > 0
          ? `${album.member_count}人のメンバーが写真やコメントで活発に交流しています。共通の思い出を振り返る再会の機会はいかがですか？`
          : points.rawUploads > 0
            ? `${album.member_count}人のメンバーが写真を共有しています。みんなで思い出を語り合う場を設けませんか？`
            : `${album.member_count}人のメンバーがアルバムに参加しています。久しぶりに集まってみませんか？`

      proposals.push({
        id: album.id,
        albumId: album.id,
        title: `${album.name}${yearLabel ? ` ${yearLabel}` : ""} 同窓会`,
        reason,
        members: proposalMembers,
        matchScore,
        commonActivities: generateCommonActivities(points),
      })
    })
  )

  // マッチ度の高い順にソート
  proposals.sort((a, b) => b.matchScore - a.matchScore)

  return proposals
}
