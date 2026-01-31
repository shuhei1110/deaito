"use client"

import { IOSLayout } from "@/components/ios-navigation"
import { MyAlbums } from "@/components/my-albums"

export default function AlbumsPage() {
  return (
    <IOSLayout breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "アルバム" }]}>
      <div className="py-4">
        <h2 className="text-xl font-serif font-light mb-1 italic">アルバム</h2>
        <p className="text-foreground/50 text-xs">思い出を振り返る</p>
      </div>

      <div className="space-y-4">
        <MyAlbums />
      </div>
    </IOSLayout>
  )
}
