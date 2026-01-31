"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Users, Calendar, MapPin, ChevronRight, ArrowLeft } from "lucide-react"
import { useState } from "react"
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

export function MyAlbums() {
  const [searchQuery, setSearchQuery] = useState("")
  const [newAlbumName, setNewAlbumName] = useState("")
  const [newAlbumYear, setNewAlbumYear] = useState("")
  const [newAlbumLocation, setNewAlbumLocation] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const myAlbums = [
    {
      id: "1",
      name: "桜ヶ丘高校 3年A組",
      year: "2017",
      location: "東京都",
      members: 42,
      newPhotos: 8,
      recentActivity: "2時間前",
    },
    {
      id: "2",
      name: "東京大学 工学部",
      year: "2021",
      location: "東京都",
      members: 67,
      newPhotos: 3,
      recentActivity: "1日前",
    },
  ]

  const searchableAlbums = [
    {
      id: 3,
      name: "桜丘中学校 2010年卒業",
      year: "2010",
      location: "東京都",
      members: 156,
      recentActivity: "3時間前",
    },
    {
      id: 4,
      name: "東京大学 工学部 2018年卒業",
      year: "2018",
      location: "東京都",
      members: 89,
      recentActivity: "1日前",
    },
    {
      id: 5,
      name: "桜丘小学校 2004年卒業",
      year: "2004",
      location: "東京都",
      members: 203,
      recentActivity: "5時間前",
    },
  ]

  const filteredAlbums = searchableAlbums.filter((album) =>
    album.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {!showSearch ? (
        <>
          {/* Album List */}
          <div className="ios-card overflow-hidden">
            {myAlbums.map((album, index) => (
              <Link key={album.id} href={`/album/${album.id}`}>
                <div className={`flex items-center gap-3 p-4 active:bg-foreground/5 transition-colors ${
                  index !== myAlbums.length - 1 ? "border-b border-foreground/5" : ""
                }`}>
                  {/* Album Icon */}
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{album.name.charAt(0)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium truncate">{album.name}</h3>
                      {album.newPhotos > 0 && (
                        <Badge className="rounded-full px-1.5 py-0 text-[10px] bg-accent text-accent-foreground h-4">
                          +{album.newPhotos}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-foreground/40">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {album.members}
                      </span>
                      <span>{album.year}</span>
                      <span>{album.location}</span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-foreground/20 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>

          {/* Find Album Button */}
          <button 
            type="button"
            onClick={() => setShowSearch(true)} 
            className="ios-card w-full p-4 flex items-center justify-center gap-2 text-foreground/50 active:scale-[0.98] transition-transform"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">アルバムを探す・作成する</span>
          </button>
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
          <div className="ios-card p-3 flex items-center gap-3">
            <Search className="h-4 w-4 text-foreground/30" />
            <Input
              placeholder="学校名、卒業年で検索..."
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Create New Album */}
          <Dialog>
            <DialogTrigger asChild>
              <button 
                type="button"
                className="ios-card w-full p-4 flex items-center gap-3 text-accent active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Plus className="h-5 w-5" />
                </div>
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

          {/* Search Results */}
          {searchQuery && (
            <div className="ios-card overflow-hidden mt-4">
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
    </div>
  )
}
