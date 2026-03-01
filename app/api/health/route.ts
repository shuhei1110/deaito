import { supabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {}

  // Supabase DB 接続確認
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1)
    checks.database = error ? "error" : "ok"
  } catch {
    checks.database = "error"
  }

  const allOk = Object.values(checks).every((v) => v === "ok")

  return Response.json(
    { status: allOk ? "healthy" : "degraded", checks },
    { status: allOk ? 200 : 503 }
  )
}
