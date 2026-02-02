"use client"

import React, { useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Images, Mail, User, Settings, Search, Bell, X, ChevronRight, MessageSquare, Calendar, Heart, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BottomBar } from "@/components/bottom-bar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TopBarProps {
  title?: string
  showSearch?: boolean
  notificationCount?: number
}

// Notifications data
const notifications = [
  {
    id: "1",
    type: "invitation",
    title: "新しい招待状",
    description: "田中美咲さんから同窓会の招待が届きました",
    time: "2時間前",
    unread: true,
    icon: Mail,
  },
  {
    id: "2",
    type: "connection",
    title: "友達リクエスト",
    description: "鈴木一郎さんがつながりをリクエストしています",
    time: "5時間前",
    unread: true,
    icon: UserPlus,
  },
  {
    id: "3",
    type: "event",
    title: "イベントリマインダー",
    description: "「2024年桜ヶ丘高校同窓会」まであと3日",
    time: "1日前",
    unread: false,
    icon: Calendar,
  },
  {
    id: "4",
    type: "like",
    title: "いいね",
    description: "佐藤花子さんがあなたの写真にいいねしました",
    time: "2日前",
    unread: false,
    icon: Heart,
  },
  {
    id: "5",
    type: "message",
    title: "新しいメッセージ",
    description: "高橋健太さんからメッセージが届きました",
    time: "3日前",
    unread: false,
    icon: MessageSquare,
  },
]

// Search results
const searchResults = {
  albums: [
    { id: "1", name: "桜ヶ丘高校 3年A組", year: "2017", type: "album" },
    { id: "2", name: "東京大学工学部", year: "2021", type: "album" },
  ],
  people: [
    { id: "1", name: "田中美咲", school: "桜ヶ丘高校", avatar: "/japanese-woman-2.jpg" },
    { id: "2", name: "鈴木一郎", school: "東京大学", avatar: "/japanese-man-2.jpg" },
    { id: "3", name: "佐藤花子", school: "桜ヶ丘高校", avatar: "/japanese-woman-3.jpg" },
  ],
  events: [
    { id: "1", name: "2024年桜ヶ丘高校同窓会", date: "2024/12/15", type: "event" },
  ],
}

