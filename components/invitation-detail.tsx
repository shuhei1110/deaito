"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, MapPin, Users, Clock, CheckCircle2, ImageIcon, Heart, Eye, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const invitationDetails = {
  1: {
    id: 1,
    title: "都立高校 2017年卒業 同窓会",
    reason: "あなたと佐藤健さん、鈴木美咲さんが「体育祭のリレー」を閲覧しました。共通の思い出に興味を持っています。",
    triggerPost: {
      id: "1",
      title: "体育祭のリレー",
      thumbnail: "/graduation-ceremony-group-photo.jpg",
      likes: 12,
      views: 28,
      albumId: "highschool-2017",
      albumName: "都立高校 2017年卒業",
    },
    suggestedMembers: [
      { name: "佐藤 健", avatar: "/japanese-man-1.jpg", interests: ["スポーツ", "写真"] },
      { name: "鈴木 美咲", avatar: "/japanese-woman-2.jpg", interests: ["旅行", "料理"] },
      { name: "高橋 誠", avatar: "/japanese-man-2.jpg", interests: ["音楽", "カフェ"] },
      { name: "田中 太郎", avatar: "/friendly-japanese-man.jpg", interests: ["写真", "ハイキング"] },
    ],
    suggestedDate: "2024年4月20日(土) 18:00",
    suggestedVenue: "渋谷の居酒屋「思い出亭」",
    commonInterests: ["スポーツ", "写真", "旅行"],
    matchScore: 92,
  },
  2: {
    id: 2,
    title: "東京大学 2021年卒業 ミニ同窓会",
    reason: "木村梨花さん、斎藤拓也さんがあなたの投稿「修学旅行 in 京都」に興味を示しています。",
    triggerPost: {
      id: "2",
      title: "修学旅行 in 京都",
      thumbnail: "/graduation-ceremony-group-photo.jpg",
      likes: 18,
      views: 35,
      albumId: "university-2021",
      albumName: "東京大学 2021年卒業",
    },
    suggestedMembers: [
      { name: "木村 梨花", avatar: "/japanese-woman-3.jpg", interests: ["写真", "旅行"] },
      { name: "斎藤 拓也", avatar: "/japanese-man-3.jpg", interests: ["ハイキング", "カメラ"] },
      { name: "松本 結衣", avatar: "/japanese-woman-4.jpg", interests: ["料理", "旅行"] },
      { name: "田中 太郎", avatar: "/friendly-japanese-man.jpg", interests: ["写真", "ハイキング"] },
    ],
    suggestedDate: "2024年5月5日(日) 14:00",
    suggestedVenue: "新宿のカフェ「Alumni Lounge」",
    commonInterests: ["写真", "旅行", "ハイキング"],
    matchScore: 87,
  },
}

interface InvitationDetailProps {
  invitationId: number
  onClose: () => void
}

export function InvitationDetail({ invitationId, onClose }: InvitationDetailProps) {
  const [accepted, setAccepted] = useState(false)
  const invitation = invitationDetails[invitationId as keyof typeof invitationDetails]

  if (!invitation) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[420px] max-h-[85vh] overflow-y-auto rounded-2xl border-0 p-0 ios-card">
        {/* Header */}
        <div className="sticky top-0 z-10 ios-glass border-b border-foreground/5 px-4 py-3 flex items-center justify-between">
          <button type="button" onClick={onClose} className="text-accent text-sm font-medium">
            閉じる
          </button>
          <span className="text-xs font-medium">招待状</span>
          <div className="w-12" />
        </div>

        <div className="px-4 pb-6 space-y-5">
          {/* Title */}
          <div className="pt-4 text-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] text-foreground/40 mb-3">
              <Sparkles className="h-3 w-3" />
              <span>AIエージェント「つなぐくん」より</span>
            </div>
            <h2 className="text-lg font-medium text-balance">{invitation.title}</h2>
            <Badge className="mt-3 rounded-full text-[10px] font-normal bg-accent/10 text-accent border-0">
              Match {invitation.matchScore}%
            </Badge>
          </div>

          {/* Reason */}
          <div className="ios-card p-4">
            <p className="text-sm leading-relaxed text-foreground/70">{invitation.reason}</p>
          </div>

          {/* Trigger Post */}
          <div className="space-y-2">
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider px-1">関連する投稿</p>
            <Link href={`/album/${invitation.triggerPost.albumId}?post=${invitation.triggerPost.id}`}>
              <div className="ios-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
                <img
                  src={invitation.triggerPost.thumbnail || "/placeholder.svg"}
                  alt={invitation.triggerPost.title}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{invitation.triggerPost.title}</p>
                  <p className="text-[11px] text-foreground/40">{invitation.triggerPost.albumName}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-foreground/30">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {invitation.triggerPost.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {invitation.triggerPost.views}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider px-1">
              参加予定 ({invitation.suggestedMembers.length}人)
            </p>
            <div className="ios-card overflow-hidden">
              {invitation.suggestedMembers.map((member, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 p-3 ${
                    idx !== invitation.suggestedMembers.length - 1 ? "border-b border-foreground/5" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs bg-secondary">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-[10px] text-foreground/40">{member.interests.join(" / ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Interests */}
          <div className="space-y-2">
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider px-1">共通の興味</p>
            <div className="flex flex-wrap gap-2">
              {invitation.commonInterests.map((interest, idx) => (
                <Badge key={idx} variant="secondary" className="rounded-full text-xs font-normal bg-secondary/50 text-foreground/60 border-0">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="ios-card p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-foreground/30" />
              <span>{invitation.suggestedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-foreground/30" />
              <span>{invitation.suggestedVenue}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-foreground/30" />
              <span>約2時間</span>
            </div>
          </div>

          {/* Actions */}
          {!accepted ? (
            <div className="space-y-2 pt-2">
              <Button 
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl text-sm font-medium" 
                onClick={() => setAccepted(true)}
              >
                参加する
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-12 text-foreground/50 hover:bg-transparent hover:text-foreground text-sm" 
                onClick={onClose}
              >
                あとで決める
              </Button>
            </div>
          ) : (
            <div className="ios-card flex items-center justify-center gap-2 p-4 bg-green-50 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">参加申し込み完了！</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
