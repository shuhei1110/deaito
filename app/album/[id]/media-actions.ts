"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createNotification } from "@/lib/supabase/notifications"
import { deleteObject } from "@/lib/gcs"
import { decrementUsedBytes } from "@/lib/supabase/quotas"

async function getAuthUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("認証が必要です")
  return user.id
}

/** 閲覧を記録 + 閲覧数を返す */
export async function recordMediaViewAction(
  mediaId: string
): Promise<{ viewCount: number }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { viewCount: 0 }
  }

  await supabase
    .from("media_views")
    .upsert(
      { media_id: mediaId, viewer_id: user.id },
      { onConflict: "media_id,viewer_id" }
    )

  const { count } = await supabase
    .from("media_views")
    .select("*", { count: "exact", head: true })
    .eq("media_id", mediaId)

  return { viewCount: count ?? 0 }
}

/** 現在のいいね状態を取得 */
export async function getMediaLikeStatusAction(
  mediaId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { liked: false, likeCount: 0 }
  }

  const [{ data: existing }, { count }] = await Promise.all([
    supabase
      .from("media_reactions")
      .select("id")
      .eq("media_id", mediaId)
      .eq("user_id", user.id)
      .eq("reaction", "like")
      .maybeSingle(),
    supabase
      .from("media_reactions")
      .select("*", { count: "exact", head: true })
      .eq("media_id", mediaId),
  ])

  return { liked: !!existing, likeCount: count ?? 0 }
}

/** いいねトグル */
export async function toggleMediaLikeAction(
  mediaId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const userId = await getAuthUserId()
  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from("media_reactions")
    .select("id")
    .eq("media_id", mediaId)
    .eq("user_id", userId)
    .eq("reaction", "like")
    .maybeSingle()

  let liked: boolean

  if (existing) {
    await supabase
      .from("media_reactions")
      .delete()
      .eq("id", existing.id)
    liked = false
  } else {
    await supabase
      .from("media_reactions")
      .insert({ media_id: mediaId, user_id: userId, reaction: "like" })
    liked = true
  }

  const { count } = await supabase
    .from("media_reactions")
    .select("*", { count: "exact", head: true })
    .eq("media_id", mediaId)

  // いいね追加時のみ通知を生成（自分自身以外）
  if (liked) {
    const { data: media } = await supabase
      .from("media_assets")
      .select("uploader_id, album_id, media_type")
      .eq("id", mediaId)
      .maybeSingle()

    if (media && media.uploader_id !== userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle()

      const name = (profile?.display_name as string) ?? "ユーザー"
      const mediaLabel = media.media_type === "video" ? "動画" : "写真"

      createNotification({
        userId: media.uploader_id as string,
        type: "like",
        title: "いいね",
        body: `${name}さんがあなたの${mediaLabel}にいいねしました`,
        link: `/album/${media.album_id}`,
      }).catch(() => {})
    }
  }

  return { liked, likeCount: count ?? 0 }
}

/** コメント一覧取得 */
export async function getMediaCommentsAction(
  mediaId: string
): Promise<{
  comments: { id: string; body: string; createdAt: string; userName: string }[]
}> {
  const supabase = await createSupabaseServerClient()

  const { data: comments, error } = await supabase
    .from("media_comments")
    .select("id, user_id, body, created_at")
    .eq("media_id", mediaId)
    .order("created_at", { ascending: true })

  if (error) {
    return { comments: [] }
  }

  const userIds = [...new Set((comments ?? []).map((c) => c.user_id as string))]
  const profileMap = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds)

    for (const p of profiles ?? []) {
      profileMap.set(p.id as string, p.display_name as string)
    }
  }

  const result = (comments ?? []).map((c) => ({
    id: c.id as string,
    body: c.body as string,
    createdAt: c.created_at as string,
    userName: profileMap.get(c.user_id as string) ?? "ユーザー",
  }))

  return { comments: result }
}

/** コメント投稿 */
export async function postMediaCommentAction(
  mediaId: string,
  body: string
): Promise<{ success: boolean; commentCount: number; error?: string }> {
  const userId = await getAuthUserId()
  const supabase = await createSupabaseServerClient()

  if (!body || body.trim().length === 0) {
    return { success: false, commentCount: 0, error: "コメントを入力してください" }
  }

  const { error } = await supabase
    .from("media_comments")
    .insert({ media_id: mediaId, user_id: userId, body: body.trim() })

  if (error) {
    return { success: false, commentCount: 0, error: "コメントの投稿に失敗しました" }
  }

  const { count } = await supabase
    .from("media_comments")
    .select("*", { count: "exact", head: true })
    .eq("media_id", mediaId)

  // コメント通知を生成（自分自身以外）
  const { data: media } = await supabase
    .from("media_assets")
    .select("uploader_id, album_id, media_type")
    .eq("id", mediaId)
    .maybeSingle()

  if (media && media.uploader_id !== userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle()

    const name = (profile?.display_name as string) ?? "ユーザー"
    const mediaLabel = media.media_type === "video" ? "動画" : "写真"

    createNotification({
      userId: media.uploader_id as string,
      type: "comment",
      title: "コメント",
      body: `${name}さんがあなたの${mediaLabel}にコメントしました`,
      link: `/album/${media.album_id}`,
    }).catch(() => {})
  }

  return { success: true, commentCount: count ?? 0 }
}

/** メディア削除 */
export async function deleteMediaAction(
  mediaId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getAuthUserId()
  const supabase = await createSupabaseServerClient()

  // メディア情報を取得（RLS で member チェック）
  const { data: asset, error: fetchError } = await supabase
    .from("media_assets")
    .select("id, album_id, uploader_id, object_path, size_bytes")
    .eq("id", mediaId)
    .maybeSingle()

  if (fetchError || !asset) {
    return { success: false, error: "メディアが見つかりません" }
  }

  // GCS からオブジェクトを削除
  try {
    await deleteObject(asset.object_path as string)
  } catch {
    // GCS 削除失敗は無視（オブジェクトが既に存在しない可能性がある）
  }

  // DB から media_assets 行を削除（RLS で uploader or admin のみ許可）
  const { error: deleteError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", mediaId)

  if (deleteError) {
    return { success: false, error: "削除権限がありません" }
  }

  // used_bytes を減算（admin 経由の security definer RPC）
  const sizeBytes = (asset.size_bytes as number) ?? 0
  if (sizeBytes > 0) {
    try {
      await decrementUsedBytes(asset.uploader_id as string, sizeBytes)
    } catch {
      // クォータ減算失敗はログのみ（メディアは既に削除済み）
    }
  }

  return { success: true }
}
