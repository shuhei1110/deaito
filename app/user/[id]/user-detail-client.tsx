"use client"

import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, ArrowUpRight } from "lucide-react"
import Link from "next/link"

type Profile = {
  id: string
  username: string | null
  display_name: string
  avatar_url: string | null
  bio: string | null
}

type SharedAlbum = {
  id: string
  name: string
  category: string
  year: number | null
}

export function UserDetailClient({
  profile,
  sharedAlbums,
  userProfile,
  notificationCount,
}: {
  profile: Profile
  sharedAlbums: SharedAlbum[]
  userProfile: TopBarProfile
  notificationCount: number
}) {
  const initials = profile.display_name.slice(0, 2)

  return (
    <IOSLayout
      breadcrumbs={[
        { label: "ホーム", href: "/" },
        { label: profile.display_name },
      ]}
      userProfile={userProfile}
      notificationCount={notificationCount}
    >
      <div className="py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-24 h-24 border-2 border-foreground/10 mb-4">
            {profile.avatar_url && (
              <AvatarImage
                src={profile.avatar_url}
                alt={profile.display_name}
              />
            )}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-medium mb-1">{profile.display_name}</h2>
          {profile.username && (
            <p className="text-foreground/50 text-sm mb-1">
              @{profile.username}
            </p>
          )}
          {profile.bio && (
            <p className="text-foreground/60 text-sm text-center max-w-xs">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Shared Albums */}
        <div>
          <div className="flex items-center gap-2 px-1 mb-3">
            <BookOpen className="h-4 w-4 text-foreground/40" />
            <h3 className="text-sm font-medium text-foreground/70">
              共有アルバム
            </h3>
            <span className="text-xs text-foreground/40">
              {sharedAlbums.length}件
            </span>
          </div>

          <div className="space-y-2">
            {sharedAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group flex items-center justify-between p-4 ios-card hover:bg-foreground/5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{album.name}</p>
                  {album.year && (
                    <p className="text-[11px] text-foreground/40 mt-0.5">
                      {album.year}年卒業
                    </p>
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 text-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </IOSLayout>
  )
}
