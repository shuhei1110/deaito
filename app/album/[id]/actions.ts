"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { regenerateJoinCode, removeMember, changeMemberRole, updateAlbumThreshold, deleteAlbum } from "@/lib/supabase/albums"
import { createEvent, getMediaByAlbumId } from "@/lib/supabase/events"
import type { MediaAssetRow } from "@/lib/album-types"
import { sendInvitation, searchUsersForInvite } from "@/lib/supabase/invitations"
import { recordAlbumView } from "@/lib/supabase/connections"
import { createNotification } from "@/lib/supabase/notifications"
import type { EventRow } from "@/lib/album-types"

async function getAuthUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("認証が必要です")
  return user.id
}

export async function regenerateJoinCodeAction(
  albumId: string
): Promise<{ joinCode?: string; error?: string }> {
  try {
    const userId = await getAuthUserId()
    const joinCode = await regenerateJoinCode({ userId, albumId })
    return { joinCode }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "招待コードの再生成に失敗しました" }
  }
}

export async function createEventAction(input: {
  albumId: string
  parentEventId?: string
  name: string
  startsAt?: string
  description?: string
}): Promise<{ event?: EventRow; error?: string }> {
  try {
    const userId = await getAuthUserId()
    const event = await createEvent({
      albumId: input.albumId,
      parentEventId: input.parentEventId,
      name: input.name,
      startsAt: input.startsAt,
      description: input.description,
      createdBy: userId,
    })
    return { event }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "イベントの作成に失敗しました" }
  }
}

export async function removeMemberAction(
  albumId: string,
  targetUserId: string
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await removeMember({ userId, albumId, targetUserId })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "メンバーの退出に失敗しました" }
  }
}

export async function changeMemberRoleAction(
  albumId: string,
  targetUserId: string,
  newRole: "admin" | "member"
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await changeMemberRole({ userId, albumId, targetUserId, newRole })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "ロールの変更に失敗しました" }
  }
}

export async function sendInvitationFromAlbumAction(input: {
  albumId: string
  recipientId: string
  message?: string
}): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await sendInvitation({
      senderId: userId,
      albumId: input.albumId,
      recipientId: input.recipientId,
      message: input.message,
    })

    // 招待通知を生成
    const [{ data: senderProfile }, { data: album }] = await Promise.all([
      supabaseAdmin.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("albums").select("name").eq("id", input.albumId).maybeSingle(),
    ])
    const senderName = (senderProfile?.display_name as string) ?? "ユーザー"
    const albumName = (album?.name as string) ?? "アルバム"

    createNotification({
      userId: input.recipientId,
      type: "invitation",
      title: "新しい招待状",
      body: `${senderName}さんから「${albumName}」への招待が届きました`,
      link: `/albums`,
    }).catch(() => {})

    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "招待の送信に失敗しました" }
  }
}

export async function recordAlbumViewAction(
  albumId: string
): Promise<void> {
  try {
    const userId = await getAuthUserId()
    await recordAlbumView(albumId, userId)
  } catch {
    // 閲覧記録の失敗はユーザーに影響しない
  }
}

export async function updateAlbumThresholdAction(
  albumId: string,
  threshold: number
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await updateAlbumThreshold({ userId, albumId, threshold })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "しきい値の更新に失敗しました" }
  }
}

export async function searchUsersForInviteFromAlbumAction(
  albumId: string,
  query: string
): Promise<{
  users?: { id: string; display_name: string; username: string | null; avatar_url: string | null }[]
  error?: string
}> {
  try {
    await getAuthUserId()
    const users = await searchUsersForInvite({ albumId, query })
    return { users }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "ユーザーの検索に失敗しました" }
  }
}

export async function loadMoreMediaAction(
  albumId: string,
  offset: number,
  limit: number = 20
): Promise<{ media: MediaAssetRow[]; total: number }> {
  await getAuthUserId()
  return getMediaByAlbumId(albumId, { limit, offset })
}

export async function deleteAlbumAction(
  albumId: string
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await deleteAlbum({ userId, albumId })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "アルバムの削除に失敗しました" }
  }
}
