import Link from "next/link"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/profiles"
import { setupProfileAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SearchParams = {
  error?: string
}

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfile(user.id)

  // 既にセットアップ済みならホームへ
  if (profile?.username) {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm ios-card p-6 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-serif font-light">deaito</h1>
          <p className="text-xs text-foreground/60">プロフィールを設定して始めましょう</p>
        </div>

        {params.error && (
          <div className="text-xs rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
            {decodeURIComponent(params.error)}
          </div>
        )}

        <form action={setupProfileAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名 *</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="例: taro_yamada"
              required
              pattern="[a-z0-9_]{3,20}"
              title="3〜20文字の英小文字・数字・アンダースコア"
            />
            <p className="text-[10px] text-foreground/40">
              英小文字・数字・アンダースコア（3〜20文字）
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">表示名 *</Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={profile?.display_name ?? ""}
              placeholder="例: 山田 太郎"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="自由に自己紹介を書いてみましょう"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              required
              className="mt-0.5 h-4 w-4 rounded border-foreground/30 accent-accent"
            />
            <label htmlFor="agreeTerms" className="text-xs text-foreground/60 leading-relaxed">
              <Link href="/terms" target="_blank" className="text-accent hover:underline">
                利用規約
              </Link>
              に同意します
            </label>
          </div>

          <Button type="submit" className="w-full">
            はじめる
          </Button>
        </form>
      </div>
    </main>
  )
}
