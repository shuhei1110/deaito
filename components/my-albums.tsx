"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Users, ChevronRight, ArrowLeft, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { type AlbumCategory, type AlbumWithMemberCount } from "@/lib/album-types"
import { createAlbumAction, joinAlbumAction, searchAlbumsAction } from "@/app/albums/actions"

// エンタープライズ版判定（20人以上）
const isEnterprise = (members: number) => members >= 20

// カテゴリーアイコン
const getCategoryIcon = (category?: AlbumCategory) => {
  switch (category) {
    case "club": return "♪"
    case "circle": return "◎"
    case "friends": return "♡"
    case "seminar": return "◇"
    case "company": return "▪"
    default: return "○"
  }
}

export function MyAlbums({ albums }: { albums: AlbumWithMemberCount[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [newAlbumName, setNewAlbumName] = useState("")
  const [newAlbumYear, setNewAlbumYear] = useState("")
  const [newAlbumLocation, setNewAlbumLocation] = useState("")
  const [newAlbumCategory, setNewAlbumCategory] = useState<AlbumCategory>("school")
  const [showSearch, setShowSearch] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<AlbumWithMemberCount[]>([])
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // 招待コード入力ダイアログ
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [joinTargetAlbum, setJoinTargetAlbum] = useState<AlbumWithMemberCount | null>(null)
  const [joinCodeInput, setJoinCodeInput] = useState("")
  const [joinError, setJoinError] = useState("")

  // 作成後の招待コード表示
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null)
  const [showCreatedCode, setShowCreatedCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    startTransition(async () => {
      const result = await searchAlbumsAction(query)
      if (result.albums) setSearchResults(result.albums)
    })
  }

  const handleCreate = () => {
    startTransition(async () => {
      const year = newAlbumYear ? Number.parseInt(newAlbumYear, 10) : undefined
      const result = await createAlbumAction({
        name: newAlbumName,
        category: newAlbumCategory,
        year: Number.isNaN(year) ? undefined : year,
        location: newAlbumLocation || undefined,
      })
      if (result.album && result.joinCode) {
        setDialogOpen(false)
        setNewAlbumName("")
        setNewAlbumYear("")
        setNewAlbumLocation("")
        setNewAlbumCategory("school")
        setCreatedJoinCode(result.joinCode)
        setShowCreatedCode(true)
        router.refresh()
      }
    })
  }

  const handleJoinClick = (album: AlbumWithMemberCount) => {
    setJoinTargetAlbum(album)
    setJoinCodeInput("")
    setJoinError("")
    setJoinDialogOpen(true)
  }

  const handleJoinSubmit = () => {
    if (!joinTargetAlbum || !joinCodeInput.trim()) return
    setJoiningId(joinTargetAlbum.id)
    startTransition(async () => {
      const result = await joinAlbumAction(joinTargetAlbum.id, joinCodeInput.trim().toLowerCase())
      setJoiningId(null)
      if (result.error) {
        setJoinError(result.error)
      } else {
        setJoinDialogOpen(false)
        setJoinTargetAlbum(null)
        setSearchResults((prev) => prev.filter((a) => a.id !== joinTargetAlbum.id))
        router.refresh()
      }
    })
  }

  const handleCopyCode = async () => {
    if (!createdJoinCode) return
    await navigator.clipboard.writeText(createdJoinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categoryOptions: { value: AlbumCategory; label: string }[] = [
    { value: "school", label: "学校" },
    { value: "club", label: "部活" },
    { value: "circle", label: "サークル" },
    { value: "friends", label: "友人" },
    { value: "seminar", label: "ゼミ" },
    { value: "company", label: "会社" },
  ]

  return (
    <div className="space-y-4">
      {!showSearch ? (
        <>
          {/* Album List */}
          {albums.length > 0 ? (
            <div className="ios-card overflow-hidden">
              {albums.map((album, index) => {
                const enterprise = isEnterprise(album.member_count)

                return (
                  <Link key={album.id} href={`/album/${album.id}`}>
                    <div className={`flex items-center gap-3 p-4 active:bg-foreground/5 transition-colors ${
                      index !== albums.length - 1 ? "border-b border-foreground/5" : ""
                    }`}>
                      <div className="relative w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{album.name.charAt(0)}</span>
                        {enterprise && (
                          <div
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#c9a87c" }}
                            title="Team"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] opacity-50">{getCategoryIcon(album.category)}</span>
                          <h3 className="text-sm font-medium truncate">{album.name}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-foreground/40">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {album.member_count}
                          </span>
                          <span>{album.year}</span>
                          <span>{album.location}</span>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-foreground/20 flex-shrink-0" />
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="ios-card p-8 text-center">
              <p className="text-foreground/40 text-sm">まだアルバムがありません</p>
            </div>
          )}

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
            onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]) }}
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
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isPending && <Loader2 className="h-4 w-4 text-foreground/30 animate-spin" />}
          </div>

          {/* Create New Album */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-medium">新しいアルバム</DialogTitle>
                <DialogDescription className="text-foreground/50 text-sm">
                  卒業した学校のアルバムを作成しましょう
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="my-name" className="text-xs text-foreground/50">アルバム名</Label>
                  <Input
                    id="my-name"
                    placeholder="例: 桜丘高校 2015年卒業"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    className="ios-card border-0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="my-category" className="text-xs text-foreground/50">カテゴリー</Label>
                  <select
                    id="my-category"
                    value={newAlbumCategory}
                    onChange={(e) => setNewAlbumCategory(e.target.value as AlbumCategory)}
                    className="ios-card border-0 rounded-md px-3 py-2 text-sm bg-background"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="my-year" className="text-xs text-foreground/50">卒業年</Label>
                    <Input
                      id="my-year"
                      type="number"
                      placeholder="2015"
                      value={newAlbumYear}
                      onChange={(e) => setNewAlbumYear(e.target.value)}
                      className="ios-card border-0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="my-location" className="text-xs text-foreground/50">地域</Label>
                    <Input
                      id="my-location"
                      placeholder="東京都"
                      value={newAlbumLocation}
                      onChange={(e) => setNewAlbumLocation(e.target.value)}
                      className="ios-card border-0"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11"
                  onClick={handleCreate}
                  disabled={!newAlbumName.trim() || isPending}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "作成する"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Search Results */}
          {searchQuery && (
            <div className="ios-card overflow-hidden mt-4">
              <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider">
                検索結果 ({searchResults.length})
              </div>
              {searchResults.length === 0 && !isPending && (
                <div className="p-4 text-center text-sm text-foreground/40">
                  該当するアルバムが見つかりません
                </div>
              )}
              {searchResults.map((album, index) => (
                <div
                  key={album.id}
                  className={`flex items-center gap-3 p-4 ${
                    index !== searchResults.length - 1 ? "border-b border-foreground/5" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0 text-sm">
                    {album.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{album.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-foreground/40 mt-0.5">
                      <span>{album.year}</span>
                      <span>{album.member_count}人</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground text-xs h-8 px-4"
                    onClick={() => handleJoinClick(album)}
                    disabled={joiningId === album.id || isPending}
                  >
                    {joiningId === album.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "参加"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 招待コード入力ダイアログ */}
      <Dialog open={joinDialogOpen} onOpenChange={(open) => {
        setJoinDialogOpen(open)
        if (!open) { setJoinError(""); setJoinCodeInput("") }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">招待コードを入力</DialogTitle>
            <DialogDescription className="text-foreground/50 text-sm">
              {joinTargetAlbum?.name} に参加するには招待コードが必要です
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="my-join-code" className="text-xs text-foreground/50">招待コード</Label>
              <Input
                id="my-join-code"
                placeholder="例: a1b2c3d4e5"
                value={joinCodeInput}
                onChange={(e) => { setJoinCodeInput(e.target.value); setJoinError("") }}
                className="ios-card border-0 font-mono tracking-wider"
                maxLength={10}
                autoComplete="off"
              />
              {joinError && (
                <p className="text-xs text-red-500">{joinError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11"
              onClick={handleJoinSubmit}
              disabled={!joinCodeInput.trim() || isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "参加する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 作成後の招待コード表示ダイアログ */}
      <Dialog open={showCreatedCode} onOpenChange={setShowCreatedCode}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">アルバムを作成しました</DialogTitle>
            <DialogDescription className="text-foreground/50 text-sm">
              メンバーに以下の招待コードを共有してください
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-3 bg-foreground/5 rounded-xl">
              <code className="flex-1 text-center text-lg font-mono tracking-widest whitespace-nowrap">
                {createdJoinCode}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-accent"
                onClick={handleCopyCode}
              >
                {copied ? "コピー済み" : "コピー"}
              </Button>
            </div>
            <p className="text-[11px] text-foreground/40 mt-2 text-center">
              このコードはアルバム設定からいつでも確認できます
            </p>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11"
              onClick={() => setShowCreatedCode(false)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
