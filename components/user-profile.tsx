"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Heart, Briefcase, Calendar, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

const mockUser = {
  name: "田中 太郎",
  avatar: "/friendly-japanese-man.jpg",
  schools: [
    { id: "1", name: "桜ヶ丘高校 3年A組", year: "2017年卒業", type: "high" },
    { id: "2", name: "東京大学 工学部", year: "2021年卒業", type: "university" },
  ],
  interests: ["写真", "ハイキング", "料理", "ジャズ音楽"],
  location: "東京都",
  occupation: "ソフトウェアエンジニア",
  joinDate: "2024年1月",
}

export function UserProfile() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-card">
              <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
              <AvatarFallback>TT</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{mockUser.name}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {mockUser.joinDate}参加
              </p>
            </div>
          </div>
          <Button size="icon" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{mockUser.occupation}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{mockUser.location}</span>
          </div>
        </div>

        {/* Schools */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">所属アルバム</h3>
          <div className="space-y-2">
            {mockUser.schools.map((school) => (
              <div key={school.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm">{school.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{school.year}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm text-muted-foreground">趣味・興味</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockUser.interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary/20">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
