"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ensureProfileByUser } from "@/lib/supabase/profiles"

function encodeMessage(text: string) {
  return encodeURIComponent(text)
}

async function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) return envUrl

  const headerList = await headers()

  const origin = headerList.get("origin")
  if (origin) return origin

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host")
  const protocol = headerList.get("x-forwarded-proto") ?? "http"

  if (host) {
    return `${protocol}://${host}`
  }

  return "http://localhost:3000"
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    redirect(`/auth/login?error=${encodeMessage("メールアドレスとパスワードを入力してください")}`)
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/auth/login?error=${encodeMessage(error.message)}`)
  }

  if (data.user) {
    await ensureProfileByUser({
      userId: data.user.id,
      email: data.user.email,
    })
  }

  redirect("/")
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (!email || !password) {
    redirect(`/auth/sign-up?error=${encodeMessage("メールアドレスとパスワードを入力してください")}`)
  }

  if (password !== confirmPassword) {
    redirect(`/auth/sign-up?error=${encodeMessage("パスワードが一致しません")}`)
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect(`/auth/sign-up?error=${encodeMessage(error.message)}`)
  }

  if (data.user) {
    await ensureProfileByUser({
      userId: data.user.id,
      email: data.user.email,
    })
  }

  redirect(`/auth/login?message=${encodeMessage("アカウントを作成しました。ログインしてください")}`)
}

export async function signInWithGoogleAction() {
  const supabase = await createSupabaseServerClient()
  const baseUrl = await getBaseUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/auth/login?error=${encodeMessage(error.message)}`)
  }

  if (!data.url) {
    redirect(`/auth/login?error=${encodeMessage("GoogleログインURLの生成に失敗しました")}`)
  }

  redirect(data.url)
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")

  if (!email) {
    redirect(`/auth/forgot-password?error=${encodeMessage("メールアドレスを入力してください")}`)
  }

  const supabase = await createSupabaseServerClient()
  const baseUrl = await getBaseUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    redirect(`/auth/forgot-password?error=${encodeMessage(error.message)}`)
  }

  redirect(
    `/auth/forgot-password?message=${encodeMessage(
      "パスワード再設定メールを送信しました。受信メールを確認してください"
    )}`
  )
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (!password) {
    redirect(`/auth/reset-password?error=${encodeMessage("新しいパスワードを入力してください")}`)
  }

  if (password.length < 8) {
    redirect(`/auth/reset-password?error=${encodeMessage("パスワードは8文字以上で入力してください")}`)
  }

  if (password !== confirmPassword) {
    redirect(`/auth/reset-password?error=${encodeMessage("パスワードが一致しません")}`)
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    redirect(`/auth/reset-password?error=${encodeMessage(error.message)}`)
  }

  redirect(`/auth/login?message=${encodeMessage("パスワードを更新しました。ログインしてください")}`)
}
