import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ensureProfileByUserWithStatus } from "@/lib/supabase/profiles"

function sanitizeNextPath(nextPath: string | null) {
  if (!nextPath) return "/"
  if (!nextPath.startsWith("/")) return "/"
  if (nextPath.startsWith("//")) return "/"
  return nextPath
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"))

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { created } = await ensureProfileByUserWithStatus({
          userId: user.id,
          email: user.email,
        })

        if (created) {
          return NextResponse.redirect(new URL("/profile", request.url))
        }
      }

      return NextResponse.redirect(new URL(nextPath, request.url))
    }
  }

  return NextResponse.redirect(
    new URL("/auth/login?error=Googleログインに失敗しました", request.url)
  )
}
