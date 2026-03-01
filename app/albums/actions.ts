"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  createAlbum,
  joinAlbum,
  joinAlbumByCode,
  searchPublicAlbums,
  getAlbumJoinCode,
  requestJoinAlbum,
  getPendingRequests,
  approveJoinRequest,
  rejectJoinRequest,
  type AlbumCategory,
  type AlbumWithMemberCount,
  type AlbumSearchResult,
} from "@/lib/supabase/albums"

async function getAuthUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("認証が必要です")
  return user.id
}

export async function createAlbumAction(input: {
  name: string
  category?: AlbumCategory
  year?: number
  location?: string
}): Promise<{ album?: AlbumWithMemberCount; joinCode?: string; error?: string }> {
  try {
    const userId = await getAuthUserId()
    const { album, joinCode } = await createAlbum({ userId, ...input })
    return { album, joinCode }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "アルバムの作成に失敗しました" }
  }
}

export async function joinAlbumAction(
  albumId: string,
  joinCode: string
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await joinAlbum({ userId, albumId, joinCode })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "アルバムへの参加に失敗しました" }
  }
}

export async function joinAlbumByCodeAction(
  joinCode: string
): Promise<{ albumId?: string; albumName?: string; error?: string }> {
  try {
    const userId = await getAuthUserId()
    const result = await joinAlbumByCode({ userId, joinCode })
    return { albumId: result.albumId, albumName: result.albumName }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "アルバムへの参加に失敗しました" }
  }
}

export async function searchAlbumsAction(
  query: string,
  category?: AlbumCategory,
  year?: number
): Promise<{ albums?: AlbumSearchResult[]; error?: string }> {
  try {
    const userId = await getAuthUserId()
    const albums = await searchPublicAlbums(userId, { query, category, year })
    return { albums }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "検索に失敗しました" }
  }
}

export async function requestJoinAlbumAction(
  albumId: string
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await requestJoinAlbum({ userId, albumId })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "リクエストの送信に失敗しました" }
  }
}

export async function getPendingRequestsAction(
  albumId: string
): Promise<{ requests?: { user_id: string; display_name: string; username: string | null }[]; error?: string }> {
  try {
    const userId = await getAuthUserId()
    const requests = await getPendingRequests({ userId, albumId })
    return { requests }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "リクエスト一覧の取得に失敗しました" }
  }
}

export async function approveJoinRequestAction(
  albumId: string,
  requestUserId: string
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await approveJoinRequest({ userId, albumId, requestUserId })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "承認に失敗しました" }
  }
}

export async function rejectJoinRequestAction(
  albumId: string,
  requestUserId: string
): Promise<{ error?: string }> {
  try {
    const userId = await getAuthUserId()
    await rejectJoinRequest({ userId, albumId, requestUserId })
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "拒否に失敗しました" }
  }
}

export async function getAlbumJoinCodeAction(
  albumId: string
): Promise<{ joinCode?: string; error?: string }> {
  try {
    const userId = await getAuthUserId()
    const joinCode = await getAlbumJoinCode({ userId, albumId })
    return { joinCode }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "招待コードの取得に失敗しました" }
  }
}
