"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Link2 } from "lucide-react"

const connections = [
  {
    school: "東京大学 (2021年卒業)",
    members: [
      { name: "山田 花子", avatar: "/japanese-woman.png", mutualViews: 12 },
      { name: "木村 梨花", avatar: "/japanese-woman.png", mutualViews: 8 },
      { name: "斎藤 拓也", avatar: "/japanese-man.png", mutualViews: 15 },
      { name: "松本 結衣", avatar: "/japanese-woman.png", mutualViews: 6 },
    ],
  },
  {
    school: "都立高校 (2017年卒業)",
    members: [
      { name: "佐藤 健", avatar: "/japanese-man.png", mutualViews: 23 },
      { name: "鈴木 美咲", avatar: "/japanese-woman.png", mutualViews: 19 },
      { name: "高橋 誠", avatar: "/japanese-young-man.jpg", mutualViews: 11 },
      { name: "吉田 優", avatar: "/japanese-teenager.jpg", mutualViews: 14 },
    ],
  },
  {
    school: "青葉中学校 (2014年卒業)",
    members: [
      { name: "前田 航", avatar: "/japanese-boy.jpg", mutualViews: 7 },
      { name: "清水 真理", avatar: "/japanese-girl.jpg", mutualViews: 9 },
      { name: "池田 剛", avatar: "/japanese-teenage-boy.jpg", mutualViews: 5 },
    ],
  },
]

export function ConnectionGraph() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-balance mb-2">つながりマップ</h2>
        <p className="text-muted-foreground text-sm">同じ写真や動画を見たクラスメイトとのつながりを可視化</p>
      </div>

      {connections.map((group, idx) => (
        <Card key={idx}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{group.school}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3" />
                  {group.members.length}人のつながり
                </CardDescription>
              </div>
              <Badge variant="secondary">{group.members.reduce((sum, m) => sum + m.mutualViews, 0)} 共通閲覧</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.members.map((member, memberIdx) => (
                <div
                  key={memberIdx}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {member.mutualViews}個の共通の思い出
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">
                      {Math.round((member.mutualViews / 25) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">つながり度</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
