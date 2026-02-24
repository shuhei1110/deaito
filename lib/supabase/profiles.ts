import "server-only"

import { supabaseAdmin } from "@/lib/supabase/admin"

function deriveDisplayName(email?: string) {
  if (!email) return "ユーザー"
  return email.split("@")[0] || "ユーザー"
}

export async function ensureProfileByUserWithStatus(input: { userId: string; email?: string }) {
  const { userId, email } = input

  const { data: existingProfile, error: selectError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (existingProfile) {
    return { created: false }
  }

  const { error } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    display_name: deriveDisplayName(email),
  })

  if (error) {
    throw error
  }

  return { created: true }
}

export async function ensureProfileByUser(input: { userId: string; email?: string }) {
  await ensureProfileByUserWithStatus(input)
}
