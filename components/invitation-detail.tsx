"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, MapPin, Users, Clock, CheckCircle2, ExternalLink, TrendingUp, Heart } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { EnvelopeAnimation } from "@/components/envelope-animation"

const invitationDetails = {
  1: {
    id: 1,
    title: "桜ヶ丘高校 3年A組 同窓会",
    tsunaguMessage: "このアルバムで、あなたを含む仲間たちのつなぐポイントが一定数を超えました。みなさんの「また会いたい」という気持ちが集まっています。",
    pointsReached: 2847,
    membersReady: 4,
    relatedMemory: {
      title: "体育祭のリレー",
      description: "あの日の思い出が、みなさんを今も結びつけています",
      thumbnail: "/graduation-ceremony-group-photo.jpg",
      albumId: "highschool-2017",
      albumName: "桜ヶ丘高校 3年A組",
    },
    venue: {
      name: "RIGOLETTO ROTONDA 渋谷",
      type: "イタリアン・スパニッシュ",
      address: "東京都渋谷区道玄坂2-6-17 渋東シネタワー1F",
      tabelogUrl: "https://tabelog.com/tokyo/A1303/A130301/13120641/",
      budget: "¥4,000〜5,000",
      note: "半個室のソファ席を仮予約しています",
    },
    suggestedDate: "2026年3月15日(土) 18:00",
    duration: "約2〜3時間",
    matchScore: 92,
  },
  2: {
    id: 2,
    title: "写真サークル ミニ同窓会",
    tsunaguMessage: "サークルの仲間たちが、あの頃の写真を見返しているようです。懐かしい記憶が、再会への想いを高めています。",
    pointsReached: 2156,
    membersReady: 3,
    relatedMemory: {
      title: "学園祭の展示",
      description: "みんなで準備した展示、覚えていますか？",
      thumbnail: "/graduation-ceremony-group-photo.jpg",
      albumId: "photo-circle",
      albumName: "写真サークル",
    },
    venue: {
      name: "WIRED CAFE 新宿ルミネ店",
      type: "カフェ・ダイニング",
      address: "東京都新宿区新宿3-38-2 ルミネ2 5F",
      tabelogUrl: "https://tabelog.com/tokyo/A1304/A130401/13004369/",
      budget: "¥1,500〜2,500",
      note: "窓際の広めのテーブルを確保予定",
    },
    suggestedDate: "2026年3月22日(土) 14:00",
    duration: "約2時間",
    matchScore: 87,
  },
}

interface InvitationDetailProps {
  invitationId: number
  onClose: () => void
}

