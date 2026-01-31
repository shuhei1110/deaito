"use client"

import { UserProfile } from "@/components/user-profile"
import { InvitationLetters } from "@/components/invitation-letters"
import { MyAlbums } from "@/components/my-albums"
import { ActivityTimeline } from "@/components/activity-timeline"
import Link from "next/link"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [newInvitationsCount] = useState(2)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <h1 className="text-3xl font-serif tracking-tight">deaito</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Albums
              </Link>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Connections
              </Link>
            </nav>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Demo</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Reconnect with your past</p>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight mb-4 text-balance">
            思い出をつなぐ、新しい出会い
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            AIがあなたにぴったりの同窓会を提案します。写真や動画を共有し、同じ思い出に興味を持った同級生と再会しましょう。
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - User Profile */}
          <div className="lg:col-span-4">
            <UserProfile />
          </div>

          {/* Main Content - Tabs for different sections */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="invitations" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-8">
                <TabsTrigger 
                  value="invitations" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-3 text-sm font-medium"
                >
                  Invitations
                  {newInvitationsCount > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-foreground text-background text-xs">
                      {newInvitationsCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="albums" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-3 text-sm font-medium"
                >
                  Albums
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-3 text-sm font-medium"
                >
                  Timeline
                </TabsTrigger>
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

      {/* Footer */}
      <footer className="border-t border-border mt-24 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-2xl font-serif">deaito</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Reconnecting memories since 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
