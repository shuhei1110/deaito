"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Sparkles } from "lucide-react"
import { useState } from "react"
import { InvitationDetail } from "@/components/invitation-detail"

const invitations = [
  {
    id: 1,
    title: "都立高校 2017年卒業 同窓会",
    from: "AIエージェント「つなぐくん」",
    date: "2024年3月15日",
    preview: "あなたと佐藤健さん、鈴木美咲さんが「体育祭のリレー」を閲覧しました...",
    matchScore: 92,
    unread: true,
  },
  {
    id: 2,
    title: "東京大学 2021年卒業 ミニ同窓会",
    from: "AIエージェント「つなぐくん」",
    date: "2024年3月12日",
    preview: "木村梨花さん、斎藤拓也さんがあなたの投稿「修学旅行 in 京都」に興味を...",
    matchScore: 87,
    unread: true,
  },
]

export function InvitationLetters() {
  const [selectedInvitation, setSelectedInvitation] = useState<number | null>(null)

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">届いた招待状</h2>
            <p className="text-sm text-muted-foreground">AIがあなたにぴったりの同窓会を見つけました</p>
          </div>
        </div>

        <div className="space-y-3">
          {invitations.map((invitation) => (
            <Card
              key={invitation.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-primary/20 relative overflow-hidden"
              onClick={() => setSelectedInvitation(invitation.id)}
            >
              {/* Envelope Flap Effect */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary/5 to-transparent" />

              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {invitation.unread && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                      <h3 className="font-bold text-lg text-balance">{invitation.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>{invitation.from}</span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{invitation.preview}</p>

                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        マッチ度 {invitation.matchScore}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">{invitation.date}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Invitation Detail Modal */}
      {selectedInvitation && (
        <InvitationDetail invitationId={selectedInvitation} onClose={() => setSelectedInvitation(null)} />
      )}
    </>
  )
}
