"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User, Lock, Palette, Trash2, Check, Sun, Moon, Monitor } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  updateSettingsProfileAction,
  changePasswordAction,
  deleteAccountAction,
} from "./actions"

type Profile = {
  id: string
  username: string | null
  display_name: string
  bio: string | null
  avatar_url: string | null
}

interface SettingsClientProps {
  userProfile: TopBarProfile
  notificationCount: number
}

export default function SettingsClient({ userProfile, notificationCount }: SettingsClientProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // profile
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPendingProfile, startProfileTransition] = useTransition()

  // password
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPendingPassword, startPasswordTransition] = useTransition()

  // delete
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [isPendingDelete, startDeleteTransition] = useTransition()

  // auth provider
  const [isOAuthUser, setIsOAuthUser] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createSupabaseBrowserClient()

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email ?? "")

      // OAuth ユーザーかチェック
      const identities = user.identities ?? []
      const hasOAuth = identities.some(
        (i: { provider: string }) => i.provider !== "email"
      )
      setIsOAuthUser(hasOAuth && identities.length === 1)

      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        setUsername(data.username ?? "")
        setDisplayName(data.display_name ?? "")
        setBio(data.bio ?? "")
      }
    }
    load()
  }, [])

  function handleSaveProfile() {
    setProfileMsg(null)
    startProfileTransition(async () => {
      const result = await updateSettingsProfileAction({
        username,
        display_name: displayName,
        bio: bio || undefined,
      })
      if (result.error) {
        setProfileMsg({ type: "error", text: result.error })
      } else {
        setProfileMsg({ type: "success", text: "プロフィールを更新しました" })
      }
    })
  }

  function handleChangePassword() {
    setPasswordMsg(null)
    startPasswordTransition(async () => {
      const result = await changePasswordAction({
        newPassword,
        confirmPassword,
      })
      if (result.error) {
        setPasswordMsg({ type: "error", text: result.error })
      } else {
        setPasswordMsg({ type: "success", text: "パスワードを変更しました" })
        setNewPassword("")
        setConfirmPassword("")
      }
    })
  }

  function handleDeleteAccount() {
    startDeleteTransition(async () => {
      const result = await deleteAccountAction()
      if (result.error) {
        setProfileMsg({ type: "error", text: result.error })
        setDeleteOpen(false)
      } else {
        router.replace("/auth/login")
      }
    })
  }

  const themeOptions = [
    { value: "light", label: "ライト", icon: Sun },
    { value: "dark", label: "ダーク", icon: Moon },
    { value: "system", label: "システム", icon: Monitor },
  ] as const

  return (
    <IOSLayout
      breadcrumbs={[
        { label: "ホーム", href: "/" },
        { label: "プロフィール", href: "/profile" },
        { label: "設定" },
      ]}
      userProfile={userProfile}
      notificationCount={notificationCount}
    >
      <div className="py-6 space-y-6 max-w-lg mx-auto">
        <h1 className="text-xl font-serif font-light">設定</h1>

        {/* ── アカウント情報 ── */}
        <section className="ios-card-solid p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground/70 mb-1">
            <User className="w-4 h-4" />
            <h2 className="text-sm font-medium">アカウント情報</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" value={email} disabled className="bg-foreground/5 text-foreground/60" />
            <p className="text-[10px] text-foreground/40">メールアドレスは変更できません</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例: taro_yamada"
              pattern="[a-z0-9_]{3,20}"
            />
            <p className="text-[10px] text-foreground/40">
              英小文字・数字・アンダースコア（3〜20文字）
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">表示名</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: 山田 太郎"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="自由に自己紹介を書いてみましょう"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {profileMsg && (
            <div
              className={`text-xs rounded-md border px-3 py-2 ${
                profileMsg.type === "error"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <Button onClick={handleSaveProfile} disabled={isPendingProfile} className="w-full">
            {isPendingProfile ? "保存中..." : "プロフィールを保存"}
          </Button>
        </section>

        {/* ── パスワード変更 ── */}
        <section className="ios-card-solid p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground/70 mb-1">
            <Lock className="w-4 h-4" />
            <h2 className="text-sm font-medium">
              {isOAuthUser ? "パスワード設定" : "パスワード変更"}
            </h2>
          </div>

          {isOAuthUser && (
            <p className="text-xs text-foreground/50">
              パスワードを設定すると、メールアドレスでもログインできるようになります。
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">新しいパスワード</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              placeholder="8文字以上"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
            />
          </div>

          {passwordMsg && (
            <div
              className={`text-xs rounded-md border px-3 py-2 ${
                passwordMsg.type === "error"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <Button onClick={handleChangePassword} disabled={isPendingPassword} className="w-full">
            {isPendingPassword ? "変更中..." : isOAuthUser ? "パスワードを設定" : "パスワードを変更"}
          </Button>
        </section>

        {/* ── テーマ設定 ── */}
        <section className="ios-card-solid p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground/70 mb-1">
            <Palette className="w-4 h-4" />
            <h2 className="text-sm font-medium">テーマ</h2>
          </div>

          {mounted && (
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon
                const isActive = theme === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors ${
                      isActive
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-foreground/10 hover:border-foreground/20 text-foreground/60"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{opt.label}</span>
                    {isActive && <Check className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* ── アカウント削除 ── */}
        <section className="ios-card-solid p-5 space-y-4">
          <div className="flex items-center gap-2 text-destructive/70 mb-1">
            <Trash2 className="w-4 h-4" />
            <h2 className="text-sm font-medium text-destructive">アカウント削除</h2>
          </div>
          <p className="text-xs text-foreground/50">
            アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
          </p>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                アカウントを削除する
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>本当に削除しますか？</DialogTitle>
                <DialogDescription>
                  この操作は取り消せません。確認のため「削除」と入力してください。
                </DialogDescription>
              </DialogHeader>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="削除"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirm !== "削除" || isPendingDelete}
                  onClick={handleDeleteAccount}
                >
                  {isPendingDelete ? "削除中..." : "完全に削除する"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </IOSLayout>
  )
}
