"use client"

import { useState, useEffect } from "react"
import { IOSLayout } from "@/components/ios-navigation"
import { InvitationLetters } from "@/components/invitation-letters"
import { SplashAnimation } from "@/components/splash-animation"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    // Check if splash was already shown in this session
    const hasSeenSplash = sessionStorage.getItem("deaito-splash-shown")
    if (hasSeenSplash) {
      setShowSplash(false)
      setContentVisible(true)
    }
  }, [])

  const handleSplashComplete = () => {
    sessionStorage.setItem("deaito-splash-shown", "true")
    setShowSplash(false)
    // Small delay to start content fade in
    setTimeout(() => setContentVisible(true), 100)
  }

  return (
    <>
      {showSplash && <SplashAnimation onComplete={handleSplashComplete} />}
      
      <div className={`transition-opacity duration-700 ${contentVisible ? "opacity-100" : "opacity-0"}`}>
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
      </div>
    </>
  )
}
