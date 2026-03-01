# 運用ランブック

## 1. システム構成概要

| サービス | 用途 | 管理画面 |
|---|---|---|
| **Vercel** | Next.js ホスティング（SSR / API Routes） | https://vercel.com/dashboard |
| **Supabase** | PostgreSQL / Auth / RLS | https://supabase.com/dashboard |
| **GCP Cloud Storage** | メディアファイル保存（画像・動画） | https://console.cloud.google.com/storage |

### データフロー

```
ブラウザ → Vercel (Next.js)
  ├─ Server Actions / Route Handlers → Supabase (PostgreSQL)
  ├─ /api/uploads/reserve → GCS 署名URL発行
  └─ /api/uploads/complete → media_assets 登録 + used_bytes 更新
ブラウザ → GCS（署名URL経由で直接アップロード）
```

### 環境変数（サーバー限定）

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー（RLS 適用） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー（RLS バイパス） |
| `GCS_BUCKET_NAME` | GCS バケット名 |
| `GCS_PROJECT_ID` | GCP プロジェクトID |
| `GCS_CLIENT_EMAIL` | GCS サービスアカウントメール |
| `GCS_PRIVATE_KEY` | GCS サービスアカウント秘密鍵 |

---

## 2. 監視項目

### 2.1 Vercel

- **デプロイ状態**: Dashboard → Deployments
- **Function エラー率**: Dashboard → Logs → "error" でフィルタ
- **レスポンスタイム**: Vercel Analytics（`@vercel/analytics` 導入済み）
- **Edge/Serverless 実行時間**: Dashboard → Usage

### 2.2 Supabase

- **DB 接続数**: Dashboard → Database → Connection Pooling
- **RPC エラー**: Dashboard → Logs → PostgreSQL Logs
- **Auth エラー率**: Dashboard → Authentication → Logs
- **テーブルサイズ**: SQL Editor で `SELECT pg_size_pretty(pg_total_relation_size('media_assets'));`

### 2.3 GCS

- **ストレージ使用量**: GCP Console → Cloud Storage → バケット詳細
- **署名URL発行エラー**: Vercel Logs で `[uploads/reserve]` タグを検索
- **アクセスエラー**: GCP Console → Cloud Storage → バケット → Logs

### 2.4 アプリケーション

- **ヘルスチェック**: `GET /api/health` — Supabase DB 接続を確認
  - `200`: healthy
  - `503`: degraded（DB 接続失敗）
- **外形監視**: Vercel Cron や外部サービス（UptimeRobot 等）で `/api/health` を定期監視推奨

---

## 3. 障害対応フロー

### 3.1 初動

```
1. 症状の把握（ユーザー報告 / アラート）
2. /api/health を確認 → DB 接続状態を判定
3. Vercel Dashboard → Logs で直近のエラーを確認
4. エラータグで絞り込み:
   - [uploads/reserve]  → アップロード予約
   - [uploads/complete] → アップロード完了
   - [uploads/quota]    → クォータ取得
   - [profile/avatar]   → アバターアップロード
   - [createNotification] → 通知作成
5. 必要に応じて Supabase Logs / GCS Console を確認
```

### 3.2 エスカレーション基準

| レベル | 条件 | 対応 |
|---|---|---|
| **P0** | 全ユーザーがログイン不可 / 全画面500エラー | 即時対応。Vercel ロールバック検討 |
| **P1** | アップロード全件失敗 / DB 接続不可 | 1時間以内に対応開始 |
| **P2** | 特定ユーザーのクォータ不整合 / 一部通知未配信 | 翌営業日対応 |

---

## 4. よくある障害と復旧手順

### 4.1 認証エラー多発

**確認手順:**
1. Supabase Dashboard → Authentication → Logs で失敗理由を確認
2. `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しいか確認
3. JWT の有効期限設定を確認（Supabase Dashboard → Settings → Auth）

**復旧手順:**
- 環境変数の値が不正 → Vercel の環境変数を修正して再デプロイ
- JWT 秘密鍵の変更があった → Supabase Dashboard → Settings → API で確認

### 4.2 アップロード失敗

**確認手順:**
1. `/api/health` でDB接続を確認
2. Vercel Logs で `[uploads/reserve]` / `[uploads/complete]` を検索
3. GCS Console でバケットのアクセス権限を確認

**復旧手順:**
- GCS サービスアカウント鍵の期限切れ → 新しい鍵を発行し `GCS_PRIVATE_KEY` を更新
- バケットの権限不足 → GCP IAM でサービスアカウントに `Storage Object Admin` を付与
- クォータ超過で拒否 → 正常動作（ユーザーに容量超過を通知）

### 4.3 クォータ不整合（used_bytes がずれている）

**確認手順:**
```sql
-- 実際のファイルサイズ合計と used_bytes を比較
SELECT
  q.user_id,
  q.used_bytes AS recorded,
  COALESCE(SUM(m.size_bytes), 0) AS actual
