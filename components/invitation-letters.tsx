"use client"

import { Badge } from "@/components/ui/badge"
import { Sparkles, ChevronRight } from "lucide-react"
import { useState } from "react"
import { InvitationDetail } from "@/components/invitation-detail"

const invitations = [
  {
    id: 1,
    title: "桜ヶ丘高校 3年A組 同窓会",
    from: "つなぐ",
    date: "2026年2月4日",
    preview: "このアルバムのつなぐポイントが2,847ptを超えました。4人の仲間があなたとの再会を楽しみにしています。",
    matchScore: 92,
    unread: true,
  },
  {
    id: 2,
    title: "写真サークル ミニ同窓会",
    from: "つなぐ",
    date: "2026年2月2日",
    preview: "サークルの仲間たちが、あの頃の思い出を振り返っているようです。再会の準備が整いました。",
    matchScore: 87,
    unread: true,
  },
]

export function InvitationLetters() {
  const [selectedInvitation, setSelectedInvitation] = useState<number | null>(null)

  return (
    <>
      <div className="space-y-4">
        {invitations.map((invitation, index) => (
          <button
            type="button"
            key={invitation.id}
            className="ios-card w-full p-4 text-left active:scale-[0.98] transition-transform duration-150"
            onClick={() => setSelectedInvitation(invitation.id)}
          >
            <div className="flex items-center gap-3">
              {/* Unread indicator */}
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0">
                {invitation.unread && (
                  <div className="w-full h-full rounded-full bg-accent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium truncate">{invitation.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-foreground/40 mb-2">
                  <Sparkles className="h-3 w-3" style={{ color: "#c9a87c" }} />
                  <span>{invitation.from}</span>
                </div>
                <p className="text-xs text-foreground/50 line-clamp-2 leading-relaxed">
                  {invitation.preview}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge 
                    variant="secondary" 
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-normal bg-accent/10 text-accent border-0"
                  >
                    Match {invitation.matchScore}%
                  </Badge>
                  <span className="text-[10px] text-foreground/30">{invitation.date}</span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-4 w-4 text-foreground/20 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Invitation Detail Modal */}
      {selectedInvitation && (
        <InvitationDetail invitationId={selectedInvitation} onClose={() => setSelectedInvitation(null)} />
      )}
    </>
  )
}
