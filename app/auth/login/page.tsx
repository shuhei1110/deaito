import Link from "next/link"
import { loginAction, signInWithGoogleAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SearchParams = {
  error?: string
  message?: string
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm ios-card p-6 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-serif font-light">deaito</h1>
          <p className="text-xs text-foreground/60">ログインして、つながりを続ける</p>
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

        <form action={signInWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full">
            Googleで続ける
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-foreground/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-background px-2 text-foreground/40">または</span>
          </div>
        </div>

        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-xs text-accent hover:underline">
              パスワードを忘れた場合
            </Link>
          </div>
          <Button type="submit" className="w-full">
            ログイン
          </Button>
        </form>

        <p className="text-xs text-center text-foreground/60">
          アカウントをお持ちでないですか？{" "}
          <Link href="/auth/sign-up" className="text-accent hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </main>
  )
}
