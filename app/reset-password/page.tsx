import Link from "next/link"
import { updatePasswordAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type SearchParams = {
  error?: string
}

export default async function ResetPasswordPage({
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
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm ios-card p-6 space-y-4">
          <h1 className="text-lg font-medium text-center">再設定リンクが無効です</h1>
          <p className="text-xs text-foreground/60 text-center">
            もう一度再設定メールを送信してください。
          </p>
          <Link href="/forgot-password" className="text-xs text-accent hover:underline text-center block">
            パスワード再設定へ
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm ios-card p-6 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-serif font-light">新しいパスワード</h1>
          <p className="text-xs text-foreground/60">8文字以上で設定してください</p>
        </div>

        {params.error && (
          <div className="text-xs rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
            {decodeURIComponent(params.error)}
          </div>
        )}

        <form action={updatePasswordAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">新しいパスワード</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
          </div>
          <Button type="submit" className="w-full">
            パスワードを更新
          </Button>
        </form>
      </div>
    </main>
  )
}
