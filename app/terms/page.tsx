export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl ios-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-serif font-light">利用規約</h1>
          <p className="text-xs text-foreground/60">deaito サービス利用規約</p>
        </div>

        <div className="space-y-6 text-sm text-foreground/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">第1条（適用）</h2>
            <p>
              本規約は、deaito（以下「本サービス」）の利用に関する条件を定めるものです。
              ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">第2条（サービスの内容）</h2>
            <p>
              本サービスは、ユーザー間で写真・動画を共有し、思い出を記録・共有するためのアルバムサービスです。
              サービスの内容は、運営者の判断により予告なく変更・追加・中止される場合があります。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">第3条（禁止行為）</h2>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>他のユーザーまたは第三者の肖像権、プライバシー、著作権その他の権利を侵害する行為</li>
              <li>本人の同意なく他者の写真・動画をアップロードする行為</li>
              <li>わいせつ、暴力的、差別的、その他不適切なコンテンツを投稿する行為</li>
              <li>不正アクセス、サーバーへの過度な負荷をかける行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">第4条（肖像権・プライバシーについて）</h2>
            <p>
              本サービスでは、ユーザーが写真・動画をアップロード・共有します。
              ユーザーは、アップロードするコンテンツに写っている全ての人物から、
              適切な同意を得ていることを確認する責任を負います。
            </p>
            <p>
              運営者は、ユーザー間の肖像権に関するトラブルについて一切の責任を負いません。
              肖像権侵害の申告があった場合、運営者は該当コンテンツの削除等の措置を取ることがあります。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">第5条（個人情報の取扱い）</h2>
            <p>運営者は、以下の情報を取得・利用します。</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>メールアドレス（アカウント認証・連絡用）</li>
              <li>表示名・ユーザー名（サービス内での表示用）</li>
              <li>アップロードされた写真・動画（サービス提供のため）</li>
              <li>利用ログ（サービス改善・不正利用防止のため）</li>
            </ul>
            <p>
              運営者は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">第6条（免責事項）</h2>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>運営者は、本サービスの完全性、正確性、確実性、有用性等について保証しません。</li>
              <li>運営者は、ユーザー間のトラブル（肖像権侵害、プライバシー侵害等を含む）について一切の責任を負いません。</li>
              <li>運営者は、やむを得ない事由により、予告なく本サービスを中断・終了する場合があります。</li>
              <li>本サービスの中断・終了によりユーザーに生じた損害について、運営者は責任を負いません。</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">第7条（コンテンツの管理）</h2>
            <p>
              運営者は、以下の場合にユーザーのコンテンツを削除し、またはアカウントを停止・削除する権利を有します。
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>本規約に違反した場合</li>
              <li>法令に違反するコンテンツが投稿された場合</li>
              <li>権利侵害の申告があり、運営者が相当と判断した場合</li>
              <li>その他、運営者がサービスの健全な運営のために必要と判断した場合</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">第8条（法的措置）</h2>
            <p>
              ユーザーが本規約に違反し、運営者または第三者に損害を与えた場合、
              運営者は法的手段を講じることがあります。
              本規約に関する紛争については、日本法を準拠法とし、
              運営者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-medium text-foreground">第9条（規約の変更）</h2>
            <p>
              運営者は、必要に応じて本規約を変更することがあります。
              変更後の利用規約は、本サービス上に掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <div className="pt-2 text-xs text-foreground/40 text-right">
            制定日: 2026年3月1日
          </div>
        </div>

        <p className="text-center pt-2 text-[10px] text-foreground/40">
          このタブを閉じて登録画面にお戻りください
        </p>
      </div>
    </main>
  )
}
