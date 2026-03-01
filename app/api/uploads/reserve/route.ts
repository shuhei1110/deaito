import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { generateSignedUploadUrl } from "@/lib/gcs"
import {
  mimeToMediaType,
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
  getQuotaForUpdate,
} from "@/lib/supabase/quotas"

export async function POST(request: NextRequest) {
  try {
    // 1. 認証チェック
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "認証が必要です" },
        { status: 401 }
      )
    }

    // 2. リクエストボディ検証
    const body = await request.json()
    const { albumId, eventId, fileName, fileSize, mimeType } = body as {
      albumId?: string
      eventId?: string
      fileName?: string
      fileSize?: number
      mimeType?: string
    }

    if (!albumId || !eventId || !fileName || !fileSize || !mimeType) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "必須パラメータが不足しています" },
        { status: 400 }
      )
    }

    // 3. MIME タイプ検証
    const mediaType = mimeToMediaType(mimeType)
    if (!mediaType) {
      return NextResponse.json(
        { code: "INVALID_FILE_TYPE", message: "サポートされていないファイル形式です" },
        { status: 400 }
      )
    }

    // 4. ファイルサイズ制限チェック
    const maxBytes = mediaType === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES
    if (fileSize > maxBytes) {
      const maxMB = Math.round(maxBytes / (1024 * 1024))
      return NextResponse.json(
        {
          code: "FILE_TOO_LARGE",
          message: `ファイルサイズが上限(${maxMB}MB)を超えています`,
        },
        { status: 400 }
      )
    }

    // 5. アルバムメンバーシップ確認
    const { data: membership } = await supabase
      .from("album_members")
      .select("role")
      .eq("album_id", albumId)
      .eq("user_id", user.id)
      .eq("membership_status", "active")
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { code: "NOT_MEMBER", message: "アルバムメンバーではありません" },
        { status: 403 }
      )
    }

    // 6. クォータチェック（FOR UPDATE ロック）
    const quota = await getQuotaForUpdate(user.id)
    const remaining = quota.quotaBytes - quota.usedBytes
    if (fileSize > remaining) {
      return NextResponse.json(
        {
          code: "QUOTA_EXCEEDED",
          message: "容量上限(256MB)を超えるためアップロードできません",
        },
        { status: 409 }
      )
    }

    // 7. オブジェクトパス生成
    const ext = fileName.split(".").pop()?.toLowerCase() || "bin"
    const uuid = crypto.randomUUID()
    const objectPath = `albums/${albumId}/events/${eventId}/${uuid}.${ext}`

    // 8. 署名URL発行
    const signedUrl = await generateSignedUploadUrl(objectPath, mimeType)

    return NextResponse.json({
      signedUrl,
      objectPath,
      mediaType,
    })
  } catch (err) {
    console.error("[uploads/reserve]", err)
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
