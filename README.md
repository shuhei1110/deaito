# deaito

「卒業しても、終わりのないつながりを保つ」ための Web サービスです。  
卒業アルバムを“眺めるだけの記録”ではなく、“再会のきっかけを生み続ける関係インフラ”に変えることを目的にしています。

## このサービスのビジョン

deaito の軸は、**記憶を保存することではなく、記憶を起点に関係を再起動し続けること**です。

- アルバムや写真は「思い出の保管庫」ではなく「会話と再会のトリガー」
- 関係性（つながり）を可視化し、再会準備を日常的に進められる状態をつくる
- 卒業直後だけでなく、数年後にも自然に集まれる接点を維持する

## 全体像（ページベース）

以下は、`app` 配下の全ページを確認したうえでの現状構成です。

| ルート | 役割 | 提供価値 |
|---|---|---|
| `/` | ホーム | サービス世界観、活動サマリー、最近の動きを俯瞰する入口 |
| `/albums` | アルバム一覧・検索・新規作成導線 | 「どのコミュニティに戻るか」を選ぶ本棚体験 |
| `/album/[id]` | アルバム詳細 | イベント/ギャラリー/メンバーを1画面で横断 |
| `/album/[id]/event/[eventId]` | イベント詳細 | 写真・動画・コメント文脈を集約する記憶の単位 |
| `/album/[id]/connections` | つながり可視化 | 再会準備の状態をネットワーク視点で把握 |
| `/invitations` | 招待状一覧 | 再会のきっかけ（誘い）を受け取る・確認する |
| `/profile` | プロフィール | 自分の所属と活動の基準点 |

補足:
- 共通導線は TopBar / BottomBar で提供
- `profile` から `settings` / `notifications` / `help` へのリンクがあるが、該当ページ本体は未作成

## ユーザーストーリー（一本の体験）

1. ホームで最近の動きと再会機会を知る
2. アルバムを開いて、イベント単位で思い出に再アクセスする
3. つながり状態を見ながら、誰と再会を進めるか判断する
4. 招待状を通じて行動（参加・返答）につなげる

この流れで、deaito は「閲覧アプリ」ではなく「関係を継続運用するアプリ」として機能します。

## 現在地（実装ステータス）

- 現在はモック版（サンプルデータ/`public` アセット中心）
- デプロイ基盤は Vercel、分析は Vercel Analytics
- 画面上のアップロードUIや検索UIはあるが、バックエンド接続はこれから

## 商用版方針（これから）

- 認証・DB は Supabase、メディア保存は GCP Cloud Storage を利用
- PostgreSQL + RLS を中心に、REST API（PostgREST）でデータアクセス
- 画像/動画アップロードを GCP Cloud Storage へ接続し、`media_assets` と整合管理

関連設計資料:

- [docs/architecture/screen-structure.drawio](docs/architecture/screen-structure.drawio)
- [docs/architecture/commercial-architecture.drawio](docs/architecture/commercial-architecture.drawio)
- [docs/architecture/db-erd.drawio](docs/architecture/db-erd.drawio)
- [docs/architecture/api-rest-design.drawio](docs/architecture/api-rest-design.drawio)
- [supabase/schema.sql](supabase/schema.sql)

## 開発

```bash
docker compose up -d
```

またはローカル直接実行:

```bash
npm install
npm run dev
```
