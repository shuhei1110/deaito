"use client"

import { IOSLayout } from "@/components/ios-navigation"
import { InvitationLetters } from "@/components/invitation-letters"

export default function Home() {
  return (
    <IOSLayout breadcrumbs={[{ label: "ホーム" }]}>
      {/* Hero Section */}
      <div className="py-8 text-center">
        <h2 className="text-2xl font-serif font-light leading-tight mb-3 text-balance italic">
          終わりのない「つながり」を
        </h2>
        <p className="text-foreground/50 leading-relaxed text-xs max-w-xs mx-auto">
          AIエージェントと共に、人間関係を円滑にしていく新しい卒業アルバム。
        </p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <InvitationLetters />
      </div>
    </IOSLayout>
  )
}
