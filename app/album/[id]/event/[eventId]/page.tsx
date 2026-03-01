import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getAlbumById, getUserAlbumRole } from "@/lib/supabase/albums"
import { getEventById, getChildEvents, getMediaByEventId } from "@/lib/supabase/events"
import { getProfile } from "@/lib/supabase/profiles"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { EventDetailClient } from "./event-detail-client"

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>
}) {
  const { id, eventId } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [album, event, userRole] = await Promise.all([
    getAlbumById(id),
    getEventById(eventId),
    getUserAlbumRole(user.id, id),
  ])

  if (!album) notFound()
  if (!event) notFound()

  const [childEvents, media, profile, notificationCount] = await Promise.all([
    getChildEvents(eventId),
    getMediaByEventId(eventId),
    getProfile(user.id),
    getUnreadNotificationCount(user.id),
  ])

  const userProfile = {
    display_name: profile?.display_name ?? "ユーザー",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  return (
    <EventDetailClient
      albumId={id}
      albumName={album.name}
      event={event}
      childEvents={childEvents}
      media={media}
      userRole={userRole}
      currentUserId={user.id}
      userProfile={userProfile}
      notificationCount={notificationCount}
    />
  )
}
