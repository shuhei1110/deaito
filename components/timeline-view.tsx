"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Heart, Briefcase } from "lucide-react"

const timelineData = [
  {
    year: "2024",
    events: [
      {
        date: "2024年1月",
        type: "profile",
        icon: Briefcase,
        title: "職業を更新",
        description: "ソフトウェアエンジニアとして活動開始",
        change: "学生 → ソフトウェアエンジニア",
      },
    ],
  },
  {
    year: "2023",
    events: [
      {
        date: "2023年10月",
        type: "interest",
        icon: Heart,
        title: "新しい趣味を追加",
        description: "ジャズ音楽への興味が追加されました",
        change: "+ ジャズ音楽",
      },
      {
        date: "2023年6月",
        type: "interest",
        icon: TrendingUp,
        title: "趣味の変化",
        description: "ハイキングへの興味が増加",
        change: "ハイキング ++ ",
      },
    ],
  },
  {
    year: "2021",
    events: [
      {
        date: "2021年3月",
        type: "education",
        icon: Calendar,
        title: "東京大学 卒業",
        description: "大学生活が終了しました",
        change: "大学生 → 社会人",
      },
    ],
  },
  {
    year: "2017",
    events: [
      {
        date: "2017年3月",
        type: "education",
        icon: Calendar,
        title: "都立高校 卒業",
        description: "高校生活が終了しました",
        change: "高校生 → 大学生",
      },
      {
        date: "2017年1月",
        type: "interest",
        icon: Heart,
        title: "趣味を追加",
        description: "写真撮影を始めました",
        change: "+ 写真",
      },
    ],
  },
]

export function TimelineView() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Your journey</p>
        <h2 className="text-2xl font-serif">プロフィールの変遷</h2>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-10">
          {timelineData.map((yearGroup, yearIdx) => (
            <div key={yearIdx} className="space-y-6">
              {/* Year marker */}
              <div className="flex items-center gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-background" />
                </div>
                <span className="text-sm font-medium">{yearGroup.year}</span>
              </div>

              {/* Events */}
              {yearGroup.events.map((event, eventIdx) => {
                const Icon = event.icon
                return (
                  <div key={eventIdx} className="ml-12 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{event.date}</span>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-xs font-mono font-normal ml-11">
                      {event.change}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
