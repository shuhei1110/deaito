"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Images, Mail, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/albums", icon: Images, label: "アルバム" },
  { href: "/invitations", icon: Mail, label: "招待状", badge: 2 },
  { href: "/profile", icon: User, label: "プロフィール" },
]

export function BottomBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background">
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
