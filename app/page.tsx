"use client"

import { useState, useEffect } from "react"
import { IOSLayout } from "@/components/ios-navigation"
import { AlbumBookshelf } from "@/components/album-bookshelf"
import { TsunaguPointsCarousel } from "@/components/tsunagu-points-carousel"
import { SplashAnimation } from "@/components/splash-animation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, MessageCircle } from "lucide-react"
import Link from "next/link"

// Recent activity data
const recentActivities = [
  {
    id: 1,
    type: "photo",
    user: { name: "友達", avatar: null },
    action: "が新しい写真を追加しました",
    album: "桜ヶ丘高校",
    time: "2時間前",
  },
  {
    id: 2,
    type: "reunion",
    user: { name: "つなぐ", avatar: null },
    action: "が同窓会を提案しました",
    album: "東京大学工学部",
    time: "5時間前",
  },
  {
    id: 3,
    type: "comment",
    user: { name: "メンバー", avatar: null },
    action: "がコメントしました",
    album: "桜ヶ丘高校",
    time: "1日前",
  },
]

// Stats data
const stats = [
  { icon: Users, label: "つながり", value: "156" },
  { icon: Calendar, label: "同窓会", value: "3" },
  { icon: MessageCircle, label: "メッセージ", value: "12" },
]

export default function Home() {
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
        <IOSLayout breadcrumbs={[{ label: "ホーム" }]}>
          {/* Hero Section */}
          <div className="py-6 text-center">
            <h2 className="text-2xl font-serif font-light leading-tight mb-2 text-balance">
              終わりのない「つながり」を
            </h2>
            <p className="text-foreground/50 leading-relaxed text-xs max-w-xs mx-auto">
              ”deaito”は自然な交流を保ち続けられる卒業アルバム。
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="ios-card p-3 text-center">
                <stat.icon className="h-4 w-4 mx-auto mb-1 text-accent" />
                <div className="text-lg font-medium">{stat.value}</div>
                <div className="text-[10px] text-foreground/40">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Album Bookshelf */}
          <div className="mb-8">
            <AlbumBookshelf />
          </div>

          {/* Tsunagu Points Carousel */}
          <div className="mb-8 -mx-4">
            <TsunaguPointsCarousel />
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-foreground/70">最近のアクティビティ</h3>
              <Link href="/activity" className="text-xs text-accent">すべて見る</Link>
            </div>

            <div className="ios-card overflow-hidden">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id}
                  className={`flex items-start gap-3 p-4 ${
                    index !== recentActivities.length - 1 ? "border-b border-foreground/5" : ""
                  }`}
                >
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#e8a87c]/20 to-[#c9a87c]/20 text-[#c9a87c] text-xs">?</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>
                      <span className="text-foreground/60">{activity.action}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-foreground/40">{activity.album}</span>
                      <span className="text-[11px] text-foreground/30">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </IOSLayout>
      </div>
    </>
  )
}
