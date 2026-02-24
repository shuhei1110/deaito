import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config"

type CookieToSet = {
  name: string
  value: string
  options?: {
    domain?: string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    path?: string
    sameSite?: "lax" | "strict" | "none" | boolean
    secure?: boolean
    priority?: "low" | "medium" | "high"
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith("/auth")
  const allowWhenAuthenticated =
    pathname.startsWith("/auth/callback") || pathname.startsWith("/auth/reset-password")

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute && !allowWhenAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return response
}
