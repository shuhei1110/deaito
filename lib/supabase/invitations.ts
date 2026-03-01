import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { InvitationStatus, InvitationWithDetails } from "@/lib/album-types"

export type { InvitationStatus, InvitationWithDetails } from "@/lib/album-types"

/** 受信済み招待一覧を取得（pending のみ） */
export async function getReceivedInvitations(
  userId: string
): Promise<InvitationWithDetails[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("invitations")
    .select(
      "id, album_id, sender_id, message, status, sent_at, created_at, albums(name, category, year), profiles!invitations_sender_id_fkey(display_name, avatar_url)"
    )
    .eq("recipient_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) throw error
  if (!data) return []

  return data.map((row) => {
    const album = row.albums as unknown as {
      name: string
      category: string
      year: number | null
    }
    const sender = row.profiles as unknown as {
      display_name: string
      avatar_url: string | null
    }
    return {
      id: row.id as string,
      album_id: row.album_id as string,
      album_name: album?.name ?? "",
      album_category: (album?.category ?? "school") as InvitationWithDetails["album_category"],
      album_year: album?.year ?? null,
      sender_id: row.sender_id as string,
      sender_display_name: sender?.display_name ?? "",
      sender_avatar_url: sender?.avatar_url ?? null,
      message: row.message as string | null,
      status: row.status as InvitationStatus,
      sent_at: row.sent_at as string | null,
      created_at: row.created_at as string,
    }
  })
}

/** 単一招待を取得 */
export async function getInvitationById(
  invitationId: string
): Promise<InvitationWithDetails | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("invitations")
    .select(
      "id, album_id, sender_id, message, status, sent_at, created_at, albums(name, category, year), profiles!invitations_sender_id_fkey(display_name, avatar_url)"
    )
    .eq("id", invitationId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const album = data.albums as unknown as {
    name: string
    category: string
    year: number | null
  }
  const sender = data.profiles as unknown as {
    display_name: string
    avatar_url: string | null
  }
  return {
    id: data.id as string,
    album_id: data.album_id as string,
    album_name: album?.name ?? "",
    album_category: (album?.category ?? "school") as InvitationWithDetails["album_category"],
    album_year: album?.year ?? null,
    sender_id: data.sender_id as string,
    sender_display_name: sender?.display_name ?? "",
    sender_avatar_url: sender?.avatar_url ?? null,
    message: data.message as string | null,
    status: data.status as InvitationStatus,
    sent_at: data.sent_at as string | null,
    created_at: data.created_at as string,
  }
}

/** pending 招待の件数を取得（バッジ用） */
export async function getPendingInvitationCount(
  userId: string
): Promise<number> {
  const supabase = await createSupabaseServerClient()

  const { count, error } = await supabase
    .from("invitations")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("status", "pending")

  if (error) throw error
  return count ?? 0
}

/** 招待を送信 */
export async function sendInvitation(input: {
  senderId: string
  albumId: string
  recipientId: string
  message?: string
}): Promise<void> {
  // 自分自身には送れない
  if (input.senderId === input.recipientId) {
    throw new Error("自分自身を招待することはできません")
  }

  // 送信者がアクティブメンバーか確認
  const { data: senderMembership } = await supabaseAdmin
    .from("album_members")
    .select("membership_status")
    .eq("album_id", input.albumId)
    .eq("user_id", input.senderId)
    .eq("membership_status", "active")
    .maybeSingle()

  if (!senderMembership) {
    throw new Error("アルバムのメンバーのみ招待を送信できます")
  }

  // 受信者が既にアクティブメンバーか確認
  const { data: recipientMembership } = await supabaseAdmin
    .from("album_members")
    .select("membership_status")
    .eq("album_id", input.albumId)
    .eq("user_id", input.recipientId)
    .eq("membership_status", "active")
    .maybeSingle()

  if (recipientMembership) {
    throw new Error("このユーザーは既にアルバムのメンバーです")
  }

  // 同じアルバムへの pending 招待が既にあるか確認
  const { data: existingInvitation } = await supabaseAdmin
    .from("invitations")
    .select("id")
    .eq("album_id", input.albumId)
    .eq("recipient_id", input.recipientId)
    .eq("status", "pending")
    .maybeSingle()

  if (existingInvitation) {
    throw new Error("このユーザーには既に招待を送信済みです")
  }

  // 招待を作成
  const { error } = await supabaseAdmin.from("invitations").insert({
    album_id: input.albumId,
    sender_id: input.senderId,
    recipient_id: input.recipientId,
    message: input.message ?? null,
    status: "pending",
    sent_at: new Date().toISOString(),
  })

  if (error) throw error
}

/** 招待に応答（承認/辞退） */
export async function respondToInvitation(input: {
  userId: string
  invitationId: string
  response: "accepted" | "declined"
}): Promise<void> {
  // 招待を取得して検証
  const { data: invitation, error: fetchError } = await supabaseAdmin
    .from("invitations")
    .select("id, album_id, recipient_id, status")
    .eq("id", input.invitationId)
    .single()

  if (fetchError || !invitation) {
    throw new Error("招待が見つかりません")
  }

  if (invitation.recipient_id !== input.userId) {
    throw new Error("この招待に応答する権限がありません")
  }

  if (invitation.status !== "pending") {
    throw new Error("この招待は既に処理済みです")
  }

  // ステータスを更新
  const { error: updateError } = await supabaseAdmin
    .from("invitations")
    .update({
      status: input.response,
      responded_at: new Date().toISOString(),
    })
    .eq("id", input.invitationId)

  if (updateError) throw updateError

  // 承認時はアルバムメンバーに追加
  if (input.response === "accepted") {
    const albumId = invitation.album_id as string

    // 既存のメンバーシップを確認
    const { data: existing } = await supabaseAdmin
      .from("album_members")
      .select("membership_status")
      .eq("album_id", albumId)
      .eq("user_id", input.userId)
      .maybeSingle()

    if (existing?.membership_status === "active") {
      // 既にメンバー（重複回避）
      return
    }

    if (existing) {
      // pending/rejected → active に昇格
      await supabaseAdmin
        .from("album_members")
        .update({
          membership_status: "active",
          joined_at: new Date().toISOString(),
        })
        .eq("album_id", albumId)
        .eq("user_id", input.userId)
    } else {
      // 新規メンバーとして追加
      await supabaseAdmin.from("album_members").insert({
        album_id: albumId,
        user_id: input.userId,
        role: "member",
        membership_status: "active",
        joined_at: new Date().toISOString(),
      })
    }
  }
}

/** ユーザー検索（招待送信用、既メンバー・既招待済みを除外） */
export async function searchUsersForInvite(input: {
  albumId: string
  query: string
}): Promise<
  { id: string; display_name: string; username: string | null; avatar_url: string | null }[]
> {
  if (!input.query || input.query.length < 1) return []

  // 全プロフィールから検索
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .or(`display_name.ilike.%${input.query}%,username.ilike.%${input.query}%`)
    .limit(20)

  if (error) throw error
  if (!profiles || profiles.length === 0) return []

  // 既にアクティブメンバーのユーザーIDを取得
  const { data: members } = await supabaseAdmin
    .from("album_members")
    .select("user_id")
    .eq("album_id", input.albumId)
    .eq("membership_status", "active")

  const memberIds = new Set((members ?? []).map((m) => m.user_id as string))

  // 既に pending 招待があるユーザーIDを取得
  const { data: pendingInvitations } = await supabaseAdmin
    .from("invitations")
    .select("recipient_id")
    .eq("album_id", input.albumId)
    .eq("status", "pending")

  const pendingIds = new Set(
    (pendingInvitations ?? []).map((i) => i.recipient_id as string)
  )

  // フィルタして返す
  return profiles
    .filter((p) => !memberIds.has(p.id as string) && !pendingIds.has(p.id as string))
    .slice(0, 10)
    .map((p) => ({
      id: p.id as string,
      display_name: p.display_name as string,
      username: p.username as string | null,
      avatar_url: p.avatar_url as string | null,
    }))
}
