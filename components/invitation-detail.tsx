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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Envelope Opening Effect */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />

        <DialogHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl text-balance pr-8">{invitation.title}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>AIエージェント「つなぐくん」より</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              マッチ度 {invitation.matchScore}%
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Reason */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm leading-relaxed">{invitation.reason}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="h-4 w-4 text-primary" />
              この投稿に興味を持っています
            </div>
            <Link href={`/album/${invitation.triggerPost.albumId}?post=${invitation.triggerPost.id}`}>
              <div className="p-3 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  <img
                    src={invitation.triggerPost.thumbnail || "/placeholder.svg"}
                    alt={invitation.triggerPost.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1 truncate">{invitation.triggerPost.title}</div>
                    <div className="text-xs text-muted-foreground mb-2 truncate">
                      {invitation.triggerPost.albumName}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                        <span>{invitation.triggerPost.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{invitation.triggerPost.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Suggested Members */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-primary" />
              参加予定メンバー ({invitation.suggestedMembers.length}名)
            </div>
            <div className="grid grid-cols-2 gap-3">
              {invitation.suggestedMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{member.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{member.interests.join(", ")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Interests */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">共通の興味</div>
            <div className="flex flex-wrap gap-2">
              {invitation.commonInterests.map((interest, idx) => (
                <Badge key={idx} variant="outline" className="border-primary/30">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">日時:</span>
              <span>{invitation.suggestedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">場所:</span>
              <span>{invitation.suggestedVenue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">所要時間:</span>
              <span>約2時間</span>
            </div>
          </div>

          {/* Actions */}
          {!accepted ? (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setAccepted(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                参加する
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                後で決める
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">参加申し込み完了！AIが幹事として調整を進めます</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
