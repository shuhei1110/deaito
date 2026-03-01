import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { objectExists, getObjectSize } from "@/lib/gcs"
import { incrementUsedBytes } from "@/lib/supabase/quotas"

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
    const { albumId, eventId, objectPath, mediaType, mimeType } = body as {
      albumId?: string
      eventId?: string
      objectPath?: string
      mediaType?: "image" | "video"
      mimeType?: string
    }

    if (!albumId || !eventId || !objectPath || !mediaType) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "必須パラメータが不足しています" },
        { status: 400 }
      )
    }

    // 3. GCSにオブジェクトが存在するか確認
    const exists = await objectExists(objectPath)
    if (!exists) {
      return NextResponse.json(
        {
          code: "OBJECT_NOT_FOUND",
          message: "ファイルのアップロードが確認できませんでした",
        },
        { status: 400 }
      )
    }

    // 4. 実ファイルサイズ取得
    const sizeBytes = await getObjectSize(objectPath)

    // 5. media_assets INSERT（service role で RLS バイパス）
    const { data: media, error: insertError } = await supabaseAdmin
      .from("media_assets")
      .insert({
        album_id: albumId,
        event_id: eventId,
        uploader_id: user.id,
        media_type: mediaType,
        mime_type: mimeType ?? null,
        object_path: objectPath,
        size_bytes: sizeBytes,
        thumbnail_path: null,
        captured_at: null,
      })
      .select("id, object_path, media_type, created_at")
      .single()

    if (insertError) throw insertError

    // 6. used_bytes 加算
    await incrementUsedBytes(user.id, sizeBytes)

    return NextResponse.json({ media })
  } catch (err) {
    console.error("[uploads/complete]", err)
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
