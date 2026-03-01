"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

const CATEGORY_VALUES = ["account", "album", "media", "other"] as const

export async function submitInquiryAction(input: {
  category: string
  subject: string
  body: string
}): Promise<{ success?: boolean; error?: string }> {
  const { category, subject, body } = input

  // バリデーション
  if (!CATEGORY_VALUES.includes(category as (typeof CATEGORY_VALUES)[number])) {
    return { error: "カテゴリを選択してください" }
  }
  if (!subject.trim()) {
    return { error: "件名を入力してください" }
  }
  if (!body.trim()) {
    return { error: "本文を入力してください" }
  }
  if (body.length > 2000) {
    return { error: "本文は2000文字以内で入力してください" }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "認証が必要です" }
  }

  const { error } = await supabase.from("support_inquiries").insert({
    user_id: user.id,
    category,
    subject: subject.trim(),
    body: body.trim(),
  })

  if (error) {
    return { error: "送信に失敗しました。しばらくしてからお試しください。" }
  }

  return { success: true }
}
