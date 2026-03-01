"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  getReceivedInvitations,
  respondToInvitation,
  sendInvitation,
  searchUsersForInvite,
  getPendingInvitationCount,
} from "@/lib/supabase/invitations"
import type { InvitationWithDetails } from "@/lib/album-types"

async function getAuthUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("認証が必要です")
  return user.id
}

/** 招待に応答（承認/辞退） */
export async function respondToInvitationAction(
  invitationId: string,
  response: "accepted" | "declined"
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await respondToInvitation({ userId, invitationId, response })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "招待への応答に失敗しました" }
  }
}

/** 招待を送信 */
export async function sendInvitationAction(input: {
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
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "招待の送信に失敗しました" }
  }
}

/** ユーザー検索（招待送信用） */
export async function searchUsersForInviteAction(
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

/** 未読招待件数を取得（BottomBar バッジ用） */
export async function getInvitationBadgeCountAction(): Promise<{
  count?: number
  error?: string
}> {
  try {
    const userId = await getAuthUserId()
    const count = await getPendingInvitationCount(userId)
    return { count }
  } catch {
    return { count: 0 }
  }
}
