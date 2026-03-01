"use client"

import { useState } from "react"
import Link from "next/link"
import { signUpAction, signInWithGoogleAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUpForm() {
  const [agreed, setAgreed] = useState(false)

  return (
    <>
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="agreeTerms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-foreground/30 accent-accent"
        />
        <label htmlFor="agreeTerms" className="text-xs text-foreground/60 leading-relaxed">
          <Link href="/terms" target="_blank" className="text-accent hover:underline">
            利用規約
          </Link>
          に同意します
        </label>
      </div>

      <form action={signInWithGoogleAction}>
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={!agreed}
        >
          Googleで登録する
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
        <input type="hidden" name="agreeTerms" value={agreed ? "on" : ""} />
        <Button type="submit" className="w-full" disabled={!agreed}>
          登録する
        </Button>
      </form>
    </>
  )
}
