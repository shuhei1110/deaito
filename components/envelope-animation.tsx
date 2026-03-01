"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { Sparkles } from "lucide-react"

interface EnvelopeAnimationProps {
  onComplete: () => void
  title: string
  senderName?: string
}

export function EnvelopeAnimation({ onComplete, title, senderName }: EnvelopeAnimationProps) {
  const callbackRef = useRef(onComplete)
  callbackRef.current = onComplete
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Start fading out just before handing off to the dialog
    const fadeTimer = setTimeout(() => setFading(true), 2500)
    // Hand off to dialog after fade has progressed
    const completeTimer = setTimeout(() => callbackRef.current(), 2800)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [])

  // Stable random particles for the opening sparkle effect
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x: (i % 2 === 0 ? 1 : -1) * (12 + Math.random() * 40),
        y: -18 - Math.random() * 45,
        delay: 1.0 + i * 0.07,
        size: 2 + Math.random() * 2.5,
        opacity: 0.35 + Math.random() * 0.35,
      })),
    [],
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.35s ease-out",
      }}
    >
      {/* ── Keyframes ── */}
      <style>{KEYFRAMES}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: "ea-backdrop 0.5s ease-out both" }}
      />

      {/* ── Stage ── */}
      <div className="relative flex flex-col items-center">
        {/* ── Letter ──
             Single keyframe drives the full lifecycle:
             appear → hold (while flap opens) → rise → expand to modal */}
        <div
          className="ea-letter relative overflow-hidden bg-[#fffcf8] border border-[#e8e4de] z-20"
          style={{ animation: "ea-letter 2.6s cubic-bezier(0.4, 0, 0.15, 1) both" }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5">
            {/* Sparkle icon */}
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8a87c] to-[#c9a87c] flex items-center justify-center mb-3"
              style={{ animation: "ea-fade-up 0.35s ease-out 0.35s both" }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>

            {/* From */}
            <p
              className="text-[#8a8279] text-[10px] uppercase tracking-[0.15em] mb-0.5"
              style={{ animation: "ea-fade-up 0.3s ease-out 0.45s both" }}
            >
              from
            </p>
            <p
              className="text-[#c9a87c] text-xs font-medium mb-2"
              style={{ animation: "ea-fade-up 0.3s ease-out 0.5s both" }}
            >
              {senderName ?? "つなぐ"}
            </p>

            {/* Divider – reveals during expand phase */}
            <div
              className="h-px bg-[#e0d5c8] mb-2"
              style={{ width: 0, animation: "ea-divider 0.5s ease-out 1.7s both" }}
            />

            {/* Title */}
            <p
              className="text-[#2c2825] font-medium text-center leading-relaxed text-base"
              style={{ opacity: 0, animation: "ea-fade-up 0.45s ease-out 1.85s both" }}
            >
              {title}
            </p>

            {/* Badge */}
            <div
              className="mt-2 px-3 py-1 rounded-full bg-[#e8a87c]/10 text-[#e8a87c] text-[10px]"
              style={{ opacity: 0, animation: "ea-scale-in 0.4s ease-out 2.05s both" }}
            >
              アルバム招待
            </div>
          </div>
        </div>

        {/* ── Envelope ── */}
        <div
          className="relative w-[272px] -mt-10 z-10"
          style={{ animation: "ea-envelope 2.6s cubic-bezier(0.4, 0, 0.15, 1) both" }}
        >
          <div className="relative h-24" style={{ perspective: "600px" }}>
            {/* Flap – 3D rotation */}
            <div
              className="ea-flap"
              style={{ animation: "ea-flap 0.55s cubic-bezier(0.5, 0, 0.3, 1) 0.6s both" }}
            >
              <div className="ea-flap-face" />
            </div>

            {/* Envelope back */}
            <div className="absolute inset-0 rounded-b-xl bg-gradient-to-b from-[#f5ebe0] to-[#ebe0d5] shadow-lg" />

            {/* Envelope front V */}
            <div
              className="absolute inset-0 rounded-b-xl overflow-hidden z-10"
              style={{
                background: "linear-gradient(to bottom, #f0e6db, #e8ddd0)",
                clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)",
              }}
            />

            {/* Wax seal */}
            <div
              className="absolute z-20 w-5 h-5 rounded-full bg-gradient-to-br from-[#e8a87c] to-[#d4856a] shadow-sm"
              style={{ top: "22%", left: "50%", transform: "translateX(-50%)" }}
            />
          </div>
        </div>

        {/* ── Particles ── */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={
              {
                "--ea-px": `${p.x}px`,
                "--ea-py": `${p.y}px`,
                width: p.size,
                height: p.size,
                background: `rgba(232, 168, 124, ${p.opacity})`,
                top: "42%",
                left: "50%",
                opacity: 0,
                animation: `ea-particle 1s ease-out ${p.delay}s both`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Tagline */}
      <p
        className="absolute bottom-16 left-0 right-0 text-center text-white/70 text-xs tracking-wide"
        style={{ animation: "ea-tagline 2s ease-in-out 0.15s both" }}
      >
        招待状が届きました
      </p>
    </div>
  )
}

/* ────────────────────────────────────────────
   All keyframes kept in a single template
   string for colocation & readability.
   ──────────────────────────────────────────── */
const KEYFRAMES = `
  /* ── layout helpers ── */
  .ea-letter {
    will-change: width, height, transform, border-radius, box-shadow;
  }
  .ea-flap {
    position: absolute;
    top: -4px;
    left: 0;
    right: 0;
    height: 52px;
    transform-origin: top center;
    z-index: 30;
  }
  .ea-flap-face {
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #ebe0d5, #f0e6db);
    clip-path: polygon(0 0, 50% 100%, 100% 0);
    backface-visibility: hidden;
  }

  /* ── backdrop ── */
  @keyframes ea-backdrop {
    from { opacity: 0 }
    to   { opacity: 1 }
  }

  /* ── letter lifecycle ──
     One continuous keyframe drives the entire card:
     appear ➜ hold (flap opening) ➜ rise out ➜ expand to modal size
  */
  @keyframes ea-letter {
    0% {
      opacity: 0;
      width: 272px;
      height: 96px;
      border-radius: 8px;
      transform: translateY(20px) scale(0.92);
      box-shadow: 0 4px 16px -4px rgba(0,0,0,0.08);
    }
    /* entrance complete */
    12% {
      opacity: 1;
      width: 272px;
      height: 96px;
      border-radius: 8px;
      transform: translateY(0) scale(1);
      box-shadow: 0 4px 16px -4px rgba(0,0,0,0.08);
    }
    /* hold – waiting for flap to open */
    30% {
      opacity: 1;
      width: 272px;
      height: 96px;
      border-radius: 8px;
      transform: translateY(0) scale(1);
      box-shadow: 0 4px 16px -4px rgba(0,0,0,0.08);
    }
    /* risen out of envelope */
    52% {
      opacity: 1;
      width: 272px;
      height: 104px;
      border-radius: 10px;
      transform: translateY(-108px);
      box-shadow: 0 8px 28px -6px rgba(0,0,0,0.12);
    }
    /* expanded to modal size */
    80% {
      opacity: 1;
      width: min(calc(100vw - 2rem), 420px);
      height: 200px;
      border-radius: 16px;
      transform: translateY(-8px);
      box-shadow: 0 16px 48px -12px rgba(0,0,0,0.16);
    }
    /* settle & hold */
    100% {
      opacity: 1;
      width: min(calc(100vw - 2rem), 420px);
      height: 200px;
      border-radius: 16px;
      transform: translateY(-8px);
      box-shadow: 0 16px 48px -12px rgba(0,0,0,0.16);
    }
  }

  /* ── envelope lifecycle ── */
  @keyframes ea-envelope {
    0%   { opacity: 0; transform: translateY(20px) scale(0.92) }
    12%  { opacity: 1; transform: translateY(0) scale(1) }
    42%  { opacity: 1; transform: translateY(0) scale(1) }
    60%  { opacity: 0; transform: translateY(24px) scale(0.86) }
    100% { opacity: 0; transform: translateY(24px) scale(0.86) }
  }

  /* ── flap – 3D open ── */
  @keyframes ea-flap {
    0%   { transform: rotateX(0deg) }
    100% { transform: rotateX(-180deg) }
  }

  /* ── content reveals ── */
  @keyframes ea-fade-up {
    from { opacity: 0; transform: translateY(6px) }
    to   { opacity: 1; transform: translateY(0) }
  }

  @keyframes ea-divider {
    from { width: 0;    opacity: 0 }
    to   { width: 48px; opacity: 1 }
  }

  @keyframes ea-scale-in {
    from { opacity: 0; transform: scale(0.85) }
    to   { opacity: 1; transform: scale(1) }
  }

  /* ── particles ── */
  @keyframes ea-particle {
    0%   { opacity: 0; transform: translate(0, 0) scale(0) }
    20%  { opacity: 0.7 }
    100% { opacity: 0; transform: translate(var(--ea-px), var(--ea-py)) scale(0.3) }
  }

  /* ── tagline ── */
  @keyframes ea-tagline {
    0%   { opacity: 0; transform: translateY(6px) }
    10%  { opacity: 1; transform: translateY(0) }
    45%  { opacity: 1; transform: translateY(0) }
    70%  { opacity: 0; transform: translateY(6px) }
    100% { opacity: 0; transform: translateY(6px) }
  }
`
