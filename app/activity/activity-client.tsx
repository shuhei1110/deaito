"use client"

import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { ActivityTimeline } from "@/components/activity-timeline"
import type { HomeActivity } from "@/lib/album-types"

export function ActivityPageClient({
  activities,
  userProfile,
  notificationCount,
}: {
  activities: HomeActivity[]
  userProfile: TopBarProfile
  notificationCount: number
}) {
  return (
    <IOSLayout
      breadcrumbs={[
        { label: "ホーム", href: "/" },
        { label: "アクティビティ" },
      ]}
      userProfile={userProfile}
      notificationCount={notificationCount}
    >
      <div className="py-4">
        <h2 className="text-lg font-medium mb-4">アクティビティ</h2>
        <ActivityTimeline activities={activities} />
      </div>
    </IOSLayout>
  )
}
