"use client"

import { useState } from "react"
import { IOSLayout } from "@/components/ios-navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Album {
  id: string
  name: string
  year: string
  location: string
  members: number
  color: string
  textColor: string
  thickness: "thin" | "normal" | "thick"
}

const myAlbums: Album[] = [
  {
    id: "1",
    name: "桜ヶ丘高校 3年A組",
    year: "2017",
    location: "東京都",
    members: 42,
    color: "#d4a574",
    textColor: "#3d2914",
    thickness: "normal",
  },
  {
    id: "2",
    name: "東京大学工学部",
    year: "2021",
    location: "東京都",
    members: 67,
    color: "#8b7355",
    textColor: "#f5f0ea",
    thickness: "thick",
  },
  {
    id: "3",
    name: "桜丘中学校",
    year: "2014",
    location: "東京都",
    members: 156,
    color: "#c9a992",
    textColor: "#3d2914",
    thickness: "normal",
  },
  {
    id: "4",
    name: "桜丘小学校",
    year: "2011",
    location: "東京都",
    members: 203,
    color: "#a08070",
    textColor: "#f5f0ea",
    thickness: "thin",
  },
  {
    id: "5",
    name: "さくら幼稚園",
    year: "2005",
    location: "東京都",
    members: 89,
    color: "#b8967a",
    textColor: "#3d2914",
    thickness: "thin",
  },
]

const searchableAlbums = [
  { id: "s1", name: "桜丘高校 2016年卒業", year: "2016", members: 180 },
  { id: "s2", name: "東京大学 理学部 2020年卒業", year: "2020", members: 95 },
  { id: "s3", name: "桜丘中学校 2013年卒業", year: "2013", members: 167 },
]

