"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Bell, HelpCircle, LogOut, Pencil, Camera, Loader2, HardDrive } from "lucide-react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { updateProfileAction } from "./actions"

type Profile = {
  id: string
  username: string | null
  display_name: string
  avatar_url: string | null
  bio: string | null
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default function ProfileClient({
  profile,
  albumCount,
  email,
  quotaInfo,
  notificationCount,
}: {
  profile: Profile
  albumCount: number
  email: string
  quotaInfo: { quotaBytes: number; usedBytes: number; remainingBytes: number }
  notificationCount: number
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState(profile.username ?? "")
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (file: File) => {
    setAvatarError(null)
    setAvatarUploading(true)

    try {
      // 1. reserve
      const reserveRes = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reserve",
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      })
      const reserveData = await reserveRes.json()
      if (!reserveRes.ok) {
        throw new Error(reserveData.message ?? "アップロードの準備に失敗しました")
      }

      // 2. PUT to GCS
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", reserveData.signedUrl)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`アップロードに失敗しました (${xhr.status})`))
        }
        xhr.onerror = () => reject(new Error("ネットワークエラーが発生しました"))
        xhr.send(file)
      })

      // 3. complete
      const completeRes = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          objectPath: reserveData.objectPath,
        }),
      })
      const completeData = await completeRes.json()
      if (!completeRes.ok) {
        throw new Error(completeData.message ?? "アップロードの完了処理に失敗しました")
      }

      setAvatarUrl(completeData.avatarUrl)
      router.refresh()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "アップロードに失敗しました")
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
    e.target.value = ""
  }

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.replace("/auth/login")
    router.refresh()
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateProfileAction({
        username,
        display_name: displayName,
        bio,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setEditing(false)
        router.refresh()
      }
    })
  }

  const handleCancel = () => {
    setUsername(profile.username ?? "")
    setDisplayName(profile.display_name)
    setBio(profile.bio ?? "")
    setError(null)
    setEditing(false)
  }

  const initials = profile.display_name.slice(0, 2)

  return (
    <IOSLayout
      breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "プロフィール" }]}
      userProfile={{ display_name: profile.display_name, avatar_url: avatarUrl, email }}
      notificationCount={notificationCount}
    >
      <div className="py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-2 border-foreground/10">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={profile.display_name} />}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {avatarUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {avatarError && (
            <div className="text-xs rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive mb-2">
              {avatarError}
            </div>
          )}

          {editing ? (
            <div className="w-full max-w-sm space-y-4 mt-2">
              {error && (
                <div className="text-xs rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-username">ユーザー名</Label>
                <Input
                  id="edit-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="例: taro_yamada"
                />
                <p className="text-[10px] text-foreground/40">
                  英小文字・数字・アンダースコア（3〜20文字）
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-display-name">表示名</Label>
                <Input
                  id="edit-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="例: 山田 太郎"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bio">自己紹介</Label>
                <textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="自由に自己紹介を書いてみましょう"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isPending} className="flex-1">
                  {isPending ? "保存中..." : "保存"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isPending} className="flex-1">
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-medium mb-1">{profile.display_name}</h2>
              {profile.username && (
                <p className="text-foreground/50 text-sm mb-1">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-foreground/60 text-sm text-center max-w-xs">{profile.bio}</p>
              )}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-2 flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <Pencil className="w-3 h-3" />
                プロフィールを編集
              </button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="ios-card-solid p-4 text-center">
            <p className="text-2xl font-light mb-1">{albumCount}</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wide">アルバム</p>
          </div>
          <div className="ios-card-solid p-4 text-center">
            <p className="text-2xl font-light mb-1">-</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wide">つながり</p>
          </div>
          <div className="ios-card-solid p-4 text-center">
            <p className="text-2xl font-light mb-1">-</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wide">同窓会</p>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="ios-card-solid p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-foreground/50" />
              <span className="text-sm text-foreground/70">ストレージ</span>
            </div>
            <span className="text-xs text-foreground/50">
              {formatBytes(quotaInfo.usedBytes)} / {formatBytes(quotaInfo.quotaBytes)}
            </span>
          </div>
          <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaInfo.usedBytes / quotaInfo.quotaBytes >= 0.9
                  ? "bg-destructive"
                  : "bg-accent"
              }`}
              style={{ width: `${Math.min(100, (quotaInfo.usedBytes / quotaInfo.quotaBytes) * 100)}%` }}
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="ios-card-solid divide-y divide-foreground/5">
          <Link href="/settings" className="flex items-center gap-4 p-4 hover:bg-foreground/5 transition-colors">
            <Settings className="w-5 h-5 text-foreground/60" />
            <span className="text-sm">設定</span>
          </Link>
          <Link href="/notifications" className="flex items-center gap-4 p-4 hover:bg-foreground/5 transition-colors">
            <Bell className="w-5 h-5 text-foreground/60" />
            <span className="text-sm">通知設定</span>
          </Link>
          <Link href="/help" className="flex items-center gap-4 p-4 hover:bg-foreground/5 transition-colors">
            <HelpCircle className="w-5 h-5 text-foreground/60" />
            <span className="text-sm">ヘルプ</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-4 p-4 w-full hover:bg-foreground/5 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 text-destructive/60" />
            <span className="text-sm text-destructive">ログアウト</span>
          </button>
        </div>
      </div>
    </IOSLayout>
  )
}
