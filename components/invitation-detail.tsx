"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, MapPin, Users, Clock, CheckCircle2, ImageIcon, Heart, Eye } from "lucide-react"
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
    reason:
      "木村梨花さん、斎藤拓也さんがあなたの投稿「修学旅行 in 京都」に興味を示しています。最近、「旅行」「写真」が共通の話題として浮上しています。",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border/30 bg-card">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <DialogTitle className="text-2xl font-serif font-light italic text-balance pr-8">{invitation.title}</DialogTitle>
              <div className="flex items-center gap-2 text-[10px] text-foreground/40 uppercase tracking-[0.1em]">
                <Sparkles className="h-3 w-3" />
                <span>AIエージェント「つなぐくん」より</span>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full text-[10px] font-normal bg-transparent border border-border/40 text-foreground/60">
              Match {invitation.matchScore}%
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* Reason */}
          <div className="p-5 bg-background/50 rounded-lg border border-border/20">
            <p className="text-sm leading-relaxed text-foreground/70">{invitation.reason}</p>
          </div>

          {/* Trigger Post */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/40 flex items-center gap-2">
              <ImageIcon className="h-3 w-3" />
              Related Post
            </p>
            <Link href={`/album/${invitation.triggerPost.albumId}?post=${invitation.triggerPost.id}`}>
              <div className="p-4 rounded-lg border border-border/30 bg-background/30 hover:border-border/50 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <img
                    src={invitation.triggerPost.thumbnail || "/placeholder.svg"}
                    alt={invitation.triggerPost.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1">{invitation.triggerPost.title}</p>
                    <p className="text-[11px] text-foreground/40 mb-2">{invitation.triggerPost.albumName}</p>
                    <div className="flex items-center gap-4 text-[10px] text-foreground/30">
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
              </div>
            </Link>
          </div>

          {/* Suggested Members */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/40 flex items-center gap-2">
              <Users className="h-3 w-3" />
              Attendees ({invitation.suggestedMembers.length})
            </p>
            <div className="grid grid-cols-2 gap-3">
              {invitation.suggestedMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/20">
                  <Avatar className="h-10 w-10 border border-border/30">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs font-serif italic">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{member.name}</p>
                    <p className="text-[10px] text-foreground/40 truncate">{member.interests.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Interests */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/40">Common Interests</p>
            <div className="flex flex-wrap gap-2">
              {invitation.commonInterests.map((interest, idx) => (
                <Badge key={idx} variant="secondary" className="rounded-full text-xs font-normal bg-transparent border border-border/30 text-foreground/60">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 p-5 bg-background/30 rounded-lg border border-border/20">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-foreground/30" />
              <span className="text-foreground/50">Date:</span>
              <span>{invitation.suggestedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-foreground/30" />
              <span className="text-foreground/50">Venue:</span>
              <span>{invitation.suggestedVenue}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-foreground/30" />
              <span className="text-foreground/50">Duration:</span>
              <span>約2時間</span>
            </div>
          </div>

          {/* Actions */}
          {!accepted ? (
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 h-12 uppercase tracking-[0.15em] text-[10px] bg-foreground text-background hover:bg-foreground/90" onClick={() => setAccepted(true)}>
                Accept Invitation
              </Button>
              <Button variant="outline" className="flex-1 h-12 uppercase tracking-[0.15em] text-[10px] bg-transparent border-border/40 text-foreground/60 hover:bg-background/50 hover:text-foreground" onClick={onClose}>
                Decide Later
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 p-5 bg-foreground text-background rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">参加申し込み完了！AIが幹事として調整を進めます</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