export function TopBar({ title, showSearch = true, notificationCount = 0 }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredResults = searchQuery.length > 0 ? {
    albums: searchResults.albums.filter(a => a.name.includes(searchQuery)),
    people: searchResults.people.filter(p => p.name.includes(searchQuery) || p.school.includes(searchQuery)),
    events: searchResults.events.filter(e => e.name.includes(searchQuery)),
  } : { albums: [], people: [], events: [] }

  const hasResults = filteredResults.albums.length > 0 || filteredResults.people.length > 0 || filteredResults.events.length > 0

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 ios-glass">
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-serif font-light tracking-wide">deaito</h1>
          </Link>

          {/* Center: Title (optional) */}
          {title && (
            <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium">
              {title}
            </span>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {showSearch && (
              <button 
                type="button"
                className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5 text-foreground/60" />
              </button>
            )}
            <button 
              type="button"
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors relative"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="w-5 h-5 text-foreground/60" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            <button 
              type="button"
              className="p-1"
              onClick={() => setProfileOpen(true)}
            >
              <Avatar className="w-8 h-8 border border-foreground/10">
                <AvatarImage src="/japanese-man-1.jpg" alt="Profile" />
                <AvatarFallback className="text-xs">田</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[500px] rounded-2xl border-0 ios-card p-0 gap-0">
          <div className="p-4 border-b border-foreground/5">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-foreground/30 flex-shrink-0" />
              <Input
                placeholder="アルバム、人、イベントを検索..."
                className="border-0 bg-transparent p-0 h-auto text-base focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-foreground/5"
                >
                  <X className="w-4 h-4 text-foreground/40" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {!searchQuery ? (
              <div className="p-6 text-center text-foreground/40 text-sm">
                検索キーワードを入力してください
              </div>
            ) : !hasResults ? (
              <div className="p-6 text-center text-foreground/40 text-sm">
                「{searchQuery}」の検索結果はありません
              </div>
            ) : (
              <>
                {/* People */}
                {filteredResults.people.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider bg-secondary/30">
                      ユーザー
                    </div>
                    {filteredResults.people.map((person) => (
                      <Link
                        key={person.id}
                        href={`/user/${person.id}`}
                        className="flex items-center gap-3 p-4 hover:bg-foreground/5 transition-colors"
                        onClick={() => setSearchOpen(false)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                          <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{person.name}</p>
                          <p className="text-xs text-foreground/50">{person.school}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/30" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Albums */}
                {filteredResults.albums.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider bg-secondary/30">
                      アルバム
                    </div>
                    {filteredResults.albums.map((album) => (
                      <Link
                        key={album.id}
                        href={`/album/${album.id}`}
                        className="flex items-center gap-3 p-4 hover:bg-foreground/5 transition-colors"
                        onClick={() => setSearchOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                          <Images className="w-5 h-5 text-foreground/40" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{album.name}</p>
                          <p className="text-xs text-foreground/50">{album.year}年卒業</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/30" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Events */}
                {filteredResults.events.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider bg-secondary/30">
                      イベント
                    </div>
                    {filteredResults.events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/event/${event.id}`}
                        className="flex items-center gap-3 p-4 hover:bg-foreground/5 transition-colors"
                        onClick={() => setSearchOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.name}</p>
                          <p className="text-xs text-foreground/50">{event.date}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/30" />
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[400px] rounded-2xl border-0 ios-card p-0 gap-0">
          <DialogHeader className="p-4 border-b border-foreground/5">
            <DialogTitle className="text-lg font-medium">通知</DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.map((notification, index) => {
              const Icon = notification.icon
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-foreground/5 transition-colors cursor-pointer",
                    index !== notifications.length - 1 && "border-b border-foreground/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    notification.unread ? "bg-accent/10" : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      notification.unread ? "text-accent" : "text-foreground/40"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm",
                        notification.unread ? "font-medium" : "font-normal"
                      )}>{notification.title}</p>
                      {notification.unread && (
                        <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">{notification.description}</p>
                    <p className="text-[10px] text-foreground/30 mt-1">{notification.time}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3 border-t border-foreground/5">
            <button
              type="button"
              className="w-full text-center text-sm text-accent py-2 hover:bg-accent/5 rounded-xl transition-colors"
              onClick={() => setNotificationsOpen(false)}
            >
              すべての通知を見る
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[320px] rounded-2xl border-0 ios-card p-0 gap-0">
          <div className="p-6 text-center border-b border-foreground/5">
            <Avatar className="w-20 h-20 mx-auto border-2 border-foreground/10">
              <AvatarImage src="/japanese-man-1.jpg" alt="田中太郎" />
              <AvatarFallback className="text-2xl">田</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-medium mt-3">田中太郎</h3>
            <p className="text-sm text-foreground/50">tanaka.taro@example.com</p>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-colors"
              onClick={() => setProfileOpen(false)}
            >
              <User className="w-5 h-5 text-foreground/50" />
              <span className="text-sm">プロフィール</span>
              <ChevronRight className="w-4 h-4 text-foreground/30 ml-auto" />
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-colors"
              onClick={() => setProfileOpen(false)}
            >
              <Settings className="w-5 h-5 text-foreground/50" />
              <span className="text-sm">設定</span>
              <ChevronRight className="w-4 h-4 text-foreground/30 ml-auto" />
            </Link>
          </div>

          <div className="p-3 border-t border-foreground/5">
            <button
              type="button"
              className="w-full text-center text-sm text-destructive py-2 hover:bg-destructive/5 rounded-xl transition-colors"
            >
              ログアウト
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbBarProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbBar({ items }: BreadcrumbBarProps) {
  if (items.length <= 1) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-40 ios-glass-subtle">
      <div className="flex items-center gap-2 px-4 h-10 max-w-2xl mx-auto overflow-x-auto">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2 shrink-0">
            {index > 0 && (
              <span className="text-foreground/30 text-xs">/</span>
            )}
            {item.href && index < items.length - 1 ? (
              <Link 
                href={item.href} 
                className="text-xs text-foreground/50 hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-xs text-foreground font-medium">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}



interface IOSLayoutProps {
  children: React.ReactNode
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  showSearch?: boolean
  notificationCount?: number
}

export function IOSLayout({ 
  children, 
  title, 
  breadcrumbs = [{ label: "ホーム" }],
  showSearch = true,
  notificationCount = 2
}: IOSLayoutProps) {
  const hasBreadcrumbs = breadcrumbs.length > 1

  return (
    <div className="min-h-screen bg-background ios-bg-gradient">
      <TopBar 
        title={title} 
        showSearch={showSearch} 
        notificationCount={notificationCount} 
      />
      <BreadcrumbBar items={breadcrumbs} />
      
      <main className={cn(
        "max-w-2xl mx-auto px-4 pb-24",
        hasBreadcrumbs ? "pt-28" : "pt-20"
      )}>
        {children}
      </main>

      <BottomBar />
    </div>
  )
}
