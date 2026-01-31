"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Heart, Briefcase } from "lucide-react"

const timelineData = [
  {
    year: "2024年",
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
    year: "2023年",
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
        change: "ハイキング ⭐⭐ → ⭐⭐⭐",
      },
    ],
  },
  {
    year: "2021年",
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
    year: "2017年",
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

const typeColors = {
  profile: "bg-accent text-accent-foreground",
  interest: "bg-primary/10 text-primary",
  education: "bg-secondary text-secondary-foreground",
}

export function TimelineView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-balance mb-2">プロフィールの変遷</h2>
        <p className="text-muted-foreground text-sm">あなたの成長と変化の軌跡を振り返る</p>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-8">
          {timelineData.map((yearGroup, yearIdx) => (
            <div key={yearIdx} className="space-y-4">
              <div className="flex items-center gap-3 relative z-10">
                <Badge variant="outline" className="bg-background px-3 py-1">
                  {yearGroup.year}
                </Badge>
              </div>

              {yearGroup.events.map((event, eventIdx) => {
                const Icon = event.icon
                return (
                  <Card key={eventIdx} className="ml-12 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`p-2 rounded-lg h-fit ${typeColors[event.type as keyof typeof typeColors]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{event.title}</h3>
                            <span className="text-xs text-muted-foreground">{event.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-mono">
                            {event.change}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