function AlbumSpine({ album, isSelected }: { album: Album; isSelected: boolean }) {
  const widthMap = { thin: "w-12", normal: "w-16", thick: "w-20" }
  
  return (
    <Link href={`/album/${album.id}`}>
      <div
        className={cn(
          "relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-out",
          "hover:-translate-y-3 active:scale-[0.98]",
          isSelected && "-translate-y-4"
        )}
      >
        <div
          className={cn("relative h-64 rounded-sm shadow-lg", widthMap[album.thickness])}
          style={{
            background: `linear-gradient(135deg, ${album.color} 0%, ${album.color}dd 50%, ${album.color}aa 100%)`,
            boxShadow: `
              3px 0 6px rgba(0,0,0,0.25),
              inset -2px 0 4px rgba(255,255,255,0.1),
              inset 2px 0 4px rgba(0,0,0,0.1)
            `,
          }}
        >
          {/* Spine edge highlight */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-sm"
            style={{ background: `linear-gradient(to right, rgba(0,0,0,0.2), transparent)` }}
          />
          
          {/* Spine edge right */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 rounded-r-sm"
            style={{ background: `linear-gradient(to left, rgba(0,0,0,0.15), transparent)` }}
          />

          {/* Title - vertical text */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-3"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <span 
              className="text-xs font-medium tracking-wider line-clamp-2"
              style={{ color: album.textColor }}
            >
              {album.name}
            </span>
          </div>

          {/* Year label */}
          <div 
            className="absolute bottom-4 left-0 right-0 flex justify-center"
            style={{ writingMode: "horizontal-tb" }}
          >
            <span 
              className="text-[10px] font-light opacity-80"
              style={{ color: album.textColor }}
            >
              {album.year}
            </span>
          </div>

          {/* Members count */}
          <div 
            className="absolute top-4 left-0 right-0 flex justify-center"
            style={{ writingMode: "horizontal-tb" }}
          >
            <span 
              className="text-[9px] opacity-60"
              style={{ color: album.textColor }}
            >
              {album.members}人
            </span>
          </div>

          {/* Decorative lines */}
          <div 
            className="absolute top-10 left-2 right-2 h-px opacity-20"
            style={{ backgroundColor: album.textColor }}
          />
          <div 
            className="absolute bottom-10 left-2 right-2 h-px opacity-20"
            style={{ backgroundColor: album.textColor }}
          />
        </div>
      </div>
    </Link>
  )
}

export default function AlbumsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newAlbumName, setNewAlbumName] = useState("")
  const [newAlbumYear, setNewAlbumYear] = useState("")
  const [newAlbumLocation, setNewAlbumLocation] = useState("")

  const filteredAlbums = searchableAlbums.filter((album) =>
    album.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <IOSLayout breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "アルバム" }]}>
      {!showSearch ? (
        <>
          {/* Header */}
          <div className="py-4 text-center">
            <h2 className="text-xl font-serif font-light mb-1 italic">本棚</h2>
            <p className="text-foreground/50 text-xs">アルバムを選んで思い出を振り返る</p>
          </div>

          {/* Bookshelf */}
          <div className="relative mb-8">
            {/* Shelf background - wood texture */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-4 rounded-sm"
              style={{
                background: "linear-gradient(180deg, #9b8365 0%, #7b6354 50%, #6b5344 100%)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            />
            
            {/* Books container */}
            <div 
              className="flex gap-2 pb-5 overflow-x-auto scrollbar-hide px-2 pt-4"
              style={{ 
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {myAlbums.map((album) => (
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
            </div>

            {/* Shelf front edge */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-2 rounded-b-sm"
              style={{
                background: "linear-gradient(180deg, #ab9375 0%, #8b7355 100%)",
              }}
            />
          </div>

          {/* Instructions */}
          <p className="text-center text-[11px] text-foreground/30 mb-6">
            横にスクロールしてアルバムを選択
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => setShowSearch(true)} 
              className="ios-card w-full p-4 flex items-center justify-center gap-2 text-foreground/50 active:scale-[0.98] transition-transform"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">アルバムを探す</span>
            </button>

            <Dialog>
              <DialogTrigger asChild>
                <button 
                  type="button"
                  className="ios-card w-full p-4 flex items-center justify-center gap-2 text-accent active:scale-[0.98] transition-transform"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">新しいアルバムを作成</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[400px] rounded-2xl border-0 ios-card">
                <DialogHeader>
                  <DialogTitle className="text-lg font-medium">新しいアルバム</DialogTitle>
                  <DialogDescription className="text-foreground/50 text-sm">
                    卒業した学校のアルバムを作成しましょう
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-xs text-foreground/50">アルバム名</Label>
                    <Input
                      id="name"
                      placeholder="例: 桜丘高校 2015年卒業"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      className="ios-card border-0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="year" className="text-xs text-foreground/50">卒業年</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="2015"
                        value={newAlbumYear}
                        onChange={(e) => setNewAlbumYear(e.target.value)}
                        className="ios-card border-0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location" className="text-xs text-foreground/50">地域</Label>
                      <Input
                        id="location"
                        placeholder="東京都"
                        value={newAlbumLocation}
                        onChange={(e) => setNewAlbumLocation(e.target.value)}
                        className="ios-card border-0"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11">
                    作成する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        <>
          {/* Search View */}
          <button 
            type="button"
            onClick={() => setShowSearch(false)} 
            className="flex items-center gap-2 text-accent text-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </button>

          {/* Search Input */}
          <div className="ios-card p-3 flex items-center gap-3 mb-4">
            <Search className="h-4 w-4 text-foreground/30" />
            <Input
              placeholder="学校名、卒業年で検索..."
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="ios-card overflow-hidden">
              <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider">
                検索結果 ({filteredAlbums.length})
              </div>
              {filteredAlbums.map((album, index) => (
                <div 
                  key={album.id} 
                  className={`flex items-center gap-3 p-4 ${
                    index !== filteredAlbums.length - 1 ? "border-b border-foreground/5" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0 text-sm">
                    {album.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{album.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-foreground/40 mt-0.5">
                      <span>{album.year}</span>
                      <span>{album.members}人</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground text-xs h-8 px-4"
                  >
                    参加
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </IOSLayout>
  )
}
