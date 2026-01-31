"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, MapPin, Users, Clock, CheckCircle2 } from "lucide-react"
import { useState } from "react"

const aiProposals = [
  {
    id: 1,
    title: "都立高校 2017年卒業 同窓会",
    reason: "あなたと佐藤健さん、鈴木美咲さんが「体育祭のリレー」を閲覧しました。共通の思い出に興味を持っています。",
    suggestedMembers: [
      { name: "佐藤 健", avatar: "/japanese-man.png", interests: ["スポーツ", "写真"] },
      { name: "鈴木 美咲", avatar: "/japanese-woman.png", interests: ["旅行", "料理"] },
      { name: "高橋 誠", avatar: "/japanese-young-man.jpg", interests: ["音楽", "カフェ"] },
      { name: "田中 太郎", avatar: "/friendly-japanese-man.jpg", interests: ["写真", "ハイキング"] },
    ],
    suggestedDate: "2024年4月20日(土) 18:00",
    suggestedVenue: "渋谷の居酒屋「思い出亭」",
    commonInterests: ["スポーツ", "写真", "旅行"],
    matchScore: 92,
    status: "pending",
  },
  {
    id: 2,
    title: "東京大学 2021年卒業 ミニ同窓会",
    reason:
      "木村梨花さん、斎藤拓也さんがあなたの投稿「修学旅行 in 京都」に興味を示しています。最近、「旅行」「写真」が共通の話題として浮上しています。",
    suggestedMembers: [
      { name: "木村 梨花", avatar: "/japanese-woman.png", interests: ["写真", "旅行"] },
      { name: "斎藤 拓也", avatar: "/japanese-man.png", interests: ["ハイキング", "カメラ"] },
      { name: "松本 結衣", avatar: "/japanese-woman.png", interests: ["料理", "旅行"] },
      { name: "田中 太郎", avatar: "/friendly-japanese-man.jpg", interests: ["写真", "ハイキング"] },
    ],
    suggestedDate: "2024年5月5日(日) 14:00",
    suggestedVenue: "新宿のカフェ「Alumni Lounge」",
    commonInterests: ["写真", "旅行", "ハイキング"],
    matchScore: 87,
    status: "pending",
  },
]

export function AIReunionProposal() {
  const [proposals, setProposals] = useState(aiProposals)

  const handleAccept = (id: number) => {
    setProposals(proposals.map((p) => (p.id === id ? { ...p, status: "accepted" as const } : p)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI同窓会提案</h2>
          <p className="text-sm text-muted-foreground">共通の思い出から、最適な再会をご提案します</p>
        </div>
      </div>

      {proposals.map((proposal) => (
        <Card key={proposal.id} className="overflow-hidden border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-balance">{proposal.title}</CardTitle>
                <CardDescription>{proposal.reason}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                マッチ度 {proposal.matchScore}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Suggested Members */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-primary" />
                参加予定メンバー ({proposal.suggestedMembers.length}名)
              </div>
              <div className="grid grid-cols-2 gap-3">
                {proposal.suggestedMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-10 w-10">
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
                {proposal.commonInterests.map((interest, idx) => (
                  <Badge key={idx} variant="outline" className="border-primary/30">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">日時:</span>
                <span>{proposal.suggestedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">場所:</span>
                <span>{proposal.suggestedVenue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">所要時間:</span>
                <span>約2時間</span>
              </div>
            </div>

            {/* Actions */}
            {proposal.status === "pending" ? (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleAccept(proposal.id)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  参加する
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  詳細を見る
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">参加申し込み完了！AIが幹事として調整を進めます</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
