"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { updateProfile } from "@/lib/supabase/profiles"

export async function updateProfileAction(input: {
  username: string
  display_name: string
  bio?: string
}): Promise<{ error?: string }> {
  const username = input.username.trim().toLowerCase()
  const displayName = input.display_name.trim()
  const bio = input.bio?.trim()

  if (!username) {
    return { error: "ユーザー名を入力してください" }
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "ユーザー名は3〜20文字の英小文字・数字・アンダースコアのみ使用できます" }
  }

  if (!displayName) {
    return { error: "表示名を入力してください" }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "認証が必要です" }
  }

  try {
    await updateProfile(user.id, {
      username,
      display_name: displayName,
      bio: bio || undefined,
    })
  } catch (e) {
    if (e instanceof Error && e.message.includes("duplicate")) {
      return { error: "このユーザー名は既に使用されています" }
    }
    return { error: "プロフィールの保存に失敗しました" }
  }

  revalidatePath("/profile")
  return {}
}
