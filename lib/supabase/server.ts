import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
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

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components may not allow writing cookies.
        }
      },
    },
  })
}
