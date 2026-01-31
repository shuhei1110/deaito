"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SplashAnimationProps {
  onComplete: () => void
}

export function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const [phase, setPhase] = useState<"initial" | "opening" | "flash" | "fade">("initial")

  useEffect(() => {
    // Phase 1: Initial pause (album appears)
    const timer1 = setTimeout(() => setPhase("opening"), 800)
    
    // Phase 2: Album opens
    const timer2 = setTimeout(() => setPhase("flash"), 2400)
    
    // Phase 3: White flash
    const timer3 = setTimeout(() => setPhase("fade"), 3200)
    
    // Phase 4: Complete
    const timer4 = setTimeout(() => onComplete(), 3800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-[#faf8f5] transition-opacity duration-500",
        phase === "fade" && "opacity-0 pointer-events-none"
      )}
    >
      {/* Ambient background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={cn(
            "absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#e8a87c]/20 blur-3xl transition-all duration-1000",
            phase === "opening" && "scale-150 opacity-60",
            phase === "flash" && "scale-200 opacity-0"
          )} 
        />
        <div 
          className={cn(
            "absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#e8a87c]/15 blur-3xl transition-all duration-1000 delay-200",
            phase === "opening" && "scale-150 opacity-50",
            phase === "flash" && "scale-200 opacity-0"
          )} 
        />
      </div>

      {/* Camera container - handles zoom effect */}
      <div 
        className={cn(
          "relative transition-all ease-out",
          phase === "initial" && "scale-100 duration-500",
          phase === "opening" && "scale-110 duration-1500",
          phase === "flash" && "scale-150 duration-800",
        )}
        style={{
          perspective: "1200px",
          perspectiveOrigin: "center center"
        }}
      >
        {/* Album container */}
        <div 
          className={cn(
            "relative w-64 h-80 transition-transform ease-out",
            phase === "initial" && "duration-500",
            phase === "opening" && "duration-1500",
            phase === "flash" && "duration-500",
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Album back cover (right page when open) */}
          <div 
            className={cn(
              "absolute inset-0 rounded-r-lg shadow-2xl",
              "bg-gradient-to-br from-[#f5f0ea] to-[#e8e4de]",
              "border border-[#e8e4de]"
            )}
          >
            {/* Page texture lines */}
            <div className="absolute inset-4 flex flex-col gap-3 opacity-30">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-px bg-[#2c2825]/20 rounded" />
              ))}
            </div>
            {/* Photo placeholder on right page */}
            <div className={cn(
              "absolute inset-6 rounded-md bg-[#e8a87c]/10 border border-[#e8a87c]/20 transition-opacity duration-500",
              phase === "opening" ? "opacity-100" : "opacity-0"
            )}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#e8a87c]/20" />
              </div>
            </div>
          </div>

          {/* Album spine */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#c9a992] to-[#d4b8a4] rounded-l-lg shadow-inner"
            style={{
              transformOrigin: "left center",
              transform: "translateX(-100%) rotateY(-90deg)",
            }}
          />

          {/* Album front cover (left page - opens) */}
          <div 
            className={cn(
              "absolute inset-0 rounded-lg shadow-2xl origin-left transition-transform ease-out",
              "bg-gradient-to-br from-[#f0ebe5] to-[#e5ded5]",
              "border border-[#e8e4de]",
              phase === "initial" && "duration-500",
              phase === "opening" && "duration-1500",
              phase === "flash" && "duration-500",
            )}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              transform: phase === "initial" 
                ? "rotateY(0deg)" 
                : phase === "opening"
                ? "rotateY(-160deg)"
                : "rotateY(-180deg)",
            }}
          >
            {/* Cover design */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              {/* Decorative frame */}
              <div className="absolute inset-4 border border-[#c9a992]/40 rounded-md" />
              
              {/* Album title */}
              <div className="relative z-10 text-center">
                <p className="text-[#8a8279] text-xs uppercase tracking-[0.3em] mb-2">memories</p>
                <h1 className="text-2xl font-serif font-light italic text-[#2c2825]">deaito</h1>
                <div className="mt-4 w-12 h-px bg-[#c9a992] mx-auto" />
              </div>

              {/* Subtle texture */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,#2c2825_1px,transparent_1px)] bg-[length:20px_20px]" />
            </div>

            {/* Cover shadow when closed */}
            <div 
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10 rounded-lg transition-opacity duration-500",
                phase !== "initial" && "opacity-0"
              )}
            />
          </div>
        </div>
      </div>

      {/* White flash overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-white pointer-events-none transition-opacity",
          phase === "flash" ? "opacity-100 duration-300" : "opacity-0 duration-500"
        )}
      />

      {/* Tagline */}
      <div 
        className={cn(
          "absolute bottom-24 left-0 right-0 text-center transition-all duration-700",
          phase === "initial" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <p className="text-[#8a8279] text-sm tracking-wide">
          終わりのない「つながり」を
        </p>
      </div>
    </div>
  )
}
