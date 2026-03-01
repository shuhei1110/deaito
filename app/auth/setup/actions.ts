"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { updateProfile } from "@/lib/supabase/profiles"

export async function setupProfileAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase()
  const displayName = String(formData.get("display_name") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()

  if (!username) {
    redirect("/auth/setup?error=" + encodeURIComponent("ユーザー名を入力してください"))
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    redirect(
      "/auth/setup?error=" +
        encodeURIComponent("ユーザー名は3〜20文字の英小文字・数字・アンダースコアのみ使用できます")
    )
  }

  if (!displayName) {
    redirect("/auth/setup?error=" + encodeURIComponent("表示名を入力してください"))
  }

  const agreeTerms = formData.get("agreeTerms")
  if (!agreeTerms) {
    redirect("/auth/setup?error=" + encodeURIComponent("利用規約への同意が必要です"))
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  try {
    await updateProfile(user.id, {
      username,
      display_name: displayName,
      bio: bio || undefined,
    })
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("duplicate")
        ? "このユーザー名は既に使用されています"
        : "プロフィールの保存に失敗しました"
    redirect("/auth/setup?error=" + encodeURIComponent(message))
  }

  redirect("/")
}
