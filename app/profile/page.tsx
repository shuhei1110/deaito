"use client"

import { IOSLayout } from "@/components/ios-navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Settings, Bell, HelpCircle, LogOut } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <IOSLayout breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "プロフィール" }]}>
      <div className="py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-24 h-24 border-2 border-foreground/10 mb-4">
            <AvatarImage src="/profile-image-001.png" alt="田中太郎" />
            <AvatarFallback>田中</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-medium mb-1">田中 太郎</h2>
          <p className="text-foreground/50 text-sm">東京都立西高等学校 2010年卒</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="ios-card-solid p-4 text-center">
            <p className="text-2xl font-light mb-1">3</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wide">アルバム</p>
          </div>
          <div className="ios-card-solid p-4 text-center">
            <p className="text-2xl font-light mb-1">24</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wide">つながり</p>
          </div>
          <div className="ios-card-solid p-4 text-center">
            <p className="text-2xl font-light mb-1">5</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wide">同窓会</p>
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
          <button type="button" className="flex items-center gap-4 p-4 w-full hover:bg-foreground/5 transition-colors text-left">
            <LogOut className="w-5 h-5 text-destructive/60" />
            <span className="text-sm text-destructive">ログアウト</span>
          </button>
        </div>
      </div>
    </IOSLayout>
  )
}
