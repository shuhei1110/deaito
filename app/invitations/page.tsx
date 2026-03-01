import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { IOSLayout } from "@/components/ios-navigation"
import { getProfile } from "@/lib/supabase/profiles"
import { getUnreadNotificationCount } from "@/lib/supabase/notifications"
import { generateReunionProposals } from "@/lib/supabase/reunion-proposals"
import { AIReunionProposal } from "@/components/ai-reunion-proposal"
import { Sparkles } from "lucide-react"

export default async function InvitationsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [profile, notificationCount, proposals] = await Promise.all([
    getProfile(user.id),
    getUnreadNotificationCount(user.id),
    generateReunionProposals(user.id),
  ])
  const userProfile = {
    display_name: profile?.display_name ?? "ユーザー",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  }

  return (
    <IOSLayout breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "招待状" }]} userProfile={userProfile} notificationCount={notificationCount}>
      <div className="py-4">
        <h2 className="text-xl font-serif font-light mb-1">招待状</h2>
        <p className="text-foreground/50 text-xs">
          つなぐからの再会のお誘い
        </p>
      </div>

      {proposals.length > 0 ? (
        <AIReunionProposal proposals={proposals} />
      ) : (
        <div className="py-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#e8a87c]/20 to-[#c9a87c]/20 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-[#c9a87c]" />
          </div>
          <p className="text-sm text-foreground/50 mb-2">
            まだ招待状は届いていません
          </p>
          <p className="text-xs text-foreground/30 max-w-xs mx-auto leading-relaxed">
            つなぐがあなたにぴったりの再会の機会を見つけると、ここに招待状が届きます
          </p>
        </div>
      )}
    </IOSLayout>
  )
}
