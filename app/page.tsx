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
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <h1 className="text-3xl font-serif font-light tracking-wide italic">deaito</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-10 text-sm">
              <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors duration-300">
                Home
              </Link>
              <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors duration-300">
                Albums
              </Link>
              <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors duration-300">
                Connections
              </Link>
            </nav>
            <div className="text-[10px] text-foreground/40 uppercase tracking-[0.2em]">Demo</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="mb-20 text-center max-w-xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-light leading-tight mb-6 text-balance italic">
            終わりのない「つながり」を
          </h2>
          <p className="text-foreground/50 leading-relaxed text-sm">
            卒業しても、つながりを保つ。AIエージェントと共に、人間関係の運用保守を円滑にしていく、新しい卒業アルバム。
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
              <TabsList className="w-full justify-start bg-transparent border-b border-border/50 rounded-none h-auto p-0 mb-10">
                <TabsTrigger 
                  value="invitations" 
                  className="relative rounded-none border-b border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-5 py-4 text-xs uppercase tracking-[0.15em] text-foreground/50 data-[state=active]:text-foreground transition-colors"
                >
                  Invitations
                  {newInvitationsCount > 0 && (
                    <Badge className="ml-2 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px]">
                      {newInvitationsCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="albums" 
                  className="rounded-none border-b border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-5 py-4 text-xs uppercase tracking-[0.15em] text-foreground/50 data-[state=active]:text-foreground transition-colors"
                >
                  Albums
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="rounded-none border-b border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-5 py-4 text-xs uppercase tracking-[0.15em] text-foreground/50 data-[state=active]:text-foreground transition-colors"
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
      <footer className="border-t border-border/30 mt-32 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-2xl font-serif font-light italic">deaito</p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em]">
              Endless connections since 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
