"use client"

import { use } from "react"
import { IOSLayout } from "@/components/ios-navigation"
import { AlbumGrid } from "@/components/album-grid"
import { ConnectionGraph } from "@/components/connection-graph"
import { AlbumBranchTree } from "@/components/album-branch-tree"
import { useState } from "react"

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const albumName = id === "1" ? "桜ヶ丘高校 3年A組" : "東京大学 工学部"
  const albumYear = id === "1" ? "2017" : "2021"
  
  const [activeTab, setActiveTab] = useState("tree")

  return (
    <IOSLayout 
      breadcrumbs={[
        { label: "ホーム", href: "/" }, 
        { label: "アルバム", href: "/albums" },
        { label: albumName }
      ]}
    >
      <div className="py-4">
        <h2 className="text-xl font-serif font-light mb-1">{albumName}</h2>
        <p className="text-foreground/50 text-xs">{albumYear}年卒業</p>
      </div>

      {/* Segment Control */}
      <div className="flex p-1 bg-foreground/5 rounded-xl mb-6">
        {[
          { id: "tree", label: "ブランチ" },
          { id: "gallery", label: "ギャラリー" },
          { id: "connections", label: "つながり" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "tree" && <AlbumBranchTree albumId={id} />}
        {activeTab === "gallery" && <AlbumGrid />}
        {activeTab === "connections" && <ConnectionGraph />}
      </div>
    </IOSLayout>
  )
}
