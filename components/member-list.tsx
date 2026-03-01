"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Users, Search, MoreVertical, Loader2, ShieldCheck, UserMinus, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { AlbumMemberWithProfile, UserAlbumRole } from "@/lib/album-types"
import { approveJoinRequestAction, rejectJoinRequestAction } from "@/app/albums/actions"
import { removeMemberAction, changeMemberRoleAction } from "@/app/album/[id]/actions"

interface MemberListProps {
  albumId: string
  members: AlbumMemberWithProfile[]
  currentUserId: string
  userRole: UserAlbumRole
  pendingRequests?: { user_id: string; display_name: string; username: string | null }[]
}

// エンタープライズ版判定（20人以上）
const isEnterprise = (count: number) => count >= 20

export function MemberList({ albumId, members, currentUserId, userRole, pendingRequests = [] }: MemberListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isPending, startTransition] = useTransition()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [localPending, setLocalPending] = useState(pendingRequests)

  const isOwner = userRole === "owner"
  const enterprise = isEnterprise(members.length)

  const filteredMembers = members.filter((member) =>
    member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner": return { label: "オーナー", color: "#c9a87c" }
      case "admin": return { label: "管理者", color: "#a89886" }
      default: return null
    }
  }

  const handleApprove = (requestUserId: string) => {
    startTransition(async () => {
      const result = await approveJoinRequestAction(albumId, requestUserId)
      if (!result.error) {
        setLocalPending((prev) => prev.filter((r) => r.user_id !== requestUserId))
        router.refresh()
      }
    })
  }

  const handleReject = (requestUserId: string) => {
    startTransition(async () => {
      const result = await rejectJoinRequestAction(albumId, requestUserId)
      if (!result.error) {
        setLocalPending((prev) => prev.filter((r) => r.user_id !== requestUserId))
      }
    })
  }

  const handleRemoveMember = (targetUserId: string) => {
    setOpenMenuId(null)
    startTransition(async () => {
      const result = await removeMemberAction(albumId, targetUserId)
      if (!result.error) {
        router.refresh()
      }
    })
  }

  const handleChangeRole = (targetUserId: string, newRole: "admin" | "member") => {
    setOpenMenuId(null)
    startTransition(async () => {
      const result = await changeMemberRoleAction(albumId, targetUserId, newRole)
      if (!result.error) {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-foreground/50" />
          <span className="text-sm text-foreground/70">
            {members.length}人のメンバー
          </span>
          {enterprise && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(201, 168, 124, 0.15)",
                color: "#c9a87c",
              }}
            >
              Team
            </span>
          )}
        </div>
      </div>

      {/* 未承認リクエスト */}
      {isOwner && localPending.length > 0 && (
        <div className="ios-card overflow-hidden">
          <div className="px-4 py-2 text-[11px] text-foreground/40 uppercase tracking-wider flex items-center justify-between">
            <span>参加リクエスト ({localPending.length})</span>
            {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          {localPending.map((req) => (
            <div
              key={req.user_id}
              className="flex items-center gap-3 p-3 border-t border-foreground/5"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f5e6d8 0%, #e8d4c4 100%)" }}
              >
                <span className="text-sm font-medium" style={{ color: "#8b7355" }}>
                  {req.display_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{req.display_name}</span>
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

      {/* 検索 */}
      <div className="ios-card p-2 flex items-center gap-2">
        <Search className="h-4 w-4 text-foreground/30" />
        <Input
          placeholder="メンバーを検索..."
          className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* メンバーリスト */}
      <div className="ios-card">
        {filteredMembers.map((member, index) => {
          const roleInfo = getRoleLabel(member.role)
          const isSelf = member.user_id === currentUserId
          const canManage = isOwner && !isSelf && member.role !== "owner"

          return (
            <div
              key={member.user_id}
              className={`flex items-center gap-3 p-3 transition-colors ${
                index !== filteredMembers.length - 1 ? "border-b border-foreground/5" : ""
              }`}
            >
              {/* アバター */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: member.avatar_url
                    ? `url(${member.avatar_url}) center/cover`
                    : "linear-gradient(135deg, #f5e6d8 0%, #e8d4c4 100%)",
                }}
              >
                {!member.avatar_url && (
                  <span className="text-sm font-medium" style={{ color: "#8b7355" }}>
                    {member.display_name.charAt(0)}
                  </span>
                )}
              </div>

              {/* 名前と情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{member.display_name}</span>
                  {roleInfo && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${roleInfo.color}20`,
                        color: roleInfo.color,
                      }}
                    >
                      {roleInfo.label}
                    </span>
                  )}
                  {isSelf && (
                    <span className="text-[9px] text-foreground/30">あなた</span>
                  )}
                </div>
                {member.username && (
                  <p className="text-[11px] text-foreground/40">@{member.username}</p>
                )}
              </div>

              {/* オーナー管理メニュー */}
              {canManage && (
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === member.user_id ? null : member.user_id)}
                    className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-foreground/40" />
                  </button>
                  {openMenuId === member.user_id && (
                    <div className="absolute right-0 top-full mt-1 z-10 w-44 bg-background border border-border/50 rounded-xl shadow-lg overflow-hidden">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-foreground/70 hover:bg-foreground/5 transition-colors"
                        onClick={() => handleChangeRole(
                          member.user_id,
                          member.role === "admin" ? "member" : "admin"
                        )}
                      >
                        {member.role === "admin" ? (
                          <>
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            メンバーに降格
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            管理者に昇格
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => handleRemoveMember(member.user_id)}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        退出させる
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filteredMembers.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-foreground/40">該当するメンバーがいません</p>
          </div>
        )}
      </div>
    </div>
  )
}