export function InvitationDetail({ invitationId, onClose }: InvitationDetailProps) {
  const [accepted, setAccepted] = useState(false)
  const [showEnvelope, setShowEnvelope] = useState(true)
  const invitation = invitationDetails[invitationId as keyof typeof invitationDetails]

  if (!invitation) return null

  // Show envelope animation first
  if (showEnvelope) {
    return (
      <EnvelopeAnimation 
        title={invitation.title} 
        onComplete={() => setShowEnvelope(false)} 
      />
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[420px] max-h-[85vh] overflow-y-auto rounded-2xl border border-[#e8e4de] p-0 bg-[#fffcf8] shadow-2xl">
        {/* スクリーンリーダー用タイトル（視覚的には非表示） */}
        <DialogTitle className="sr-only">招待状の詳細</DialogTitle>
        
        {/* Letter-style Header - matches animation end state */}
        <div className="relative pt-5 pb-4 text-center border-b border-[#e8e4de] bg-[#fffcf8]">
          {/* Close button */}
          <button 
            type="button" 
            onClick={onClose} 
            className="absolute left-4 top-4 text-[#c9a87c] text-sm font-medium"
          >
            閉じる
          </button>

          {/* Sparkles icon - same as letter */}
          <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-[#e8a87c] to-[#c9a87c] flex items-center justify-center mb-3">
            <Sparkles className="h-4 w-4 text-white" />
          </div>

          {/* From label */}
          <p className="text-[#8a8279] text-[10px] uppercase tracking-[0.15em] mb-0.5">from</p>
          <p className="text-[#c9a87c] text-xs font-medium mb-2">つなぐ</p>

          {/* Divider */}
          <div className="w-12 h-px bg-[#e0d5c8] mx-auto mb-2" />

          {/* Title */}
          <h2 className="text-base font-medium text-[#2c2825] text-balance px-12">{invitation.title}</h2>
          
          {/* Badge */}
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[#e8a87c]/10 text-[#e8a87c] text-[10px]">
            再会のお誘い
          </div>
        </div>

        <div className="px-4 pb-6 space-y-5 bg-[#fffcf8]">

          {/* Tsunagu Message */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-[#faf8f5] to-[#f5ebe0] border border-[#e8e4de]">
            <p className="text-sm leading-relaxed text-[#2c2825]/70">{invitation.tsunaguMessage}</p>
            <div className="flex items-center gap-4 mt-3 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#c9a87c]">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="font-medium">{invitation.pointsReached.toLocaleString()} pts</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#8a8279]">
                <Users className="h-3.5 w-3.5" />
                <span>{invitation.membersReady}人が再会を待っています</span>
              </div>
            </div>
          </div>

          {/* Related Memory */}
          <div className="space-y-2">
            <p className="text-[10px] text-[#8a8279] uppercase tracking-wider px-1">きっかけとなった思い出</p>
            <Link href={`/album/${invitation.relatedMemory.albumId}`}>
              <div className="rounded-xl border border-[#e8e4de] bg-white p-3 flex items-center gap-3 active:scale-[0.98] transition-transform">
                <img
                  src={invitation.relatedMemory.thumbnail || "/placeholder.svg"}
                  alt={invitation.relatedMemory.title}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2c2825] truncate">{invitation.relatedMemory.title}</p>
                  <p className="text-[11px] text-[#8a8279] mt-0.5">{invitation.relatedMemory.albumName}</p>
                  <p className="text-[10px] text-[#a09890] mt-1 line-clamp-1">{invitation.relatedMemory.description}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Anonymous Members Indicator */}
          <div className="space-y-2">
            <p className="text-[10px] text-[#8a8279] uppercase tracking-wider px-1">参加予定</p>
            <div className="rounded-xl border border-[#e8e4de] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(invitation.membersReady, 4))].map((_, idx) => (
                      <div 
                        key={idx} 
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8a87c]/30 to-[#c9a87c]/30 border-2 border-white flex items-center justify-center"
                      >
                        <span className="text-[10px] text-[#c9a87c]">?</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2c2825]">{invitation.membersReady}人</p>
                    <p className="text-[10px] text-[#8a8279]">あなたとの再会を楽しみにしています</p>
                  </div>
                </div>
                <Heart className="h-5 w-5 text-[#e8a87c]/50" />
              </div>
              <p className="text-[10px] text-[#a09890] mt-3 pt-3 border-t border-[#e8e4de]">
                ※ 参加者の詳細は、当日までのお楽しみです
              </p>
            </div>
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <p className="text-[10px] text-[#8a8279] uppercase tracking-wider px-1">つなぐが選んだ会場</p>
            <div className="rounded-xl border border-[#e8e4de] bg-white p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#2c2825]">{invitation.venue.name}</p>
                  <p className="text-[11px] text-[#8a8279] mt-0.5">{invitation.venue.type}</p>
                </div>
                <a 
                  href={invitation.venue.tabelogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[#c9a87c] hover:underline"
                >
                  <span>食べログで見る</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="space-y-2 text-[11px] text-[#6b6560]">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#a09890] mt-0.5 flex-shrink-0" />
                  <span>{invitation.venue.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#a09890]">予算</span>
                  <span>{invitation.venue.budget}</span>
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-[#e8e4de]">
                <p className="text-[10px] text-[#c9a87c] flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  {invitation.venue.note}
                </p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="rounded-xl border border-[#e8e4de] bg-white p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-[#2c2825]">
              <Calendar className="h-4 w-4 text-[#c9a87c]" />
              <span>{invitation.suggestedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#2c2825]">
              <Clock className="h-4 w-4 text-[#c9a87c]" />
              <span>{invitation.duration}</span>
            </div>
          </div>

          {/* Actions */}
          {!accepted ? (
            <div className="space-y-2 pt-2">
              <Button 
                className="w-full h-12 bg-gradient-to-r from-[#e8a87c] to-[#c9a87c] text-white hover:opacity-90 rounded-xl text-sm font-medium shadow-lg" 
                onClick={() => setAccepted(true)}
              >
                参加する
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-12 text-[#8a8279] hover:bg-transparent hover:text-[#2c2825] text-sm" 
                onClick={onClose}
              >
                あとで決める
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-[#d4edda] bg-[#f0fff4] p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-[#28a745]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">参加申し込み完了！</span>
              </div>
              <p className="text-[10px] text-center text-[#8a8279]">
                つなぐが、参加者全員の予定を調整してお知らせします
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
