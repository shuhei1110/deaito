"use client"

import { useState, useTransition } from "react"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, ArrowLeft, Loader2, KeyRound } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getSpineColor, type AlbumCategory, type AlbumWithMemberCount, type AlbumSearchResult, type InvitationWithDetails } from "@/lib/album-types"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { respondToInvitationAction } from "@/app/invitations/actions"
import {
  createAlbumAction,
  joinAlbumByCodeAction,
  searchAlbumsAction,
  requestJoinAlbumAction,
  getPendingRequestsAction,
  approveJoinRequestAction,
  rejectJoinRequestAction,
} from "./actions"

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

function AlbumSpine({
  album,
  isSelected,
  pendingCount,
  onPendingClick,
}: {
  album: SpineAlbum
  isSelected: boolean
  pendingCount?: number
  onPendingClick?: () => void
}) {
  const enterprise = isEnterprise(album.members)

  return (
    <Link href={`/album/${album.id}`}>
      <div
        className={cn(
          "relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-out",
          "hover:-translate-y-3 active:scale-[0.98]",
          isSelected && "-translate-y-4"
        )}
      >
        {/* Pending request badge */}
        {pendingCount && pendingCount > 0 && (
          <button
            type="button"
            className="absolute -top-2 -right-1 z-10 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onPendingClick?.()
            }}
            title="未承認リクエスト"
          >
            {pendingCount}
          </button>
        )}
        <div
          className="relative w-14 h-64 rounded-sm"
          style={{
            background: `linear-gradient(135deg, ${album.color} 0%, ${album.color}ee 50%, ${album.color}dd 100%)`,
            boxShadow: `
              1px 0 3px rgba(0,0,0,0.1),
              inset -1px 0 2px rgba(255,255,255,0.3),
              inset 1px 0 2px rgba(0,0,0,0.05)
            `,
          }}
        >
          {enterprise && (
            <div
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#c9a87c" }}
              title="Team"
            />
          )}
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-sm"
            style={{ background: "linear-gradient(to right, rgba(0,0,0,0.1), transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-0.5 rounded-r-sm"
            style={{ background: "linear-gradient(to left, rgba(0,0,0,0.08), transparent)" }}
          />

          {/* Title - vertical text */}
          <div className="absolute inset-0 flex items-center justify-center px-1 py-12">
            <div className="flex flex-col items-center gap-0">
              {album.name.split("").slice(0, 12).map((char, i) => (
                <span
                  key={i}
                  className="text-[10px] font-serif leading-[1.3]"
                  style={{ color: album.textColor }}
                >
                  {char}
                </span>
              ))}
              {album.name.length > 12 && (
                <span
                  className="text-[10px] font-serif leading-[1.3]"
                  style={{ color: album.textColor }}
                >
                  ...
                </span>
              )}
            </div>
          </div>

          {/* Year label */}
          <div
            className="absolute bottom-4 left-0 right-0 flex justify-center"
            style={{ writingMode: "horizontal-tb" }}
          >
            <span
              className="text-[9px] opacity-60"
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
              className="text-[8px] opacity-50"
              style={{ color: album.textColor }}
            >
              {album.members}人
            </span>
          </div>

          {/* Decorative lines */}
          <div
            className="absolute top-10 left-2 right-2 h-px opacity-15"
            style={{ backgroundColor: album.textColor }}
          />
          <div
            className="absolute bottom-10 left-2 right-2 h-px opacity-15"
            style={{ backgroundColor: album.textColor }}
          />
        </div>
      </div>
    </Link>
  )
}

