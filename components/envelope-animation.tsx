"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface EnvelopeAnimationProps {
  onComplete: () => void
  title: string
}

export function EnvelopeAnimation({ onComplete, title }: EnvelopeAnimationProps) {
  const [phase, setPhase] = useState<"initial" | "rise" | "unfold" | "complete">("initial")

  useEffect(() => {
    // Phase 1: Initial pause (envelope with letter peeking)
    const timer1 = setTimeout(() => setPhase("rise"), 300)
    
    // Phase 2: Letter rises out of envelope
    const timer2 = setTimeout(() => setPhase("unfold"), 800)
    
    // Phase 3: Letter unfolds to full size - this is the final state
    const timer3 = setTimeout(() => setPhase("complete"), 1400)
    
    // Phase 4: Animation done, hand off to modal content
    const timer4 = setTimeout(() => onComplete(), 1600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Modal-like backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Container */}
      <div className="relative flex flex-col items-center">
        
        {/* Letter - rises from envelope, unfolds to modal size */}
        <div 
          className={cn(
            "relative rounded-2xl shadow-2xl overflow-hidden transition-all ease-out",
            "bg-[#fffcf8] border border-[#e8e4de]",
            phase === "initial" && "w-72 h-28 duration-300",
            phase === "rise" && "w-72 h-36 -translate-y-12 duration-500",
            phase === "unfold" && "w-[calc(100vw-2rem)] max-w-[420px] h-48 -translate-y-4 duration-500",
            phase === "complete" && "w-[calc(100vw-2rem)] max-w-[420px] h-48 -translate-y-4 duration-200",
          )}
        >
          {/* Letter header content - stays visible throughout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5">
            {/* Sparkles icon */}
            <div 
              className={cn(
                "rounded-full bg-gradient-to-br from-[#e8a87c] to-[#c9a87c] flex items-center justify-center transition-all duration-300",
                (phase === "initial" || phase === "rise") && "w-8 h-8 mb-2",
                (phase === "unfold" || phase === "complete") && "w-9 h-9 mb-3"
              )}
            >
              <Sparkles className={cn(
                "text-white transition-all duration-300",
                (phase === "initial" || phase === "rise") && "h-3.5 w-3.5",
                (phase === "unfold" || phase === "complete") && "h-4 w-4"
              )} />
            </div>

            {/* From label - always visible */}
            <p className="text-[#8a8279] text-[10px] uppercase tracking-[0.15em] mb-0.5">from</p>
            <p className="text-[#c9a87c] text-xs font-medium mb-2">つなぐ</p>

            {/* Divider - fades in */}
            <div 
              className={cn(
                "h-px bg-[#e0d5c8] mb-2 transition-all duration-400",
                (phase === "initial" || phase === "rise") && "w-0 opacity-0",
                (phase === "unfold" || phase === "complete") && "w-12 opacity-100"
              )} 
            />

            {/* Title - fades in */}
            <p 
              className={cn(
                "text-[#2c2825] font-medium text-center leading-relaxed transition-all duration-400",
                (phase === "initial" || phase === "rise") && "text-xs opacity-0 translate-y-2",
                (phase === "unfold" || phase === "complete") && "text-base opacity-100 translate-y-0"
              )}
            >
              {title}
            </p>

            {/* Badge - fades in */}
            <div 
              className={cn(
                "mt-2 px-3 py-1 rounded-full bg-[#e8a87c]/10 text-[#e8a87c] text-[10px] transition-all duration-400 delay-75",
                (phase === "initial" || phase === "rise") && "opacity-0 scale-90",
                (phase === "unfold" || phase === "complete") && "opacity-100 scale-100"
              )}
            >
              再会のお誘い
            </div>
          </div>
        </div>

        {/* Envelope - stays below, fades out as letter rises */}
        <div 
          className={cn(
            "relative w-72 transition-all ease-out",
            phase === "initial" && "-mt-12 opacity-100 duration-300",
            phase === "rise" && "-mt-4 opacity-60 scale-95 duration-500",
            (phase === "unfold" || phase === "complete") && "mt-0 opacity-0 scale-90 duration-400",
          )}
        >
          {/* Envelope body (open state - flap is behind) */}
          <div className="relative h-24">
            {/* Open flap behind */}
            <div 
              className="absolute -top-10 left-0 right-0 h-14"
              style={{ 
                background: "linear-gradient(to bottom, #e8ddd0, #f0e6db)",
                clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
              }}
            />
            
            {/* Envelope back */}
            <div className="absolute inset-0 rounded-b-xl bg-gradient-to-b from-[#f5ebe0] to-[#ebe0d5] shadow-lg" />
            
            {/* Envelope front V */}
            <div 
              className="absolute inset-0 rounded-b-xl overflow-hidden"
              style={{ 
                background: "linear-gradient(to bottom, #f0e6db, #e8ddd0)",
                clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div 
        className={cn(
          "absolute bottom-16 left-0 right-0 text-center transition-all duration-300",
          phase === "initial" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <p className="text-white/70 text-xs tracking-wide">
          再会のお誘いが届きました
        </p>
      </div>
    </div>
  )
}
