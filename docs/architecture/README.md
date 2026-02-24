# アーキテクチャ図の管理

このプロジェクトでは、以下の2種類で管理するのが適切です。

1. **画面構成図**: `screen-structure.drawio`
2. **SaaS/外部依存図**: `saas-architecture.drawio`

補助ソース（Mermaid）として `screen-structure.mmd` を保持しています。

## なぜこの2分割が良いか

- 画面導線（UX）とシステム依存（技術構成）は変更サイクルが異なるため、分離すると更新が楽
- 非エンジニア向け説明（画面）と技術検討（SaaS/インフラ）を使い分けできる
- 機能追加時の差分レビュー対象が明確になる

## draw.io ファイル

- 画面構成図: `screen-structure.drawio`
- SaaS/外部依存図: `saas-architecture.drawio`

## Mermaid からの取り込み（必要時のみ）

1. draw.io を開く
2. **Arrange → Insert → Advanced → Mermaid** を選択
3. `.mmd` の中身を貼り付け
4. 必要に応じてレイアウト微調整

## 更新ルール（推奨）

- ルート追加/削除時: `screen-structure.drawio` を更新
- 外部サービス追加/削除時: `saas-architecture.drawio` を更新
- PR テンプレートで「図更新の有無」をチェック項目化

## 現状メモ

- 本番配備: Vercel
- 計測: Vercel Analytics
- UI生成フロー: v0.app 連携
- 現時点では DB / Auth SaaS / 外部API は未接続（主にモックデータ駆動）
