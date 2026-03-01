"use client"

import { useState, useTransition } from "react"
import { IOSLayout, type TopBarProfile } from "@/components/ios-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, Mail, ChevronDown, BookOpen, Images, Upload, Sparkles } from "lucide-react"
import { submitInquiryAction } from "./actions"

interface HelpClientProps {
  userProfile: TopBarProfile
  notificationCount: number
}

const FAQ_SECTIONS = [
  {
    title: "アカウント",
    icon: BookOpen,
    items: [
      {
        q: "パスワードを忘れた場合はどうすればいいですか？",
        a: "ログイン画面の「パスワードをお忘れですか？」リンクからパスワードリセットメールを送信できます。メールに記載されたリンクから新しいパスワードを設定してください。",
      },
      {
        q: "プロフィール情報を変更するにはどうすればいいですか？",
        a: "設定ページ（プロフィールメニュー → 設定）からユーザー名、表示名、自己紹介を変更できます。",
      },
      {
        q: "アカウントを削除できますか？",
        a: "設定ページの一番下にある「アカウント削除」セクションから削除できます。削除すると、すべてのデータが完全に消去され、元に戻すことはできません。",
      },
    ],
  },
  {
    title: "アルバム",
    icon: Images,
    items: [
      {
        q: "アルバムに参加するにはどうすればいいですか？",
        a: "アルバム一覧ページで「アルバムに参加」ボタンを押し、招待コードを入力してください。招待コードがない場合は、参加リクエストを送信できます。",
      },
      {
        q: "招待コードはどこで確認できますか？",
        a: "アルバムオーナーの場合、アルバム詳細ページのメンバータブで招待コードを確認・コピーできます。コードの再生成も可能です。",
      },
      {
        q: "アルバムを削除するとどうなりますか？",
        a: "アルバムを削除すると、そのアルバムに関連するすべてのデータ（イベント、写真、動画、メンバー情報）が完全に削除されます。この操作は元に戻せません。",
      },
    ],
  },
  {
    title: "メディア",
    icon: Upload,
    items: [
      {
        q: "アップロードできるファイル形式は何ですか？",
        a: "画像: JPEG, PNG, WebP, HEIC, HEIF。動画: MP4, QuickTime (MOV), WebM。",
      },
      {
        q: "アップロードの容量制限はありますか？",
        a: "1ユーザーあたり合計256MBまでアップロードできます。画像は1ファイル最大20MB、動画は1ファイル最大200MBです。プロフィールの設定画面で現在の使用量を確認できます。",
      },
      {
        q: "アップロードした写真を削除できますか？",
        a: "メディアビューワーで写真を開き、削除ボタンを押すと削除できます。アップロード者本人またはアルバムオーナーが削除可能です。削除すると容量が解放されます。",
      },
    ],
  },
  {
    title: "つなぐポイント",
    icon: Sparkles,
    items: [
      {
        q: "つなぐポイントとは何ですか？",
        a: "アルバムのメンバーがどれだけ活発につながっているかを示す指標です。閲覧数、いいね数、アップロード数、コメント数などのアクティビティから計算されます。",
      },
      {
        q: "ポイントはどのように計算されますか？",
        a: "ユニークユーザー数の平方根、累計アクティビティの対数、直近のモメンタム（勢い）を掛け合わせて算出しています。多くの人が継続的に参加するほどポイントが上がります。",
      },
    ],
  },
] as const

const CATEGORIES = [
  { value: "account", label: "アカウント" },
  { value: "album", label: "アルバム" },
  { value: "media", label: "メディア" },
  { value: "other", label: "その他" },
] as const

export function HelpClient({ userProfile, notificationCount }: HelpClientProps) {
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setMessage(null)
    startTransition(async () => {
      const result = await submitInquiryAction({ category: category ?? "", subject, body })
      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "お問い合わせを送信しました。" })
        setCategory(undefined)
        setSubject("")
        setBody("")
      }
    })
  }

  return (
    <IOSLayout
      title="ヘルプ"
      breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "ヘルプ" }]}
      notificationCount={notificationCount}
      userProfile={userProfile}
    >
      <div className="ios-bg-gradient min-h-screen pb-28">
        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
          {/* ページタイトル */}
          <div className="text-center space-y-1 py-2">
            <h1 className="text-xl font-serif font-light">ヘルプ</h1>
            <p className="text-xs text-foreground/60">
              よくある質問とお問い合わせ
            </p>
          </div>

          {/* FAQ セクション */}
          <section className="ios-card-solid p-5 space-y-4">
            <div className="flex items-center gap-2 text-foreground/70 mb-1">
              <HelpCircle className="w-4 h-4" />
              <h2 className="text-sm font-medium">よくある質問</h2>
            </div>

            <div className="space-y-5">
              {FAQ_SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-accent" />
                      <h3 className="text-xs font-medium text-foreground/60">
                        {section.title}
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <details key={item.q} className="group">
                          <summary className="cursor-pointer flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-foreground/5 transition-colors">
                            <span className="text-sm">{item.q}</span>
                            <ChevronDown className="w-4 h-4 shrink-0 text-foreground/40 group-open:rotate-180 transition-transform" />
                          </summary>
                          <p className="text-sm text-foreground/70 px-2.5 pb-2.5 leading-relaxed">
                            {item.a}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* お問い合わせフォーム */}
          <section className="ios-card-solid p-5 space-y-4">
            <div className="flex items-center gap-2 text-foreground/70 mb-1">
              <Mail className="w-4 h-4" />
              <h2 className="text-sm font-medium">お問い合わせ</h2>
            </div>

            <p className="text-xs text-foreground/50">
              上記のFAQで解決しない場合は、以下のフォームからお問い合わせください。
            </p>

            <div className="space-y-3">
              {/* カテゴリ */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  カテゴリ
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="ios-card border-0 text-sm">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 件名 */}
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs">
                  件名
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="お問い合わせの件名"
                  maxLength={100}
                />
              </div>

              {/* 本文 */}
              <div className="space-y-1.5">
                <Label htmlFor="body" className="text-xs">
                  本文
                </Label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="お問い合わせ内容を詳しくお書きください"
                  maxLength={2000}
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
                <p className="text-[10px] text-foreground/40 text-right">
                  {body.length} / 2000
                </p>
              </div>
            </div>

            {/* メッセージ */}
            {message && (
              <div
                className={`text-xs rounded-md border px-3 py-2 ${
                  message.type === "error"
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isPending || !category || !subject.trim() || !body.trim()}
              className="w-full"
            >
              {isPending ? "送信中..." : "送信する"}
            </Button>
          </section>
        </div>
      </div>
    </IOSLayout>
  )
}
