"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import type { ReunionProposal } from "@/lib/supabase/reunion-proposals"

interface AIReunionProposalProps {
  proposals: ReunionProposal[]
}

export function AIReunionProposal({ proposals: initialProposals }: AIReunionProposalProps) {
  const [proposals, setProposals] = useState(initialProposals)
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set())

  const handleAccept = (id: string) => {
    setAcceptedIds((prev) => new Set(prev).add(id))
  }

  if (proposals.length === 0) return null

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
        <div key={proposal.id} className="ios-card-solid overflow-hidden border-2 border-primary/20 rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 space-y-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="font-semibold text-balance">{proposal.title}</h3>
                <p className="text-sm text-muted-foreground">{proposal.reason}</p>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shrink-0 ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                マッチ度 {proposal.matchScore}%
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Members */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-primary" />
                メンバー ({proposal.members.length}名)
              </div>
              <div className="grid grid-cols-2 gap-3">
                {proposal.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatarUrl ?? undefined} />
                      <AvatarFallback>{member.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{member.displayName}</div>
                      {member.activityLabels.length > 0 && (
                        <div className="text-xs text-muted-foreground truncate">
                          {member.activityLabels.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Activities */}
            {proposal.commonActivities.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold">共通のアクティビティ</div>
                <div className="flex flex-wrap gap-2">
                  {proposal.commonActivities.map((activity, idx) => (
                    <Badge key={idx} variant="outline" className="border-primary/30">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {!acceptedIds.has(proposal.id) ? (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleAccept(proposal.id)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  再会を希望する
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">参加申し込み完了！AIが幹事として調整を進めます</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
