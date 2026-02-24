import Link from "next/link"
import { signUpAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SearchParams = {
  error?: string
}

export default async function SignUpPage({
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
          <p className="text-xs text-foreground/60">新しいアカウントを作成</p>
        </div>

        {params.error && (
          <div className="text-xs rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
            {decodeURIComponent(params.error)}
          </div>
        )}

        <form action={signUpAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full">
            登録する
          </Button>
        </form>

        <p className="text-xs text-center text-foreground/60">
          すでにアカウントがありますか？{" "}
          <Link href="/auth/login" className="text-accent hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </main>
  )
}
