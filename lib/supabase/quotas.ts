import "server-only"

import { supabaseAdmin } from "@/lib/supabase/admin"

// ファイルサイズ上限
export const IMAGE_MAX_BYTES = 20 * 1024 * 1024 // 20 MiB
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024 // 200 MiB
export const USER_QUOTA_BYTES = 256 * 1024 * 1024 // 256 MiB

// 許可 MIME タイプ
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const

export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

/** MIME タイプから media_type を判定。無効なら null */
export function mimeToMediaType(mime: string): "image" | "video" | null {
  if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(mime)) return "image"
  if ((ALLOWED_VIDEO_TYPES as readonly string[]).includes(mime)) return "video"
  return null
}

export interface QuotaInfo {
  quotaBytes: number
  usedBytes: number
  remainingBytes: number
}

/** クォータ情報を取得（読み取り専用、表示用） */
export async function getQuotaInfo(userId: string): Promise<QuotaInfo> {
  const { data, error } = await supabaseAdmin
    .from("user_storage_quotas")
    .select("quota_bytes, used_bytes")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error

  const quotaBytes = (data?.quota_bytes as number) ?? USER_QUOTA_BYTES
  const usedBytes = (data?.used_bytes as number) ?? 0

  return {
    quotaBytes,
    usedBytes,
    remainingBytes: Math.max(0, quotaBytes - usedBytes),
  }
}

/** FOR UPDATE ロック付きでクォータを取得（アップロードトランザクション用） */
export async function getQuotaForUpdate(
  userId: string
): Promise<{ quotaBytes: number; usedBytes: number }> {
  const { data, error } = await supabaseAdmin.rpc("get_quota_for_update", {
    p_user_id: userId,
  })

  if (error) throw error

  const row = Array.isArray(data) ? data[0] : data
  return {
    quotaBytes: (row?.quota_bytes as number) ?? USER_QUOTA_BYTES,
    usedBytes: (row?.used_bytes as number) ?? 0,
  }
}

/** used_bytes を加算 */
export async function incrementUsedBytes(
  userId: string,
  size: number
): Promise<void> {
  const { error } = await supabaseAdmin.rpc("increment_used_bytes", {
    p_user_id: userId,
    p_size: size,
  })
  if (error) throw error
}

/** used_bytes を減算 */
export async function decrementUsedBytes(
  userId: string,
  size: number
): Promise<void> {
  const { error } = await supabaseAdmin.rpc("decrement_used_bytes", {
    p_user_id: userId,
    p_size: size,
  })
  if (error) throw error
}

/** used_bytes を media_assets の実合計で再集計（admin 用） */
export async function reconcileStorageQuotas(): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("reconcile_storage_quotas")
  if (error) throw error
  return (data as number) ?? 0
}
