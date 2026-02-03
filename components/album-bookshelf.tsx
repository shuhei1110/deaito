"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Album {
  id: string
  name: string
  year: string
  location: string
  members: number
  color: string
  textColor: string
  category?: "school" | "club" | "circle" | "friends" | "seminar" | "company"
}

// 西暦順（古い順）でソート済み - albums/page.tsx と統一
const albums: Album[] = [
  {
    id: "1",
    name: "さくら幼稚園",
    year: "2005",
    location: "東京都",
    members: 28,
    color: "#f5e6d8",
    textColor: "#5c5248",
    category: "school",
  },
  {
    id: "2",
    name: "桜丘小学校",
    year: "2011",
    location: "東京都",
    members: 32,
    color: "#e8ddd0",
    textColor: "#5c5248",
    category: "school",
  },
  {
    id: "3",
    name: "桜丘中学校",
    year: "2014",
    location: "東京都",
    members: 35,
    color: "#e5d8c8",
    textColor: "#5c5248",
    category: "school",
  },
  {
    id: "4",
    name: "吹奏楽部",
    year: "2014",
    location: "東京都",
    members: 18,
    color: "#ddd2c4",
    textColor: "#5c5248",
    category: "club",
  },
  {
    id: "5",
    name: "桜ヶ丘高校 3年A組",
    year: "2017",
    location: "東京都",
    members: 38,
    color: "#d9cfc2",
    textColor: "#5c5248",
    category: "school",
  },
  {
    id: "6",
    name: "バスケ部",
    year: "2017",
    location: "東京都",
    members: 12,
    color: "#e2d5c6",
    textColor: "#5c5248",
    category: "club",
  },
  {
    id: "7",
    name: "高校の仲良し6人組",
    year: "2017",
    location: "東京都",
    members: 6,
    color: "#f0e5d8",
    textColor: "#5c5248",
    category: "friends",
  },
  {
    id: "8",
    name: "写真サークル",
    year: "2019",
    location: "東京都",
    members: 15,
    color: "#dcd1c3",
    textColor: "#5c5248",
    category: "circle",
  },
  {
    id: "9",
    name: "田中研究室",
    year: "2021",
    location: "東京都",
    members: 8,
    color: "#e6dace",
    textColor: "#5c5248",
    category: "seminar",
  },
  {
    id: "10",
    name: "東京大学工学部",
    year: "2021",
    location: "東京都",
    members: 67,
    color: "#d8cdc0",
    textColor: "#5c5248",
    category: "school",
  },
  {
    id: "11",
    name: "ABC株式会社 2022新卒",
    year: "2022",
    location: "東京都",
    members: 45,
    color: "#e3d6c7",
    textColor: "#5c5248",
    category: "company",
  },
  {
    id: "12",
    name: "大学の飲み仲間",
    year: "2021",
    location: "東京都",
    members: 9,
    color: "#ede2d5",
    textColor: "#5c5248",
    category: "friends",
  },
]

// エンタープライズ版判定（20人以上）
const isEnterprise = (members: number) => members >= 20

function AlbumSpine({ album, isSelected }: { album: Album; isSelected: boolean }) {
  const enterprise = isEnterprise(album.members)
  
  return (
    <Link href={`/album/${album.id}`}>
      <div
        className={cn(
          "relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-out",
          "hover:-translate-y-2 active:scale-[0.98]",
          isSelected && "-translate-y-3"
        )}
        style={{ perspective: "1000px" }}
      >
        {/* Book spine */}
        <div
          className="relative w-14 h-52 rounded-sm"
          style={{
            background: `linear-gradient(135deg, ${album.color} 0%, ${album.color}ee 50%, ${album.color}dd 100%)`,
            boxShadow: `
              1px 0 3px rgba(0,0,0,0.1),
              inset -1px 0 2px rgba(255,255,255,0.3),
              inset 1px 0 2px rgba(0,0,0,0.05)
            `,
          }}
        >
          {/* エンタープライズ版インジケーター（さりげなく） */}
          {enterprise && (
            <div 
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#c9a87c" }}
              title="Team"
            />
          )}
          
          {/* Spine edge highlight */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-sm"
            style={{
              background: `linear-gradient(to right, rgba(0,0,0,0.1), transparent)`,
            }}
          />
          
          {/* Spine edge right */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-0.5 rounded-r-sm"
            style={{
              background: `linear-gradient(to left, rgba(0,0,0,0.08), transparent)`,
            }}
          />

          {/* Title - vertical text (character by character for mobile compatibility) */}
          <div className="absolute inset-0 flex items-center justify-center px-1 py-10">
            <div className="flex flex-col items-center gap-0">
              {album.name.split("").slice(0, 10).map((char, i) => (
                <span 
                  key={i}
                  className="text-[10px] font-serif leading-[1.3]"
                  style={{ color: album.textColor }}
                >
                  {char}
                </span>
              ))}
              {album.name.length > 10 && (
                <span 
                  className="text-[10px] font-serif leading-[1.3]"
                  style={{ color: album.textColor }}
                >
                  ...
                </span>
              )}
            </div>
          </div>

          {/* Year label at bottom */}
          <div 
            className="absolute bottom-3 left-0 right-0 flex justify-center"
            style={{ writingMode: "horizontal-tb" }}
          >
            <span 
              className="text-[9px] opacity-60"
              style={{ color: album.textColor }}
            >
              {album.year}
            </span>
          </div>

          {/* Decorative line */}
          <div 
            className="absolute top-4 left-2 right-2 h-px opacity-20"
            style={{ backgroundColor: album.textColor }}
          />
          <div 
            className="absolute bottom-8 left-2 right-2 h-px opacity-20"
            style={{ backgroundColor: album.textColor }}
          />
        </div>
      </div>
    </Link>
  )
}

export function AlbumBookshelf() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="px-1">
        <h3 className="text-sm font-medium text-foreground/70 mb-1">マイアルバム</h3>
        <p className="text-xs text-foreground/40">横にスクロールして選択</p>
      </div>

      {/* Bookshelf */}
      <div className="relative">
        {/* Shelf background */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-[#c9bba8] to-[#b8a896] rounded-sm" />
        
        {/* Books container with horizontal scroll */}
        <div 
          className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-hide px-1"
          style={{ 
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {albums.map((album) => (
            <div 
              key={album.id} 
              className="scroll-snap-align-start"
              onMouseEnter={() => setSelectedId(album.id)}
              onMouseLeave={() => setSelectedId(null)}
            >
              <AlbumSpine 
                album={album} 
                isSelected={selectedId === album.id}
              />
            </div>
          ))}
          
          {/* Add new album placeholder */}
          <Link href="/albums">
            <div className="flex-shrink-0 w-14 h-52 rounded-sm border border-dashed border-foreground/15 flex items-center justify-center cursor-pointer hover:border-foreground/25 hover:bg-foreground/3 transition-colors">
              <div 
                className="text-foreground/25 text-xl font-light"
                style={{ writingMode: "vertical-rl" }}
              >
                +
              </div>
            </div>
          </Link>
        </div>

        {/* Shelf front edge */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-b from-[#d4c6b4] to-[#c4b6a4] rounded-b-sm" />
      </div>

      {/* Hint text */}
      <p className="text-center text-[11px] text-foreground/30">
        アルバムをタップして開く
      </p>
    </div>
  )
}
