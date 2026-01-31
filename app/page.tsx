"use client"

import { useState } from "react"
import { IOSLayout } from "@/components/ios-navigation"
import { InvitationLetters } from "@/components/invitation-letters"
import { MyAlbums } from "@/components/my-albums"
import { ActivityTimeline } from "@/components/activity-timeline"
import { cn } from "@/lib/utils"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"invitations" | "albums" | "timeline">("invitations")

  return (
    <IOSLayout breadcrumbs={[{ label: "ホーム" }]}>
      {/* Hero Section */}
      <div className="py-8 text-center">
        <h2 className="text-2xl font-serif font-light leading-tight mb-3 text-balance italic">
          終わりのない「つながり」を
        </h2>
        <p className="text-foreground/50 leading-relaxed text-xs max-w-xs mx-auto">
          AIエージェントと共に、人間関係を円滑にしていく新しい卒業アルバム。
        </p>
      </div>

      {/* iOS-style Segmented Control */}
      <div className="ios-card p-1 mb-6">
        <div className="flex">
          {[
            { id: "invitations", label: "招待状", badge: 2 },
            { id: "albums", label: "アルバム" },
            { id: "timeline", label: "タイムライン" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex-1 py-2.5 px-3 text-xs font-medium rounded-xl transition-all duration-200 relative",
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-foreground/50 hover:text-foreground/70"
              )}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "invitations" && <InvitationLetters />}
        {activeTab === "albums" && <MyAlbums />}
        {activeTab === "timeline" && <ActivityTimeline />}
      </div>
    </IOSLayout>
  )
}
