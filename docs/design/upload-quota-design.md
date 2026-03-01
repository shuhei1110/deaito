# アップロード容量制限 詳細設計（GCP Cloud Storage + Supabase）

## 目的

- 商用版でメディア保存コストを制御する
- ユーザーごとの公平性を担保する
- UIだけでなくサーバー側で強制できる制限にする

## 決定事項（今回）

- ユーザー合計上限: **256 MiB**
  - `268,435,456` bytes
- 対象: `media_assets` に登録される画像・動画
- 保存先: GCP Cloud Storage（例: `deaito-media` バケット）
- メタデータ: Supabase PostgreSQL (`media_assets`)

## 非機能要件

- 競合アップロード時も上限超過を防ぐ
- クライアント改ざん時もサーバー側で拒否する
- エラー理由をUIへ返せる（容量超過、拡張子不正など）

## 制限ポリシー

### 1) ユーザー合計制限

- 1ユーザーの累積使用量 `used_bytes` が `quota_bytes` を超えないこと
- 計算対象は「未削除メディア」の `size_bytes` 合計

### 2) ファイル単位制限（推奨）

- 画像: 最大 20 MiB
- 動画: 最大 200 MiB

※ 値は運用で調整可。まずは過大ファイルの事故防止を優先。

## データモデル追加案

### A. `user_storage_quotas`

```sql
create table public.user_storage_quotas (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  quota_bytes bigint not null default 268435456,
  used_bytes bigint not null default 0,
  updated_at timestamptz not null default now(),
  check (quota_bytes >= 0),
  check (used_bytes >= 0)
);
```

### B. `media_assets` 拡張（推奨）

- `is_deleted boolean not null default false`（論理削除運用をする場合）

## アップロード方式（推奨フロー）

クライアントからGCSへ直接アップロードせず、**サーバー経由の予約方式（署名URL発行）**を使う。

1. クライアント: アップロード前に `filename`, `size_bytes`, `mime_type`, `album_id`, `event_id` を送信
2. サーバー（Route Handler / Edge Function）:
   - 認証ユーザー確認
   - album membership確認
   - `user_storage_quotas` を `FOR UPDATE` でロック
   - `used_bytes + size_bytes <= quota_bytes` を検証
  - 問題なければ GCS の signed upload URL を発行
3. クライアント: GCS signed URLでアップロード
4. サーバー: `media_assets` 挿入 + `used_bytes += size_bytes`

## 整合性ルール

- `media_assets` 挿入成功時のみ `used_bytes` 加算
- メディア削除時は `used_bytes` 減算
- 日次バッチで `used_bytes` 再集計（保険）

## API仕様（最小）

### `POST /api/uploads/reserve`

Request:

```json
{
  "albumId": "uuid",
  "eventId": "uuid | null",
  "fileName": "xxx.jpg",
  "fileSize": 123456,
  "mimeType": "image/jpeg"
}
```

Response (200):

```json
{
  "signedUrl": "...",
  "path": "user/<uid>/album/<albumId>/<uuid>.jpg",
  "maxRemainingBytes": 4567890
}
```

Response (409):

```json
{
  "code": "QUOTA_EXCEEDED",
  "message": "256MBの上限を超えるためアップロードできません"
}
```

### `POST /api/uploads/complete`

- アップロード完了後に呼ぶ
- `media_assets` 登録と `used_bytes` 更新を行う

## 権限方針

- DB操作は Supabase RLS で制御
- GCS操作は signed URL + サーバー側認可で制御
- GCPサービスアカウント鍵はサーバー環境変数のみで管理

## 監視項目

- `quota_exceeded_count`
- `upload_failure_count`
- `upload_success_bytes_total`
- ユーザー別 `used_bytes/quota_bytes`

## 段階導入プラン

1. `user_storage_quotas` 追加
2. 既存ユーザーへ初期クォータ投入（256MB）
3. `/api/uploads/reserve` 実装
4. イベント詳細のアップロードUIを reserve/complete フローへ置換
5. 削除フローで `used_bytes` 減算
6. 日次再集計ジョブ実装

## 注意点

- DBにパスワードや秘密鍵を保存しない
- `NEXT_PUBLIC_*` には公開してよい値のみ置く
- `SUPABASE_SERVICE_ROLE_KEY` はサーバー限定
- GCPサービスアカウントJSONはリポジトリに保存しない

## 将来拡張（任意）

- マルチクラウド化（S3/R2）へ対応する場合は `media_assets` の provider 切替で段階移行する
