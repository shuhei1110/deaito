"use client"

import { useState, useEffect } from "react"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { AlbumBookshelf } from "@/components/album-bookshelf"
import { TsunaguPointsCarousel } from "@/components/tsunagu-points-carousel"
import { SplashAnimation } from "@/components/splash-animation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Mail, MessageCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { AlbumWithMemberCount, HomeActivity, CarouselAlbumPoint } from "@/lib/album-types"

export interface HomeStats {
  connections: number
  proposals: number
  notifications: number
}

export function HomeClient({ albums, invitationCount, userProfile, activities, notificationCount, carouselPoints, homeStats }: { albums: AlbumWithMemberCount[]; invitationCount: number; userProfile: TopBarProfile; activities: HomeActivity[]; notificationCount: number; carouselPoints: CarouselAlbumPoint[]; homeStats: HomeStats }) {
  const [showSplash, setShowSplash] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("deaito-splash-shown")
    if (hasSeenSplash) {
      setShowSplash(false)
      setContentVisible(true)
    }
  }, [])

  const handleSplashComplete = () => {
    sessionStorage.setItem("deaito-splash-shown", "true")
    setShowSplash(false)
    setTimeout(() => setContentVisible(true), 100)
  }

  return (
    <>
      {showSplash && <SplashAnimation onComplete={handleSplashComplete} />}

      <div className={`transition-opacity duration-700 ${contentVisible ? "opacity-100" : "opacity-0"}`}>
        <IOSLayout breadcrumbs={[{ label: "ホーム" }]} userProfile={userProfile} notificationCount={notificationCount}>
          {/* Hero Section */}
          <div className="py-6 text-center">
            <h2 className="text-2xl font-serif font-light leading-tight mb-2 text-balance">
              終わりのない「つながり」を
            </h2>
            <p className="text-foreground/50 leading-relaxed text-xs max-w-xs mx-auto">
              &quot;deaito&quot;は自然な交流を保ち続けられる卒業アルバム。
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="ios-card p-3 text-center">
              <Users className="h-4 w-4 mx-auto mb-1 text-accent" />
              <div className="text-lg font-medium">{homeStats.connections}</div>
              <div className="text-[10px] text-foreground/40">つながり</div>
            </div>
            <div className="ios-card p-3 text-center">
              <Mail className="h-4 w-4 mx-auto mb-1 text-accent" />
              <div className="text-lg font-medium">{homeStats.proposals}</div>
              <div className="text-[10px] text-foreground/40">招待状</div>
            </div>
            <div className="ios-card p-3 text-center">
              <MessageCircle className="h-4 w-4 mx-auto mb-1 text-accent" />
              <div className="text-lg font-medium">{homeStats.notifications}</div>
              <div className="text-[10px] text-foreground/40">通知</div>
            </div>
          </div>

          {/* Album Bookshelf */}
          <div className="mb-8">
            <AlbumBookshelf albums={albums} />
          </div>

          {/* Tsunagu Points Carousel */}
          <div className="mb-8 -mx-4">
            <TsunaguPointsCarousel albums={carouselPoints} />
          </div>

          {/* アルバム招待バナー */}
          {invitationCount > 0 && (
            <Link
              href="/albums"
              className="block ios-card p-4 mb-8 bg-accent/5 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {invitationCount}件のアルバム招待が届いています
                  </p>
                  <p className="text-[11px] text-foreground/40 mt-0.5">
                    アルバム一覧で確認する
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground/20 flex-shrink-0" />
              </div>
            </Link>
          )}

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-foreground/70">最近のアクティビティ</h3>
              <Link href="/activity" className="text-xs text-accent">すべて見る</Link>
            </div>

            {activities.length === 0 ? (
              <div className="ios-card p-8 text-center text-foreground/40 text-sm">
                アクティビティはまだありません
              </div>
            ) : (
              <div className="ios-card overflow-hidden">
                {activities.slice(0, 3).map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 p-4 ${
                      index !== Math.min(activities.length, 3) - 1 ? "border-b border-foreground/5" : ""
                    }`}
                  >
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      {activity.user.avatar_url && <AvatarImage src={activity.user.avatar_url} />}
                      <AvatarFallback className="bg-gradient-to-br from-[#e8a87c]/20 to-[#c9a87c]/20 text-[#c9a87c] text-xs">
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>
                        <span className="text-foreground/60">が{activity.action}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-foreground/40">{activity.content.albumName}</span>
                        <span className="text-[11px] text-foreground/30">{activity.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </IOSLayout>
      </div>
    </>
  )
}
