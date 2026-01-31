import { AlbumGrid } from "@/components/album-grid"
import { ConnectionGraph } from "@/components/connection-graph"
import { TimelineView } from "@/components/timeline-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AlbumPage({ params }: { params: { id: string } }) {
  const albumName = params.id === "1" ? "桜ヶ丘高校 3年A組 (2017年卒業)" : "東京大学 工学部 (2021年卒業)"

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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Back Button and Album Title */}
          <div className="space-y-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                ホームに戻る
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-balance">{albumName}</h2>
                <p className="text-sm text-muted-foreground">共有された思い出とつながり</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="album" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="album">アルバム</TabsTrigger>
              <TabsTrigger value="connections">つながり</TabsTrigger>
              <TabsTrigger value="timeline">タイムライン</TabsTrigger>
            </TabsList>

            <TabsContent value="album" className="mt-6">
              <AlbumGrid />
            </TabsContent>

            <TabsContent value="connections" className="mt-6">
              <ConnectionGraph />
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <TimelineView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
