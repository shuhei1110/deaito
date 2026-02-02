"use client"

import { use } from "react"
import { IOSLayout } from "@/components/ios-navigation"
import { AlbumGrid } from "@/components/album-grid"
import { ConnectionGraph } from "@/components/connection-graph"
import { AlbumBranchTree } from "@/components/album-branch-tree"
import { useState } from "react"

// アルバムデータのマッピング（albums/page.tsx と同じデータ）
const albumsData: Record<string, { name: string; year: string }> = {
  "1": { name: "桜ヶ丘高校 3年A組", year: "2017" },
  "2": { name: "東京大学工学部", year: "2021" },
  "3": { name: "桜丘中学校", year: "2014" },
  "4": { name: "桜丘小学校", year: "2011" },
  "5": { name: "さくら幼稚園", year: "2005" },
  "6": { name: "渋谷区立第一中", year: "2012" },
  "7": { name: "明治学院大学", year: "2019" },
  "8": { name: "港区立白金小", year: "2009" },
  "9": { name: "慶應義塾高校", year: "2016" },
  "10": { name: "早稲田実業学校", year: "2015" },
}

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const album = albumsData[id] || { name: "アルバム", year: "----" }
  const albumName = album.name
  const albumYear = album.year
  
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
