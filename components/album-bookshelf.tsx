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
    color: "#d4a574",
    textColor: "#3d2914",
  },
  {
    id: "2",
    name: "東京大学工学部",
    year: "2021",
    location: "東京都",
    members: 67,
    color: "#8b7355",
    textColor: "#f5f0ea",
  },
  {
    id: "3",
    name: "桜丘中学校",
    year: "2014",
    location: "東京都",
    members: 156,
    color: "#c9a992",
    textColor: "#3d2914",
  },
  {
    id: "4",
    name: "桜丘小学校",
    year: "2011",
    location: "東京都",
    members: 203,
    color: "#a08070",
    textColor: "#f5f0ea",
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
          className="relative w-16 h-52 rounded-sm shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${album.color} 0%, ${album.color}dd 50%, ${album.color}aa 100%)`,
            boxShadow: `
              2px 0 4px rgba(0,0,0,0.2),
              inset -2px 0 4px rgba(255,255,255,0.1),
              inset 2px 0 4px rgba(0,0,0,0.1)
            `,
          }}
        >
          {/* Spine edge highlight */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-sm"
            style={{
              background: `linear-gradient(to right, rgba(0,0,0,0.2), transparent)`,
            }}
          />
          
          {/* Spine edge right */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 rounded-r-sm"
            style={{
              background: `linear-gradient(to left, rgba(0,0,0,0.15), transparent)`,
            }}
          />

          {/* Title - vertical text */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-2"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <span 
              className="text-xs font-medium tracking-wider truncate"
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
              className="text-[10px] font-light opacity-80"
              style={{ color: album.textColor }}
            >
              {album.year}
            </span>
          </div>

          {/* Decorative line */}
          <div 
            className="absolute top-4 left-2 right-2 h-px opacity-30"
            style={{ backgroundColor: album.textColor }}
          />
          <div 
            className="absolute bottom-8 left-2 right-2 h-px opacity-30"
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
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-[#8b7355] to-[#6b5344] rounded-sm shadow-inner" />
        
        {/* Books container with horizontal scroll */}
        <div 
          className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide px-1"
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
            <div className="flex-shrink-0 w-16 h-52 rounded-sm border-2 border-dashed border-foreground/20 flex items-center justify-center cursor-pointer hover:border-foreground/40 hover:bg-foreground/5 transition-colors">
              <div 
                className="text-foreground/30 text-2xl font-light"
                style={{ writingMode: "vertical-rl" }}
              >
                +
              </div>
            </div>
          </Link>
        </div>

        {/* Shelf front edge */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-b from-[#9b8365] to-[#7b6354] rounded-b-sm" />
      </div>

      {/* Hint text */}
      <p className="text-center text-[11px] text-foreground/30">
        アルバムをタップして開く
      </p>
    </div>
  )
}
