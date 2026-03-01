import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  generateSignedUploadUrl,
  generateSignedReadUrl,
  objectExists,
  deleteObject,
} from "@/lib/gcs"
import { getRawAvatarPath, updateAvatarUrl } from "@/lib/supabase/profiles"

const AVATAR_MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const action = body.action as string

    if (action === "reserve") {
      return handleReserve(user.id, body)
    } else if (action === "complete") {
      return handleComplete(user.id, body)
    }

    return NextResponse.json(
      { code: "BAD_REQUEST", message: "action は reserve または complete を指定してください" },
      { status: 400 }
    )
  } catch (err) {
    console.error("[profile/avatar]", err)
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

async function handleReserve(
  userId: string,
  body: { fileName?: string; fileSize?: number; mimeType?: string }
) {
  const { fileName, fileSize, mimeType } = body

  if (!fileName || !fileSize || !mimeType) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "fileName, fileSize, mimeType は必須です" },
      { status: 400 }
    )
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json(
      { code: "INVALID_FILE_TYPE", message: "JPEG, PNG, WebP のみアップロード可能です" },
      { status: 400 }
    )
  }

  if (fileSize > AVATAR_MAX_BYTES) {
    return NextResponse.json(
      { code: "FILE_TOO_LARGE", message: "ファイルサイズが上限(5MB)を超えています" },
      { status: 400 }
    )
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg"
  const uuid = crypto.randomUUID()
  const objectPath = `avatars/${userId}/${uuid}.${ext}`

  const signedUrl = await generateSignedUploadUrl(objectPath, mimeType)

  return NextResponse.json({ signedUrl, objectPath })
}

async function handleComplete(
  userId: string,
  body: { objectPath?: string }
) {
  const { objectPath } = body

  if (!objectPath) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "objectPath は必須です" },
      { status: 400 }
    )
  }

  // パスが正しいユーザーのものか検証
  if (!objectPath.startsWith(`avatars/${userId}/`)) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "不正なパスです" },
      { status: 403 }
    )
  }

  // GCSにオブジェクトが存在するか確認
  const exists = await objectExists(objectPath)
  if (!exists) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "アップロードされたファイルが見つかりません" },
      { status: 404 }
    )
  }

  // 古いアバターを削除
  const oldAvatarPath = await getRawAvatarPath(userId)
  if (oldAvatarPath && oldAvatarPath.startsWith("avatars/") && oldAvatarPath !== objectPath) {
    await deleteObject(oldAvatarPath).catch(() => {})
  }

  // プロフィール更新
  await updateAvatarUrl(userId, objectPath)

  // 新しい署名付きURLを返す
  const avatarUrl = await generateSignedReadUrl(objectPath)

  return NextResponse.json({ avatarUrl })
}
