"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, ArrowUpRight } from "lucide-react"
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
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="pb-8">
          <div className="flex items-start justify-between mb-8">
            <Avatar className="h-24 w-24 border border-border/50">
              <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
              <AvatarFallback className="text-xl font-serif">TT</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-[0.15em] text-foreground/50 hover:text-foreground hover:bg-transparent">
              Edit
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-light">{mockUser.name}</h2>
            <p className="text-[10px] text-foreground/40 uppercase tracking-[0.15em]">
              Member since {mockUser.joinDate}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Basic Info */}
        <div className="py-6 space-y-4">
          <div className="flex items-center gap-3 text-sm text-foreground/70">
            <Briefcase className="h-4 w-4 text-foreground/40" />
            <span>{mockUser.occupation}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/70">
            <MapPin className="h-4 w-4 text-foreground/40" />
            <span>{mockUser.location}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Schools */}
        <div className="py-6">
          <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/40 mb-5">Albums</p>
          <div className="space-y-3">
            {mockUser.schools.map((school) => (
              <div 
                key={school.id} 
                className="group p-4 bg-card/50 border border-border/30 rounded-lg hover:border-border/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{school.name}</p>
                    <p className="text-[11px] text-foreground/40 mt-1">{school.year}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Interests */}
        <div className="py-6">
          <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/40 mb-5">Interests</p>
          <div className="flex flex-wrap gap-2">
            {mockUser.interests.map((interest, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="rounded-full px-3 py-1.5 text-xs font-normal bg-card/50 border border-border/30 text-foreground/70 hover:bg-foreground hover:text-background hover:border-foreground transition-all cursor-pointer"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
