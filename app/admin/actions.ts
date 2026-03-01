"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { reconcileStorageQuotas } from "@/lib/supabase/quotas"

/** ストレージクォータを再集計（media_assets の実合計で used_bytes を補正） */
export async function reconcileQuotasAction(): Promise<{
  correctedCount: number
  error?: string
}> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { correctedCount: 0, error: "認証が必要です" }
  }

  try {
    const count = await reconcileStorageQuotas()
    return { correctedCount: count }
  } catch (e) {
    return {
      correctedCount: 0,
      error: e instanceof Error ? e.message : "再集計に失敗しました",
    }
  }
}
