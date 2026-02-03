"use client"

import { use } from "react"
import { IOSLayout } from "@/components/ios-navigation"
import { AlbumGrid } from "@/components/album-grid"
import { AlbumBranchTree } from "@/components/album-branch-tree"
import { MemberList } from "@/components/member-list"
import { TsunaguMiniCard } from "@/components/tsunagu-mini-card"
import { useState } from "react"

// アルバムデータのマッピング（albums/page.tsx と同じデータ - 西暦順）
const albumsData: Record<string, { name: string; year: string; members: number; category: string }> = {
  "1": { name: "さくら幼稚園", year: "2005", members: 28, category: "school" },
  "2": { name: "桜丘小学校", year: "2011", members: 32, category: "school" },
  "3": { name: "桜丘中学校", year: "2014", members: 35, category: "school" },
  "4": { name: "吹奏楽部", year: "2014", members: 18, category: "club" },
  "5": { name: "桜ヶ丘高校 3年A組", year: "2017", members: 38, category: "school" },
  "6": { name: "バスケ部", year: "2017", members: 12, category: "club" },
  "7": { name: "高校の仲良し6人組", year: "2017", members: 6, category: "friends" },
  "8": { name: "写真サークル", year: "2019", members: 15, category: "circle" },
  "9": { name: "田中研究室", year: "2021", members: 8, category: "seminar" },
  "10": { name: "東京大学工学部", year: "2021", members: 67, category: "school" },
  "11": { name: "ABC株式会社 2022新卒", year: "2022", members: 45, category: "company" },
  "12": { name: "大学の飲み仲間", year: "2021", members: 9, category: "friends" },
}

// カテゴリーラベル
const getCategoryLabel = (category: string) => {
  switch (category) {
    case "club": return "部活"
    case "circle": return "サークル"
    case "friends": return "友達"
    case "seminar": return "ゼミ"
    case "company": return "会社"
    default: return "学校"
  }
}

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const album = albumsData[id] || { name: "アルバム", year: "----", members: 0, category: "school" }
  const albumName = album.name
  const albumYear = album.year
  const categoryLabel = getCategoryLabel(album.category)
  
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
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-serif font-light">{albumName}</h2>
        </div>
        <p className="text-foreground/50 text-xs">
          {albumYear}年 · {categoryLabel}
        </p>
      </div>

      {/* つなぐポイント ミニカード */}
      <div className="mb-6">
        <TsunaguMiniCard albumId={id} />
      </div>

      {/* Segment Control */}
      <div className="flex p-1 bg-foreground/5 rounded-xl mb-6">
        {[
          { id: "tree", label: "イベント" },
          { id: "gallery", label: "ギャラリー" },
          { id: "members", label: "メンバー" },
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
        {activeTab === "members" && <MemberList albumId={id} />}
      </div>
    </IOSLayout>
  )
}
