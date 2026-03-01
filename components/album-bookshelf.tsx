"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getSpineColor, type AlbumCategory, type AlbumWithMemberCount } from "@/lib/album-types"

interface SpineAlbum {
  id: string
  name: string
  year: string
  members: number
  color: string
  textColor: string
  category: AlbumCategory
}

function toSpineAlbum(album: AlbumWithMemberCount): SpineAlbum {
  const { color, textColor } = getSpineColor(album.id)
  return {
    id: album.id,
    name: album.name,
    year: album.year?.toString() ?? "",
    members: album.member_count,
    color,
    textColor,
    category: album.category,
  }
}

// エンタープライズ版判定（20人以上）
const isEnterprise = (members: number) => members >= 20

function AlbumSpine({ album, isSelected }: { album: SpineAlbum; isSelected: boolean }) {
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
              background: "linear-gradient(to right, rgba(0,0,0,0.1), transparent)",
            }}
          />

          {/* Spine edge right */}
          <div
            className="absolute right-0 top-0 bottom-0 w-0.5 rounded-r-sm"
            style={{
              background: "linear-gradient(to left, rgba(0,0,0,0.08), transparent)",
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

export function AlbumBookshelf({ albums }: { albums: AlbumWithMemberCount[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const spineAlbums = albums.map(toSpineAlbum)

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="px-1">
        <h3 className="text-sm font-medium text-foreground/70 mb-1">マイアルバム</h3>
        <p className="text-xs text-foreground/40">横にスクロールして選択</p>
      </div>

      {/* Bookshelf */}
      {spineAlbums.length > 0 ? (
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
            {spineAlbums.map((album) => (
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
      ) : (
        <div className="py-8 text-center">
          <p className="text-foreground/40 text-sm mb-2">まだアルバムがありません</p>
          <Link href="/albums" className="text-xs text-accent">アルバムを作成・検索する</Link>
        </div>
      )}

      {spineAlbums.length > 0 && (
        <p className="text-center text-[11px] text-foreground/30">
          アルバムをタップして開く
        </p>
      )}
    </div>
  )
}
