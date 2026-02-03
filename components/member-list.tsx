"use client"

import { useState, useEffect } from "react"
import { Users, Search, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Member {
  id: string
  name: string
  nickname?: string
  avatar?: string
  role?: "owner" | "admin" | "member"
  lastActive?: string
  isAnonymous?: boolean
}

interface MemberListProps {
  albumId: string
}

// エンタープライズ版判定（20人以上）
const isEnterprise = (count: number) => count >= 20

export function MemberList({ albumId }: MemberListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // サンプルメンバーデータ（アルバムIDに基づいて生成）
  const members: Member[] = [
    { id: "1", name: "田中 太郎", nickname: "たろー", role: "owner", lastActive: "オンライン" },
    { id: "2", name: "佐藤 花子", nickname: "はなちゃん", role: "admin", lastActive: "3分前" },
    { id: "3", name: "鈴木 一郎", role: "member", lastActive: "1時間前" },
    { id: "4", name: "高橋 美咲", nickname: "みーちゃん", role: "member", lastActive: "2時間前" },
    { id: "5", name: "伊藤 健太", role: "member", lastActive: "昨日" },
    { id: "6", name: "渡辺 さくら", nickname: "さくら", role: "member", lastActive: "2日前" },
    { id: "7", name: "山本 翔太", role: "member", lastActive: "3日前" },
    { id: "8", name: "中村 愛", nickname: "あいちゃん", role: "member", lastActive: "1週間前" },
    { id: "9", name: "小林 大輔", role: "member", lastActive: "2週間前" },
    { id: "10", name: "加藤 結衣", role: "member", lastActive: "1ヶ月前" },
    { id: "11", name: "匿名メンバー", isAnonymous: true, role: "member", lastActive: "不明" },
    { id: "12", name: "匿名メンバー", isAnonymous: true, role: "member", lastActive: "不明" },
  ]

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const enterprise = isEnterprise(members.length)

  const getRoleLabel = (role?: Member["role"]) => {
    switch (role) {
      case "owner": return { label: "オーナー", color: "#c9a87c" }
      case "admin": return { label: "管理者", color: "#a89886" }
      default: return null
    }
  }

  const getInitials = (name: string) => {
    return name.charAt(0)
  }

  if (!isClient) {
    return <div className="animate-pulse h-48 bg-foreground/5 rounded-xl" />
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
          {/* エンタープライズ版のさりげない表示 */}
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
      <div className="ios-card overflow-hidden">
        {filteredMembers.map((member, index) => {
          const roleInfo = getRoleLabel(member.role)
          
          return (
            <div 
              key={member.id}
              className={`flex items-center gap-3 p-3 transition-colors ${
                index !== filteredMembers.length - 1 ? "border-b border-foreground/5" : ""
              }`}
            >
              {/* アバター */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: member.isAnonymous 
                    ? "linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)"
                    : "linear-gradient(135deg, #f5e6d8 0%, #e8d4c4 100%)",
                }}
              >
                {member.isAnonymous ? (
                  <MoreHorizontal className="h-4 w-4 text-foreground/40" />
                ) : (
                  <span 
                    className="text-sm font-medium"
                    style={{ color: "#8b7355" }}
                  >
                    {getInitials(member.name)}
                  </span>
                )}
              </div>

              {/* 名前と情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {member.isAnonymous ? "匿名メンバー" : member.name}
                  </span>
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
                </div>
                {member.nickname && !member.isAnonymous && (
                  <p className="text-[11px] text-foreground/40">@{member.nickname}</p>
                )}
              </div>
            </div>
          )
        })}

        {filteredMembers.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-foreground/40">該当するメンバーがいません</p>
          </div>
        )}
      </div>

      {/* 匿名メンバーについての説明 */}
      <p className="text-[11px] text-foreground/30 text-center px-4">
        一部のメンバーはプライバシー設定により匿名で表示されています
      </p>
    </div>
  )
}
