"use client"

import { useState, useTransition, useRef, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { AlbumGrid } from "@/components/album-grid"
import { AlbumBranchTree } from "@/components/album-branch-tree"
import { MemberList } from "@/components/member-list"
import { TsunaguMiniCard } from "@/components/tsunagu-mini-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Settings, Copy, RefreshCw, Loader2, UserPlus, Search, CheckCircle2, Send, Sparkles, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type {
  AlbumWithMemberCount,
  EventTreeNode,
  MediaAssetRow,
  AlbumMemberWithProfile,
  UserAlbumRole,
} from "@/lib/album-types"
import {
  regenerateJoinCodeAction,
  sendInvitationFromAlbumAction,
  searchUsersForInviteFromAlbumAction,
  recordAlbumViewAction,
  updateAlbumThresholdAction,
  deleteAlbumAction,
  loadMoreMediaAction,
} from "./actions"

// カテゴリーラベル
const getCategoryLabel = (category: string) => {
  switch (category) {
    case "club": return "部活"
    case "circle": return "サークル"
    case "friends": return "友達"
    case "seminar": return "ゼミ"
    case "company": return "会社"
    default: return "学校"
  }
}

export function AlbumDetailClient({
  album,
  userRole,
  currentUserId,
  eventTree,
  initialMedia,
  mediaTotalCount,
  members,
  joinCode: initialJoinCode,
  pendingRequests,
  tsunaguTotalPoints,
  userProfile,
  notificationCount,
}: {
  album: AlbumWithMemberCount
  userRole: UserAlbumRole
  currentUserId: string
  eventTree: EventTreeNode[]
  initialMedia: MediaAssetRow[]
  mediaTotalCount: number
  members: AlbumMemberWithProfile[]
  joinCode?: string
  pendingRequests: { user_id: string; display_name: string; username: string | null }[]
  tsunaguTotalPoints?: number
  userProfile: TopBarProfile
  notificationCount: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") ?? "tree"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isPending, startTransition] = useTransition()
  const [media, setMedia] = useState(initialMedia)
  const [mediaTotal, setMediaTotal] = useState(mediaTotalCount)

  // オーナー設定
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [joinCode, setJoinCode] = useState(initialJoinCode)
  const [copied, setCopied] = useState(false)

  // 閾値設定
  const [thresholdValue, setThresholdValue] = useState(album.tsunagu_threshold)
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false)
  const [thresholdSaved, setThresholdSaved] = useState(false)

  // アルバム削除
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // 閲覧記録
  useEffect(() => {
    recordAlbumViewAction(album.id)
  }, [album.id])

  // 招待送信
  const [inviteQuery, setInviteQuery] = useState("")
  const [inviteResults, setInviteResults] = useState<
    { id: string; display_name: string; username: string | null; avatar_url: string | null }[]
  >([])
  const [inviteMessage, setInviteMessage] = useState("")
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string
    display_name: string
    username: string | null
    avatar_url: string | null
  } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInviteSearch = useCallback(
    (query: string) => {
      setInviteQuery(query)
      setSelectedRecipient(null)
      setInviteSent(false)
      setInviteError(null)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!query || query.length < 1) {
        setInviteResults([])
        return
      }
      debounceRef.current = setTimeout(async () => {
        const result = await searchUsersForInviteFromAlbumAction(album.id, query)
        if (result.users) setInviteResults(result.users)
      }, 300)
    },
    [album.id]
  )

  const handleSendInvitation = async () => {
    if (!selectedRecipient) return
    setInviteSending(true)
    setInviteError(null)
    const result = await sendInvitationFromAlbumAction({
      albumId: album.id,
      recipientId: selectedRecipient.id,
      message: inviteMessage || undefined,
    })
    setInviteSending(false)
    if (result.error) {
      setInviteError(result.error)
    } else {
      setInviteSent(true)
      setInviteQuery("")
      setInviteResults([])
      setInviteMessage("")
    }
  }

  const handleUpdateThreshold = async () => {
    setIsUpdatingThreshold(true)
    const result = await updateAlbumThresholdAction(album.id, thresholdValue)
    setIsUpdatingThreshold(false)
    if (!result.error) {
      setThresholdSaved(true)
      setTimeout(() => setThresholdSaved(false), 2000)
    }
  }

  const handleDeleteAlbum = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    const result = await deleteAlbumAction(album.id)
    setIsDeleting(false)
    if (result.error) {
      setDeleteError(result.error)
    } else {
      setDeleteConfirmOpen(false)
      router.push("/albums")
    }
  }

  const isOwnerOrAdmin = userRole === "owner" || userRole === "admin"
  const pendingCount = pendingRequests.length

  const handleCopyCode = async () => {
    if (!joinCode) return
    await navigator.clipboard.writeText(joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerateCode = () => {
    startTransition(async () => {
      const result = await regenerateJoinCodeAction(album.id)
      if (result.joinCode) {
        setJoinCode(result.joinCode)
      }
    })
  }

  const tabs = [
    { id: "tree", label: "イベント" },
    { id: "gallery", label: "ギャラリー" },
    { id: "members", label: pendingCount > 0 ? `メンバー (${pendingCount})` : "メンバー" },
  ]

  return (
    <IOSLayout
      breadcrumbs={[
        { label: "ホーム", href: "/" },
        { label: "アルバム", href: "/albums" },
        { label: album.name },
      ]}
      userProfile={userProfile}
      notificationCount={notificationCount}
    >
      <div className="py-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-serif font-light">{album.name}</h2>
          {isOwnerOrAdmin && (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-foreground/40 hover:text-foreground/70 transition-colors"
              title="アルバム設定"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-foreground/50 text-xs">
          {album.year}年 · {getCategoryLabel(album.category)} · {album.member_count}人
        </p>
      </div>

      {/* つなぐポイント ミニカード */}
      <div className="mb-6">
        <TsunaguMiniCard albumId={album.id} totalPoints={tsunaguTotalPoints ?? 0} targetPoints={album.tsunagu_threshold} />
      </div>

      {/* Segment Control */}
      <div className="flex p-1 bg-foreground/5 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/50"
            }`}
          >
            {tab.label}
            {tab.id === "members" && pendingCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "tree" && (
          <AlbumBranchTree
            albumId={album.id}
            topLevelNodes={eventTree}
            userRole={userRole}
          />
        )}
        {activeTab === "gallery" && (
          <AlbumGrid
            albumId={album.id}
            media={media}
            totalCount={mediaTotal}
            currentUserId={currentUserId}
            currentUserRole={userRole}
            onMediaDeleted={(mediaId) => {
              setMedia((prev) => prev.filter((m) => m.id !== mediaId))
              setMediaTotal((prev) => Math.max(0, prev - 1))
            }}
            onLoadMore={async () => {
              const result = await loadMoreMediaAction(album.id, media.length, 20)
              setMedia((prev) => [...prev, ...result.media])
              setMediaTotal(result.total)
            }}
          />
        )}
        {activeTab === "members" && (
          <MemberList
            albumId={album.id}
            members={members}
            currentUserId={currentUserId}
            userRole={userRole}
            pendingRequests={pendingRequests}
          />
        )}
      </div>

      {/* オーナー設定ダイアログ */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">アルバム設定</DialogTitle>
            <DialogDescription className="text-foreground/50 text-sm">
              招待コードの管理
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* 招待コード */}
            <div>
              <p className="text-xs text-foreground/50 mb-2">招待コード</p>
              <div className="flex items-center gap-2 p-3 bg-foreground/5 rounded-xl">
                <code className="flex-1 text-center text-lg font-mono tracking-widest">
                  {joinCode ?? "---"}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-accent"
                  onClick={handleCopyCode}
                  disabled={!joinCode}
                >
                  {copied ? (
                    "コピー済み"
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      コピー
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-foreground/40 mt-1">
                このコードを共有するとメンバーがアルバムに参加できます
              </p>
            </div>

            {/* 再生成 */}
            <Button
              variant="outline"
              className="w-full rounded-xl h-10 text-sm"
              onClick={handleRegenerateCode}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              招待コードを再生成
            </Button>
            <p className="text-[11px] text-foreground/40 text-center">
              再生成すると古いコードは無効になります
            </p>

            {/* つなぐポイントしきい値 */}
            {userRole === "owner" && (
              <div className="border-t border-foreground/10 pt-4">
                <p className="text-xs text-foreground/50 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  再会しきい値
                </p>
                <p className="text-[11px] text-foreground/40 mb-2">
                  つなぐポイントがこの値に達すると再会提案が表示されます
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={10}
                    max={10000}
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(Number(e.target.value))}
                    className="h-9 text-sm rounded-xl bg-foreground/5 border-0 w-24"
                  />
                  <span className="text-xs text-foreground/40">pt</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-9 text-xs"
                    onClick={handleUpdateThreshold}
                    disabled={isUpdatingThreshold}
                  >
                    {thresholdSaved ? "保存済み" : "保存"}
                  </Button>
                </div>
              </div>
            )}

            {/* 区切り線 */}
            <div className="border-t border-foreground/10 pt-4">
              <p className="text-xs text-foreground/50 mb-2 flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                ユーザーを直接招待
              </p>

              {/* 検索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
                <Input
                  placeholder="ユーザー名で検索..."
                  value={inviteQuery}
                  onChange={(e) => handleInviteSearch(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-xl bg-foreground/5 border-0"
                />
              </div>

              {/* 検索結果 */}
              {inviteResults.length > 0 && !selectedRecipient && (
                <div className="mt-2 max-h-36 overflow-y-auto space-y-1 rounded-xl border border-foreground/10 p-1">
                  {inviteResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-foreground/5 transition-colors text-left"
                      onClick={() => {
                        setSelectedRecipient(user)
                        setInviteQuery(user.display_name)
                        setInviteResults([])
                      }}
                    >
                      <Avatar className="h-7 w-7">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                        <AvatarFallback className="text-[10px]">
                          {user.display_name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{user.display_name}</p>
                        {user.username && (
                          <p className="text-[10px] text-foreground/40">@{user.username}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 選択済み + メッセージ + 送信 */}
              {selectedRecipient && !inviteSent && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-accent/5 rounded-lg">
                    <Avatar className="h-7 w-7">
                      {selectedRecipient.avatar_url && (
                        <AvatarImage src={selectedRecipient.avatar_url} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {selectedRecipient.display_name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium flex-1">
                      {selectedRecipient.display_name}
                    </span>
                    <button
                      type="button"
                      className="text-[10px] text-foreground/40"
                      onClick={() => {
                        setSelectedRecipient(null)
                        setInviteQuery("")
                      }}
                    >
                      変更
                    </button>
                  </div>
                  <Input
                    placeholder="メッセージ（任意）"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="h-9 text-sm rounded-xl bg-foreground/5 border-0"
                  />
                  {inviteError && (
                    <p className="text-xs text-red-500">{inviteError}</p>
                  )}
                  <Button
                    size="sm"
                    className="w-full rounded-xl h-9 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleSendInvitation}
                    disabled={inviteSending}
                  >
                    {inviteSending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    招待を送信
                  </Button>
                </div>
              )}

              {/* 送信完了 */}
              {inviteSent && (
                <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-green-50 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium">招待を送信しました</span>
                </div>
              )}
            </div>

            {/* アルバム削除（オーナーのみ） */}
            {userRole === "owner" && (
              <div className="border-t border-red-200 pt-4">
                <p className="text-xs text-red-500/70 mb-2 flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  危険な操作
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-9 text-xs border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    setSettingsOpen(false)
                    setDeleteConfirmOpen(true)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  このアルバムを削除
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11"
              onClick={() => setSettingsOpen(false)}
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* アルバム削除確認ダイアログ */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">アルバム「{album.name}」を削除しますか？</DialogTitle>
            <DialogDescription className="text-xs">
              メンバー・イベント・写真・動画など、すべてのデータが完全に削除されます。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-xs text-red-500">{deleteError}</p>
          )}
          <DialogFooter className="flex gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              className="flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteAlbum}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </IOSLayout>
  )
}
