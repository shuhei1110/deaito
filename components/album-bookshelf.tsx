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
}

const albums: Album[] = [
  {
    id: "1",
    name: "桜ヶ丘高校",
    year: "2017",
    location: "東京都",
    members: 42,
    color: "#e8ddd0",
    textColor: "#5c5248",
  },
  {
    id: "2",
    name: "東京大学工学部",
    year: "2021",
    location: "東京都",
    members: 67,
    color: "#d9cfc2",
    textColor: "#5c5248",
  },
  {
    id: "3",
    name: "桜丘中学校",
    year: "2014",
    location: "東京都",
    members: 156,
    color: "#e5d8c8",
    textColor: "#5c5248",
  },
  {
    id: "4",
    name: "桜丘小学校",
    year: "2011",
    location: "東京都",
    members: 203,
    color: "#ddd2c4",
    textColor: "#5c5248",
  },
]

function AlbumSpine({ album, isSelected }: { album: Album; isSelected: boolean }) {
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

          {/* Title - vertical text */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-2"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <span 
              className="text-[11px] font-serif tracking-wider truncate"
              style={{ color: album.textColor }}
            >
              {album.name}
            </span>
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
