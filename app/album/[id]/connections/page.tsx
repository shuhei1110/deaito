"use client"

import { use } from "react"
import { IOSLayout } from "@/components/ios-navigation"
import { ConnectionGraph } from "@/components/connection-graph"

// アルバムデータのマッピング
const albumsData: Record<string, { name: string; year: string }> = {
  "1": { name: "さくら幼稚園", year: "2005" },
  "2": { name: "桜丘小学校", year: "2011" },
  "3": { name: "桜丘中学校", year: "2014" },
  "4": { name: "吹奏楽部", year: "2014" },
  "5": { name: "桜ヶ丘高校 3年A組", year: "2017" },
  "6": { name: "バスケ部", year: "2017" },
  "7": { name: "高校の仲良し6人組", year: "2017" },
  "8": { name: "写真サークル", year: "2019" },
  "9": { name: "田中研究室", year: "2021" },
  "10": { name: "東京大学工学部", year: "2021" },
  "11": { name: "ABC株式会社 2022新卒", year: "2022" },
  "12": { name: "大学の飲み仲間", year: "2021" },
}

export default function ConnectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const album = albumsData[id] || { name: "アルバム", year: "----" }
  const albumName = album.name

  return (
    <IOSLayout 
      breadcrumbs={[
        { label: "ホーム", href: "/" }, 
        { label: "アルバム", href: "/albums" },
        { label: albumName, href: `/album/${id}` },
        { label: "つながり" }
      ]}
    >
      <div className="py-4">
        <h2 className="text-xl font-serif font-light mb-1">つながり</h2>
        <p className="text-foreground/50 text-xs">{albumName}のつなぐポイントと再会の準備状況</p>
      </div>

      {/* Connection Graph */}
      <ConnectionGraph />
    </IOSLayout>
  )
}