FROM user_storage_quotas q
LEFT JOIN media_assets m ON m.uploader_id = q.user_id
GROUP BY q.user_id, q.used_bytes
HAVING q.used_bytes != COALESCE(SUM(m.size_bytes), 0);
```

**復旧手順:**
```sql
-- 全ユーザーの used_bytes を再集計
SELECT reconcile_storage_quotas();
```
または管理画面から `reconcileQuotasAction()` を実行。

### 4.4 DB 接続エラー

**確認手順:**
1. `/api/health` → `database: "error"` なら DB 接続問題
2. Supabase Dashboard → Database → Connection Pooling で接続数を確認
3. Supabase Dashboard → Settings → Database で接続文字列を確認

**復旧手順:**
- 接続プール枯渇 → Supabase Dashboard で接続数上限を確認。不要な接続がないか調査
- Supabase 障害 → [Supabase Status](https://status.supabase.com/) を確認。復旧を待つ
- 環境変数不正 → Vercel 環境変数を修正して再デプロイ

### 4.5 500エラー多発

**確認手順:**
1. Vercel Dashboard → Logs → ステータスコード `500` でフィルタ
2. スタックトレースからエラー発生箇所を特定
3. 直近のデプロイとの関連を確認

**復旧手順:**
- デプロイ起因 → Vercel Dashboard → Deployments → 前のデプロイに即座にロールバック
- データ起因 → Supabase SQL Editor で問題データを調査・修正

---

## 5. バックアップ方針

### 5.1 データベース（Supabase PostgreSQL）

| 項目 | 内容 |
|---|---|
| 自動バックアップ | Pro plan: 日次バックアップ、7日間保持 |
| Point-in-Time Recovery | Pro plan: 任意の時点に復元可能 |
| 手動バックアップ | `pg_dump` で取得可能（Supabase Dashboard → Database → Backups） |
| 復元方法 | Supabase Dashboard → Database → Backups → Restore |

### 5.2 メディアファイル（GCS）

| 項目 | 内容 |
|---|---|
| 推奨設定 | バケットのオブジェクトバージョニングを有効化 |
| 削除対策 | バージョニング有効時、削除してもバージョンが残る |
| 復元方法 | GCS Console → オブジェクト → バージョン一覧から復元 |

### 5.3 コード

| 項目 | 内容 |
|---|---|
| ソースコード | Git リポジトリ（GitHub） |
| デプロイ履歴 | Vercel Dashboard → Deployments で過去のデプロイに戻せる |
| ロールバック | Vercel Dashboard で任意のデプロイを即座に Promote 可能 |

---

## 6. 定期運用タスク

### 日次
- `reconcile_storage_quotas()` 自動実行（pg_cron 設定済みの場合）
  ```sql
  -- 手動確認: pg_cron ジョブの実行状況
  SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
  ```

### 週次
- Vercel Analytics でページビュー・エラー率を確認
- Supabase Dashboard → Logs で異常なパターンがないか確認

### 月次
- GCS ストレージ使用量を確認（コスト管理）
- Supabase 接続数トレンドを確認
- `user_storage_quotas` の使用率が高いユーザーを確認:
  ```sql
  SELECT user_id, used_bytes, quota_bytes,
         ROUND(used_bytes::numeric / quota_bytes * 100, 1) AS usage_pct
  FROM user_storage_quotas
  ORDER BY usage_pct DESC
  LIMIT 20;
  ```

---

## 7. ログの確認方法

### 現在のログ方式

アプリケーションは `console.error("[tag]", err)` でエラーを出力。Vercel Functions Log に記録される。

### エラータグ一覧

| タグ | ファイル | 内容 |
|---|---|---|
| `[uploads/reserve]` | `app/api/uploads/reserve/route.ts` | 署名URL発行エラー |
| `[uploads/complete]` | `app/api/uploads/complete/route.ts` | アップロード完了処理エラー |
| `[uploads/quota]` | `app/api/uploads/quota/route.ts` | クォータ取得エラー |
| `[profile/avatar]` | `app/api/profile/avatar/route.ts` | アバターアップロードエラー |
| `[createNotification]` | `lib/supabase/notifications.ts` | 通知作成エラー（サイレント失敗） |

### 検索方法

1. Vercel Dashboard → プロジェクト → Logs タブ
2. 検索ボックスにタグ名（例: `[uploads/reserve]`）を入力
3. 時間範囲を指定してフィルタ

### 将来の改善候補

- 構造化ログライブラリ（Pino）の導入
- Sentry によるエラートラッキング + アラート
- Supabase Edge Functions のカスタムログ
