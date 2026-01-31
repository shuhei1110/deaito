import { AlbumGrid } from "@/components/album-grid"
import { ConnectionGraph } from "@/components/connection-graph"
import { TimelineView } from "@/components/timeline-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const albumName = id === "1" ? "桜ヶ丘高校 3年A組" : "東京大学 工学部"
  const albumYear = id === "1" ? "2017" : "2021"

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

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="space-y-8">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          {/* Album Header */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Album</p>
            <h2 className="text-4xl font-serif">{albumName}</h2>
            <p className="text-muted-foreground">{albumYear}年卒業</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="album" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-8">
              <TabsTrigger 
                value="album" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-3 text-sm font-medium"
              >
                Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="connections" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-3 text-sm font-medium"
              >
                Connections
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-3 text-sm font-medium"
              >
                Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="album" className="mt-0">
              <AlbumGrid />
            </TabsContent>

            <TabsContent value="connections" className="mt-0">
              <ConnectionGraph />
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <TimelineView />
            </TabsContent>
          </Tabs>
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
