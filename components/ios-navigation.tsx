"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Images, User, Settings, Search, Bell, X, ChevronRight, Calendar, Loader2, HelpCircle } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { BottomBar } from "@/components/bottom-bar"
import { searchAction } from "@/app/actions/search"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

export type TopBarProfile = {
  display_name: string
  avatar_url: string | null
  email: string
}

interface TopBarProps {
  title?: string
  showSearch?: boolean
  notificationCount?: number
  userProfile?: TopBarProfile
}

type SearchResults = {
  albums: { id: string; name: string; year: number | null }[]
  people: { id: string; display_name: string; username: string | null; avatar_url: string | null }[]
  events: { id: string; album_id: string; name: string; starts_at: string | null }[]
}

const emptyResults: SearchResults = { albums: [], people: [], events: [] }

export function TopBar({ title, showSearch = true, notificationCount = 0, userProfile }: TopBarProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResults>(emptyResults)
  const [searchLoading, setSearchLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults(emptyResults)
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    try {
      const data = await searchAction(q)
      setSearchResults(data)
    } catch {
      // ignore
    } finally {
      setSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchQuery.length < 2) {
      setSearchResults(emptyResults)
      return
    }
    setSearchLoading(true)
    debounceRef.current = setTimeout(() => fetchSearch(searchQuery), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, fetchSearch])

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.replace("/auth/login")
    router.refresh()
  }

  const hasResults = searchResults.albums.length > 0 || searchResults.people.length > 0 || searchResults.events.length > 0

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
            <Link
              href="/notifications"
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-foreground/60" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="p-1"
              onClick={() => setProfileOpen(true)}
            >
              <Avatar className="w-8 h-8 border border-foreground/10">
                {userProfile?.avatar_url && (
                  <AvatarImage src={userProfile.avatar_url} alt={userProfile.display_name} />
                )}
                <AvatarFallback className="text-xs">
                  {userProfile?.display_name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <Dialog open={searchOpen} onOpenChange={(open) => {
        setSearchOpen(open)
        if (!open) {
          setSearchQuery("")
          setSearchResults(emptyResults)
        }
      }}>
        <DialogContent showCloseButton={false} className="sm:max-w-[500px] p-0 gap-0">
          <DialogTitle className="sr-only">検索</DialogTitle>
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
            {!searchQuery || searchQuery.length < 2 ? (
              <div className="p-6 text-center text-foreground/40 text-sm">
                2文字以上で検索できます
              </div>
            ) : searchLoading ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-foreground/30" />
              </div>
            ) : !hasResults ? (
              <div className="p-6 text-center text-foreground/40 text-sm">
                「{searchQuery}」の検索結果はありません
              </div>
            ) : (
              <>
                {/* People */}
                {searchResults.people.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider bg-secondary/30">
                      ユーザー
                    </div>
                    {searchResults.people.map((person) => (
                      <Link
                        key={person.id}
                        href={`/user/${person.id}`}
                        className="flex items-center gap-3 p-4 hover:bg-foreground/5 transition-colors"
                        onClick={() => setSearchOpen(false)}
                      >
                        <Avatar className="w-10 h-10">
                          {person.avatar_url && (
                            <AvatarImage src={person.avatar_url} alt={person.display_name} />
                          )}
                          <AvatarFallback>{person.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{person.display_name}</p>
                          {person.username && (
                            <p className="text-xs text-foreground/50">@{person.username}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/30" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Albums */}
                {searchResults.albums.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider bg-secondary/30">
                      アルバム
                    </div>
                    {searchResults.albums.map((album) => (
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
                          {album.year && (
                            <p className="text-xs text-foreground/50">{album.year}年卒業</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground/30" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Events */}
                {searchResults.events.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider bg-secondary/30">
                      イベント
                    </div>
                    {searchResults.events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/album/${event.album_id}`}
                        className="flex items-center gap-3 p-4 hover:bg-foreground/5 transition-colors"
                        onClick={() => setSearchOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.name}</p>
                          {event.starts_at && (
                            <p className="text-xs text-foreground/50">
                              {new Date(event.starts_at).toLocaleDateString("ja-JP")}
                            </p>
                          )}
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

      {/* Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[320px] p-0 gap-0">
          <DialogTitle className="sr-only">プロフィール</DialogTitle>
          <div className="p-6 text-center border-b border-foreground/5">
            <Avatar className="w-20 h-20 mx-auto border-2 border-foreground/10">
              {userProfile?.avatar_url && (
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.display_name} />
              )}
              <AvatarFallback className="text-2xl">
                {userProfile?.display_name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-medium mt-3">
              {userProfile?.display_name ?? "ユーザー"}
            </h3>
            <p className="text-sm text-foreground/50">
              {userProfile?.email ?? ""}
            </p>
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
            <Link
              href="/help"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-colors"
              onClick={() => setProfileOpen(false)}
            >
              <HelpCircle className="w-5 h-5 text-foreground/50" />
              <span className="text-sm">ヘルプ</span>
              <ChevronRight className="w-4 h-4 text-foreground/30 ml-auto" />
            </Link>
          </div>

          <div className="p-3 border-t border-foreground/5">
            <button
              type="button"
              className="w-full text-center text-sm text-destructive py-2 hover:bg-destructive/5 rounded-xl transition-colors"
              onClick={handleSignOut}
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
  userProfile?: TopBarProfile
}

export function IOSLayout({
  children,
  title,
  breadcrumbs = [{ label: "ホーム" }],
  showSearch = true,
  notificationCount = 0,
  userProfile,
}: IOSLayoutProps) {
  const hasBreadcrumbs = breadcrumbs.length > 1

  return (
    <div className="min-h-screen bg-background ios-bg-gradient">
      <TopBar
        title={title}
        showSearch={showSearch}
        notificationCount={notificationCount}
        userProfile={userProfile}
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
