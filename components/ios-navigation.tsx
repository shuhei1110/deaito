"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Images, Mail, User, Settings, Search, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TopBarProps {
  title?: string
  showSearch?: boolean
  notificationCount?: number
}

export function TopBar({ title, showSearch = true, notificationCount = 0 }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 ios-glass">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-serif font-light tracking-wide italic">deaito</h1>
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
            >
              <Search className="w-5 h-5 text-foreground/60" />
            </button>
          )}
          <button 
            type="button"
            className="p-2 rounded-full hover:bg-foreground/5 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-foreground/60" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          <Link href="/settings" className="p-1">
            <Avatar className="w-8 h-8 border border-foreground/10">
              <AvatarImage src="/japanese-man-1.jpg" alt="Profile" />
              <AvatarFallback className="text-xs">田</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
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

const navItems = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/albums", icon: Images, label: "アルバム" },
  { href: "/invitations", icon: Mail, label: "招待状", badge: 2 },
  { href: "/profile", icon: User, label: "プロフィール" },
]

export function BottomBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 ios-glass">
      <div className="flex items-center justify-around h-20 max-w-2xl mx-auto pb-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-accent" 
                  : "text-foreground/40 hover:text-foreground/60"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px]",
                isActive ? "font-medium" : "font-normal"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
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
        hasBreadcrumbs ? "pt-28" : "pt-18"
      )}>
        {children}
      </main>

      <BottomBar />
    </div>
  )
}
