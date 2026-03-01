"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, CheckCircle2, XCircle, Images } from "lucide-react"
import { useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { EnvelopeAnimation } from "@/components/envelope-animation"
import { respondToInvitationAction } from "@/app/invitations/actions"
import type { InvitationWithDetails } from "@/lib/album-types"

const CATEGORY_LABELS: Record<string, string> = {
  school: "学校",
  club: "部活",
  circle: "サークル",
  friends: "友人",
  seminar: "ゼミ",
  company: "会社",
}

interface InvitationDetailProps {
  invitation: InvitationWithDetails
  onClose: () => void
}

export function InvitationDetail({ invitation, onClose }: InvitationDetailProps) {
  const router = useRouter()
  const [responseState, setResponseState] = useState<"idle" | "accepted" | "declined">("idle")
  const [showEnvelope, setShowEnvelope] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleEnvelopeComplete = useCallback(() => {
    setShowDialog(true)
    setTimeout(() => setShowEnvelope(false), 350)
  }, [])

  const handleRespond = (response: "accepted" | "declined") => {
    setError(null)
    startTransition(async () => {
      const result = await respondToInvitationAction(invitation.id, response)
      if (result.error) {
        setError(result.error)
        return
      }
      setResponseState(response)
      // リスト更新のため少し遅延してリフレッシュ
      setTimeout(() => {
        router.refresh()
      }, 1500)
    })
  }

  return (
    <>
      {/* Envelope animation */}
      {showEnvelope && (
        <EnvelopeAnimation
          title={invitation.album_name}
          senderName={invitation.sender_display_name}
          onComplete={handleEnvelopeComplete}
        />
      )}

      {/* Dialog */}
      {showDialog && (
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[420px] max-h-[85vh] overflow-y-auto border border-[#e8e4de] p-0 bg-[#fffcf8] shadow-2xl backdrop-blur-none">
            <DialogTitle className="sr-only">招待状の詳細</DialogTitle>

            {/* Letter-style Header */}
            <div className="relative pt-5 pb-4 text-center border-b border-[#e8e4de] bg-[#fffcf8]">
              <button
                type="button"
                onClick={onClose}
                className="absolute left-4 top-4 text-[#c9a87c] text-sm font-medium"
              >
                閉じる
              </button>

              <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-[#e8a87c] to-[#c9a87c] flex items-center justify-center mb-3">
                <Sparkles className="h-4 w-4 text-white" />
              </div>

              <p className="text-[#8a8279] text-[10px] uppercase tracking-[0.15em] mb-0.5">from</p>
              <p className="text-[#c9a87c] text-xs font-medium mb-2">
                {invitation.sender_display_name}
              </p>

              <div className="w-12 h-px bg-[#e0d5c8] mx-auto mb-2" />

              <h2 className="text-base font-medium text-[#2c2825] text-balance px-12">
                {invitation.album_name}
              </h2>

              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[#e8a87c]/10 text-[#e8a87c] text-[10px]">
                アルバム招待
              </div>
            </div>

            <div className="px-4 pb-6 space-y-5 bg-[#fffcf8]">
              {/* Sender info */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-[#faf8f5] to-[#f5ebe0] border border-[#e8e4de]">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    {invitation.sender_avatar_url && (
                      <AvatarImage src={invitation.sender_avatar_url} />
                    )}
                    <AvatarFallback className="text-sm bg-[#e8a87c]/20 text-[#c9a87c]">
                      {invitation.sender_display_name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#2c2825]">
                      {invitation.sender_display_name}
                    </p>
                    <p className="text-[10px] text-[#8a8279]">
                      からアルバムへの招待が届いています
                    </p>
                  </div>
                </div>
                {invitation.message && (
                  <p className="text-sm leading-relaxed text-[#2c2825]/70">
                    {invitation.message}
                  </p>
                )}
              </div>

              {/* Album info */}
              <div className="space-y-2">
                <p className="text-[10px] text-[#8a8279] uppercase tracking-wider px-1">
                  アルバム情報
                </p>
                <div className="rounded-xl border border-[#e8e4de] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e8a87c]/20 to-[#c9a87c]/20 flex items-center justify-center">
                      <Images className="h-5 w-5 text-[#c9a87c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2c2825] truncate">
                        {invitation.album_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-[#8a8279]">
                          {CATEGORY_LABELS[invitation.album_category] ?? invitation.album_category}
                        </span>
                        {invitation.album_year && (
                          <span className="text-[10px] text-[#a09890]">
                            {invitation.album_year}年
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              {responseState === "idle" ? (
                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-[#e8a87c] to-[#c9a87c] text-white hover:opacity-90 rounded-xl text-sm font-medium shadow-lg"
                    onClick={() => handleRespond("accepted")}
                    disabled={isPending}
                  >
                    {isPending ? "処理中..." : "参加する"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-12 text-[#8a8279] hover:bg-transparent hover:text-[#2c2825] text-sm"
                    onClick={() => handleRespond("declined")}
                    disabled={isPending}
                  >
                    辞退する
                  </Button>
                </div>
              ) : responseState === "accepted" ? (
                <div className="rounded-xl border border-[#d4edda] bg-[#f0fff4] p-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-[#28a745]">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">アルバムに参加しました！</span>
                  </div>
                  <p className="text-[10px] text-center text-[#8a8279]">
                    アルバムページで写真や動画を楽しみましょう
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#e8e4de] bg-[#faf8f5] p-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-[#8a8279]">
                    <XCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">招待を辞退しました</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
