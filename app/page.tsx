"use client"

import { UserProfile } from "@/components/user-profile"
import { InvitationLetters } from "@/components/invitation-letters"
import { MyAlbums } from "@/components/my-albums"
import { ActivityTimeline } from "@/components/activity-timeline"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [newInvitationsCount] = useState(2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">卒業アルバム/Reunion</h1>
                <p className="text-sm text-muted-foreground">思い出をつなぐ、新しい出会い</p>
              </div>
            </Link>
            <div className="text-sm text-muted-foreground">デモモード</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - User Profile */}
          <div className="lg:col-span-1">
            <UserProfile />
          </div>

          {/* Main Content - Tabs for different sections */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="invitations" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="invitations" className="relative">
                  招待状
                  {newInvitationsCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                      {newInvitationsCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="albums">マイアルバム</TabsTrigger>
                <TabsTrigger value="timeline">タイムライン</TabsTrigger>
              </TabsList>

              <TabsContent value="invitations" className="mt-0">
                <InvitationLetters />
              </TabsContent>

              <TabsContent value="albums" className="mt-0">
                <MyAlbums />
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <ActivityTimeline />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
