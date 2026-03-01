import Link from "next/link"
import { requestPasswordResetAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SearchParams = {
  error?: string
  message?: string
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm ios-card p-6 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-serif font-light">パスワード再設定</h1>
          <p className="text-xs text-foreground/60">登録済みメールに再設定リンクを送信します</p>
        </div>

        {params.message && (
          <div className="text-xs rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-700">
            {decodeURIComponent(params.message)}
          </div>
        )}

        {params.error && (
          <div className="text-xs rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
            {decodeURIComponent(params.error)}
          </div>
        )}

        <form action={requestPasswordResetAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full">
            再設定メールを送る
          </Button>
        </form>

        <p className="text-xs text-center text-foreground/60">
          <Link href="/auth/login" className="text-accent hover:underline">
            ログインへ戻る
          </Link>
        </p>
      </div>
    </main>
  )
}
