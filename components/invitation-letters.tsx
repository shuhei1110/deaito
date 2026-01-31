"use client"

import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowUpRight } from "lucide-react"
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">New for you</p>
            <h2 className="text-2xl font-serif">届いた招待状</h2>
          </div>
          <Sparkles className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="group p-6 bg-card border border-border rounded-lg cursor-pointer hover:border-foreground/20 transition-all duration-300"
              onClick={() => setSelectedInvitation(invitation.id)}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    {invitation.unread && (
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    )}
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg">{invitation.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        {invitation.from}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                    {invitation.preview}
                  </p>

                  <div className="flex items-center gap-4 pl-5">
                    <Badge 
                      variant="secondary" 
                      className="rounded-full px-3 py-1 text-xs font-normal bg-secondary"
                    >
                      Match {invitation.matchScore}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{invitation.date}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
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
