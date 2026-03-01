import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getQuotaInfo } from "@/lib/supabase/quotas"

export async function GET() {
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

    const quota = await getQuotaInfo(user.id)

    return NextResponse.json({
      quotaBytes: quota.quotaBytes,
      usedBytes: quota.usedBytes,
      remainingBytes: quota.remainingBytes,
    })
  } catch (err) {
    console.error("[uploads/quota]", err)
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
