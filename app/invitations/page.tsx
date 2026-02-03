"use client"

import { IOSLayout } from "@/components/ios-navigation"
import { InvitationLetters } from "@/components/invitation-letters"

export default function InvitationsPage() {
  return (
    <IOSLayout breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "招待状" }]}>
      <div className="py-4">
        <h2 className="text-xl font-serif font-light mb-1">招待状</h2>
        <p className="text-foreground/50 text-xs">つなぐからの再会のお誘い</p>
      </div>

      <div className="space-y-4">
        <InvitationLetters />
      </div>
    </IOSLayout>
  )
}
