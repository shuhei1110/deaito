import Link from "next/link"
import { SignUpForm } from "./sign-up-form"

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

        <SignUpForm />

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
