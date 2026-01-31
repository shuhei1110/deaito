"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Users, Calendar, MapPin } from "lucide-react"
import { useState } from "react"
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

export function AlbumSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [newAlbumName, setNewAlbumName] = useState("")
  const [newAlbumYear, setNewAlbumYear] = useState("")
  const [newAlbumLocation, setNewAlbumLocation] = useState("")

  const albums = [
    {
      id: 1,
      name: "桜丘中学校 2010年卒業",
      year: "2010",
      location: "東京都",
      members: 156,
      recentActivity: "3時間前",
      isJoined: false,
    },
    {
      id: 2,
      name: "東京大学 工学部 2018年卒業",
      year: "2018",
      location: "東京都",
      members: 89,
      recentActivity: "1日前",
      isJoined: false,
    },
    {
      id: 3,
      name: "桜丘小学校 2004年卒業",
      year: "2004",
      location: "東京都",
      members: 203,
      recentActivity: "5時間前",
      isJoined: false,
    },
    {
      id: 4,
      name: "青山高校 サッカー部 2014年卒業",
      year: "2014",
      location: "神奈川県",
      members: 34,
      recentActivity: "2日前",
      isJoined: false,
    },
  ]

  const filteredAlbums = albums.filter((album) => album.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Search and Create Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>アルバムを探す・作る</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  新規作成
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>新しいアルバムを作成</DialogTitle>
                  <DialogDescription>
                    卒業した学校やサークルのアルバムを作成して、仲間を招待しましょう
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">アルバム名</Label>
                    <Input
                      id="name"
                      placeholder="例: 桜丘高校 2015年卒業"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">卒業年</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="例: 2015"
                      value={newAlbumYear}
                      onChange={(e) => setNewAlbumYear(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">所在地</Label>
                    <Input
                      id="location"
                      placeholder="例: 東京都渋谷区"
                      value={newAlbumLocation}
                      onChange={(e) => setNewAlbumLocation(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    作成する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="学校名、卒業年、地域で検索..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">検索結果 ({filteredAlbums.length}件)</h3>
        {filteredAlbums.map((album) => (
          <Card key={album.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <h4 className="font-bold text-lg mb-2">{album.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        {album.year}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {album.location}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {album.members}人
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">最終更新: {album.recentActivity}</p>
                </div>
                <Button variant={album.isJoined ? "secondary" : "default"} className="gap-2">
                  {album.isJoined ? "参加済み" : "参加する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
