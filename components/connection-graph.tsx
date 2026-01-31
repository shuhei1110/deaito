"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Link2, ArrowUpRight } from "lucide-react"

const connections = [
  {
    school: "東京大学",
    year: "2021年卒業",
    members: [
      { name: "山田 花子", avatar: "/japanese-woman.png", mutualViews: 12 },
      { name: "木村 梨花", avatar: "/japanese-woman.png", mutualViews: 8 },
      { name: "斎藤 拓也", avatar: "/japanese-man.png", mutualViews: 15 },
      { name: "松本 結衣", avatar: "/japanese-woman.png", mutualViews: 6 },
    ],
  },
  {
    school: "都立高校",
    year: "2017年卒業",
    members: [
      { name: "佐藤 健", avatar: "/japanese-man.png", mutualViews: 23 },
      { name: "鈴木 美咲", avatar: "/japanese-woman.png", mutualViews: 19 },
      { name: "高橋 誠", avatar: "/japanese-young-man.jpg", mutualViews: 11 },
      { name: "吉田 優", avatar: "/japanese-teenager.jpg", mutualViews: 14 },
    ],
  },
  {
    school: "青葉中学校",
    year: "2014年卒業",
    members: [
      { name: "前田 航", avatar: "/japanese-boy.jpg", mutualViews: 7 },
      { name: "清水 真理", avatar: "/japanese-girl.jpg", mutualViews: 9 },
      { name: "池田 剛", avatar: "/japanese-teenage-boy.jpg", mutualViews: 5 },
    ],
  },
]

export function ConnectionGraph() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Your network</p>
        <h2 className="text-2xl font-serif">つながりマップ</h2>
      </div>

      <div className="space-y-6">
        {connections.map((group, idx) => (
          <div key={idx} className="border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{group.school}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{group.year}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="rounded-full text-xs font-normal">
                    <Users className="h-3 w-3 mr-1.5" />
                    {group.members.length}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full text-xs font-normal">
                    {group.members.reduce((sum, m) => sum + m.mutualViews, 0)} shared
                  </Badge>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="divide-y divide-border">
              {group.members.map((member, memberIdx) => (
                <div
                  key={memberIdx}
                  className="group p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {member.mutualViews} shared memories
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{Math.round((member.mutualViews / 25) * 100)}%</p>
                      <p className="text-xs text-muted-foreground">connection</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