export function AlbumsClient({
  initialAlbums,
  currentUserId,
  pendingCounts: initialPendingCounts,
  albumInvitations: initialInvitations,
  userProfile,
  notificationCount,
}: {
  initialAlbums: AlbumWithMemberCount[]
  currentUserId: string
  pendingCounts: Record<string, number>
  albumInvitations: InvitationWithDetails[]
  userProfile: TopBarProfile
  notificationCount: number
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newAlbumName, setNewAlbumName] = useState("")
  const [newAlbumYear, setNewAlbumYear] = useState("")
  const [newAlbumLocation, setNewAlbumLocation] = useState("")
  const [newAlbumCategory, setNewAlbumCategory] = useState<AlbumCategory>("school")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<AlbumSearchResult[]>([])
  const [isPending, startTransition] = useTransition()

  // 招待コード直接入力ダイアログ
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [codeError, setCodeError] = useState("")
  const [codeSuccess, setCodeSuccess] = useState<{ albumName: string } | null>(null)

  // 検索フィルタ
  const [searchCategory, setSearchCategory] = useState<AlbumCategory | undefined>(undefined)
  const [searchYear, setSearchYear] = useState("")

  // 検索結果からのリクエスト送信済みトラッキング
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set())

  // 作成後の招待コード表示
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null)
  const [showCreatedCode, setShowCreatedCode] = useState(false)
  const [copied, setCopied] = useState(false)

  // アルバム招待
  const [invitations, setInvitations] = useState(initialInvitations)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  // オーナー承認UI
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false)
  const [pendingAlbumId, setPendingAlbumId] = useState<string | null>(null)
  const [pendingRequests, setPendingRequests] = useState<{ user_id: string; display_name: string; username: string | null }[]>([])
  const [pendingCounts, setPendingCounts] = useState(initialPendingCounts)

  const spineAlbums = initialAlbums.map(toSpineAlbum)

  const triggerSearch = (query: string, category?: AlbumCategory, year?: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    const yearNum = year ? Number.parseInt(year, 10) : undefined
    startTransition(async () => {
      const result = await searchAlbumsAction(query, category, Number.isNaN(yearNum) ? undefined : yearNum)
      if (result.albums) {
        setSearchResults(result.albums)
      }
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    triggerSearch(query, searchCategory, searchYear)
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

  const handleCodeSubmit = () => {
    if (!codeInput.trim()) return
    startTransition(async () => {
      const result = await joinAlbumByCodeAction(codeInput.trim())
      if (result.error) {
        setCodeError(result.error)
      } else {
        setCodeError("")
        setCodeSuccess({ albumName: result.albumName ?? "" })
        router.refresh()
      }
    })
  }

  const handleSearchRequestJoin = (albumId: string) => {
    startTransition(async () => {
      const result = await requestJoinAlbumAction(albumId)
      if (!result.error) {
        setRequestedIds((prev) => new Set(prev).add(albumId))
      }
    })
  }

  const handleOpenPendingDialog = (albumId: string) => {
    setPendingAlbumId(albumId)
    setPendingDialogOpen(true)
    startTransition(async () => {
      const result = await getPendingRequestsAction(albumId)
      if (result.requests) {
        setPendingRequests(result.requests)
      }
    })
  }

  const handleApprove = (requestUserId: string) => {
    if (!pendingAlbumId) return
    startTransition(async () => {
      const result = await approveJoinRequestAction(pendingAlbumId, requestUserId)
      if (!result.error) {
        setPendingRequests((prev) => prev.filter((r) => r.user_id !== requestUserId))
        setPendingCounts((prev) => {
          const next = { ...prev }
          const count = (next[pendingAlbumId] ?? 1) - 1
          if (count <= 0) delete next[pendingAlbumId]
          else next[pendingAlbumId] = count
          return next
        })
        router.refresh()
      }
    })
  }

  const handleReject = (requestUserId: string) => {
    if (!pendingAlbumId) return
    startTransition(async () => {
      const result = await rejectJoinRequestAction(pendingAlbumId, requestUserId)
      if (!result.error) {
        setPendingRequests((prev) => prev.filter((r) => r.user_id !== requestUserId))
        setPendingCounts((prev) => {
          const next = { ...prev }
          const count = (next[pendingAlbumId] ?? 1) - 1
          if (count <= 0) delete next[pendingAlbumId]
          else next[pendingAlbumId] = count
          return next
        })
      }
    })
  }

  const handleCopyCode = async () => {
    if (!createdJoinCode) return
    await navigator.clipboard.writeText(createdJoinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRespondInvitation = (invitationId: string, response: "accepted" | "declined") => {
    setRespondingId(invitationId)
    startTransition(async () => {
      const result = await respondToInvitationAction(invitationId, response)
      setRespondingId(null)
      if (!result.error) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
        if (response === "accepted") {
          router.refresh()
        }
      }
    })
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
    <IOSLayout breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "アルバム" }]} userProfile={userProfile} notificationCount={notificationCount}>
      {!showSearch ? (
        <>
          {/* Header */}
          <div className="py-4 text-center">
            <h2 className="text-xl font-serif font-light mb-1">マイアルバム</h2>
            <p className="text-foreground/50 text-xs">アルバムを選んで思い出を振り返る</p>
          </div>

          {/* アルバム招待 */}
          {invitations.length > 0 && (
            <div className="mb-6 space-y-3">
              <p className="text-xs text-foreground/50 px-1">アルバムへの招待</p>
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="ios-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      {inv.sender_avatar_url && (
                        <AvatarImage src={inv.sender_avatar_url} />
                      )}
                      <AvatarFallback className="text-xs bg-accent/10 text-accent">
                        {inv.sender_display_name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{inv.album_name}</p>
                      <p className="text-[11px] text-foreground/40 mt-0.5">
                        {inv.sender_display_name} さんからの招待
                      </p>
                      {inv.message && (
                        <p className="text-xs text-foreground/50 mt-1.5 line-clamp-2">
                          {inv.message}
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-7 px-4"
                          onClick={() => handleRespondInvitation(inv.id, "accepted")}
                          disabled={respondingId === inv.id}
                        >
                          {respondingId === inv.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "参加する"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-foreground/40 hover:text-foreground/60 text-xs h-7 px-3"
                          onClick={() => handleRespondInvitation(inv.id, "declined")}
                          disabled={respondingId === inv.id}
                        >
                          辞退
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bookshelf */}
          {spineAlbums.length > 0 ? (
            <div className="relative mb-8">
              <div
                className="absolute bottom-0 left-0 right-0 h-3 rounded-sm"
                style={{
                  background: "linear-gradient(180deg, #c9bba8 0%, #b8a896 50%, #a89886 100%)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
              />

              <div
                className="flex gap-1.5 pb-4 overflow-x-auto scrollbar-hide px-2 pt-4"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {initialAlbums.map((raw) => {
                  const spine = toSpineAlbum(raw)
                  const isOwned = raw.owner_id === currentUserId
                  const count = isOwned ? pendingCounts[raw.id] : undefined
                  return (
                    <div
                      key={spine.id}
                      className="scroll-snap-align-start"
                      onMouseEnter={() => setSelectedId(spine.id)}
                      onMouseLeave={() => setSelectedId(null)}
                    >
                      <AlbumSpine
                        album={spine}
                        isSelected={selectedId === spine.id}
                        pendingCount={count}
                        onPendingClick={() => handleOpenPendingDialog(raw.id)}
                      />
                    </div>
                  )
                })}
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-sm"
                style={{
                  background: "linear-gradient(180deg, #d4c6b4 0%, #c4b6a4 100%)",
                }}
              />
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-foreground/40 text-sm mb-2">まだアルバムがありません</p>
              <p className="text-foreground/30 text-xs">アルバムを作成するか、検索して参加しましょう</p>
            </div>
          )}

          {spineAlbums.length > 0 && (
            <p className="text-center text-[11px] text-foreground/30 mb-6">
              横にスクロールしてアルバムを選択
            </p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setCodeDialogOpen(true)}
              className="ios-card w-full p-4 flex items-center justify-center gap-2 text-accent active:scale-[0.98] transition-transform"
            >
              <KeyRound className="h-4 w-4" />
              <span className="text-sm font-medium">招待コードで参加</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="ios-card w-full p-4 flex items-center justify-center gap-2 text-foreground/50 active:scale-[0.98] transition-transform"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">アルバムを探す</span>
            </button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="ios-card w-full p-4 flex items-center justify-center gap-2 text-accent active:scale-[0.98] transition-transform"
                >
                  <Plus className="h-4 w-4" />
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
                    <Label htmlFor="name" className="text-xs text-foreground/50">アルバム名</Label>
                    <Input
                      id="name"
                      placeholder="例: 桜丘高校 2015年卒業"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      className="ios-card border-0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-xs text-foreground/50">カテゴリー</Label>
                    <Select value={newAlbumCategory} onValueChange={(v) => setNewAlbumCategory(v as AlbumCategory)}>
                      <SelectTrigger className="ios-card border-0 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          </div>
        </>
      ) : (
        <>
          {/* Search View */}
          <button
            type="button"
            onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); setSearchCategory(undefined); setSearchYear(""); setRequestedIds(new Set()) }}
            className="flex items-center gap-2 text-accent text-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </button>

          {/* Search Input */}
          <div className="ios-card p-3 flex items-center gap-3 mb-4">
            <Search className="h-4 w-4 text-foreground/30" />
            <Input
              placeholder="学校名で検索..."
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {isPending && <Loader2 className="h-4 w-4 text-foreground/30 animate-spin" />}
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <Select
              value={searchCategory ?? "all"}
              onValueChange={(v) => {
                const val = v === "all" ? undefined : (v as AlbumCategory)
                setSearchCategory(val)
                triggerSearch(searchQuery, val, searchYear)
              }}
            >
              <SelectTrigger className="ios-card border-0 rounded-xl text-sm flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="卒業年"
              value={searchYear}
              onChange={(e) => {
                setSearchYear(e.target.value)
                triggerSearch(searchQuery, searchCategory, e.target.value)
              }}
              className="ios-card border-0 w-24"
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="ios-card overflow-hidden">
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
                    <div className="flex items-center gap-2 text-[11px] text-foreground/40 mt-0.5 flex-wrap">
                      {album.year && <span>{album.year}年</span>}
                      <span>{categoryOptions.find((c) => c.value === album.category)?.label ?? album.category}</span>
                      {album.location && <span>{album.location}</span>}
                      <span>{album.member_count}人</span>
                    </div>
                    <p className="text-[10px] text-foreground/30 mt-0.5 truncate">
                      作成者: {album.owner_name}
                    </p>
                  </div>
                  {requestedIds.has(album.id) ? (
                    <span className="text-xs text-foreground/40 flex-shrink-0 px-3">送信済み</span>
                  ) : (
                    <Button
                      size="sm"
                      className="rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground text-xs h-8 px-4 flex-shrink-0"
                      onClick={() => handleSearchRequestJoin(album.id)}
                      disabled={isPending}
                    >
                      リクエスト
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 招待コード直接入力ダイアログ */}
      <Dialog open={codeDialogOpen} onOpenChange={(open) => {
        setCodeDialogOpen(open)
        if (!open) { setCodeError(""); setCodeInput(""); setCodeSuccess(null) }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          {codeSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-medium">参加しました</DialogTitle>
                <DialogDescription className="text-foreground/50 text-sm">
                  「{codeSuccess.albumName}」に参加しました
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="pt-4">
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11"
                  onClick={() => setCodeDialogOpen(false)}
                >
                  OK
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-medium">招待コードで参加</DialogTitle>
                <DialogDescription className="text-foreground/50 text-sm">
                  アルバムの招待コードを入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code-input" className="text-xs text-foreground/50">招待コード</Label>
                  <Input
                    id="code-input"
                    placeholder="例: a1b2c3d4e5"
                    value={codeInput}
                    onChange={(e) => { setCodeInput(e.target.value); setCodeError("") }}
                    className="ios-card border-0 font-mono tracking-wider"
                    maxLength={10}
                    autoComplete="off"
                  />
                  {codeError && (
                    <p className="text-xs text-red-500">{codeError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11"
                  onClick={handleCodeSubmit}
                  disabled={!codeInput.trim() || isPending}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "参加する"}
                </Button>
              </DialogFooter>
            </>
          )}
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

      {/* オーナー向け参加リクエスト承認ダイアログ */}
      <Dialog open={pendingDialogOpen} onOpenChange={(open) => {
        setPendingDialogOpen(open)
        if (!open) { setPendingRequests([]); setPendingAlbumId(null) }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">参加リクエスト</DialogTitle>
            <DialogDescription className="text-foreground/50 text-sm">
              承認するとメンバーとしてアルバムに参加できます
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-64 overflow-y-auto">
            {isPending && pendingRequests.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-foreground/30" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <p className="text-center text-sm text-foreground/40 py-6">
                未承認のリクエストはありません
              </p>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div
                    key={req.user_id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03]"
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0 text-sm">
                      {req.display_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{req.display_name}</p>
                      {req.username && (
                        <p className="text-[11px] text-foreground/40">@{req.username}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-7 px-3"
                        onClick={() => handleApprove(req.user_id)}
                        disabled={isPending}
                      >
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-foreground/40 hover:text-red-500 text-xs h-7 px-3"
                        onClick={() => handleReject(req.user_id)}
                        disabled={isPending}
                      >
                        拒否
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </IOSLayout>
  )
}
