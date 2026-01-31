"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Users, Calendar, MapPin, ArrowUpRight, ArrowLeft } from "lucide-react"
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

  // 所属アルバム
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

  // 検索可能なアルバム
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
    <div className="space-y-8">
      {/* 所属アルバム */}
      {!showSearch && (
        <>
          <div>
            <h2 className="text-2xl font-serif font-light italic">所属アルバム</h2>
          </div>

          <div className="space-y-4">
            {myAlbums.map((album) => (
              <Link key={album.id} href={`/album/${album.id}`}>
                <div className="group p-6 bg-card/50 border border-border/30 rounded-lg cursor-pointer hover:border-border/60 hover:bg-card transition-all duration-300">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base">{album.name}</h3>
                        {album.newPhotos > 0 && (
                          <Badge className="rounded-full px-2 py-0.5 text-[10px] bg-accent text-accent-foreground">
                            +{album.newPhotos}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-foreground/40">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {album.year}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {album.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          {album.members} members
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* アルバムを探すボタン */}
          <Button 
            onClick={() => setShowSearch(true)} 
            variant="outline" 
            className="w-full gap-2 h-12 text-[10px] uppercase tracking-[0.15em] bg-transparent border-border/40 text-foreground/60 hover:bg-card/50 hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            Find or Create Album
          </Button>
        </>
      )}

      {/* アルバムを探す画面 */}
      {showSearch && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={() => setShowSearch(false)} 
              variant="ghost" 
              size="sm"
              className="gap-2 text-[10px] uppercase tracking-[0.1em] text-foreground/50 hover:text-foreground hover:bg-transparent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif font-light italic">アルバムを探す</h2>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 uppercase tracking-[0.15em] text-[10px] bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-border/30 bg-card">
                <DialogHeader>
                  <DialogTitle className="font-serif font-light italic text-xl">Create New Album</DialogTitle>
                  <DialogDescription className="text-foreground/50 text-sm">
                    卒業した学校やサークルのアルバムを作成して、仲間を招待しましょう
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.15em] text-foreground/50">Album Name</Label>
                    <Input
                      id="name"
                      placeholder="例: 桜丘高校 2015年卒業"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      className="border-border/40 bg-background/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year" className="text-[10px] uppercase tracking-[0.15em] text-foreground/50">Graduation Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="例: 2015"
                      value={newAlbumYear}
                      onChange={(e) => setNewAlbumYear(e.target.value)}
                      className="border-border/40 bg-background/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location" className="text-[10px] uppercase tracking-[0.15em] text-foreground/50">Location</Label>
                    <Input
                      id="location"
                      placeholder="例: 東京都渋谷区"
                      value={newAlbumLocation}
                      onChange={(e) => setNewAlbumLocation(e.target.value)}
                      className="border-border/40 bg-background/50"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="gap-2 bg-foreground text-background hover:bg-foreground/90 text-[10px] uppercase tracking-[0.15em]">
                    <Plus className="h-3.5 w-3.5" />
                    Create Album
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/30" />
                <Input
                  placeholder="学校名、卒業年、地域で検索..."
                  className="pl-11 bg-card/50 border-border/30 h-12 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mt-8">
            <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/40">
              {filteredAlbums.length} Results
            </p>
            {filteredAlbums.map((album) => (
              <div 
                key={album.id} 
                className="group p-6 bg-card/50 border border-border/30 rounded-lg hover:border-border/60 hover:bg-card transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <h3 className="text-base">{album.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-foreground/40">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {album.year}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {album.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {album.members} members
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="uppercase tracking-[0.15em] text-[10px] bg-transparent border-border/40 text-foreground/60 hover:bg-foreground hover:text-background hover:border-foreground">
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
