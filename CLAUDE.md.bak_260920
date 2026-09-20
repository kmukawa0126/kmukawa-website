# CLAUDE.md — むかわけい公式ホームページ

このファイルは Claude Code が起動時に自動で読み込むプロジェクト仕様書です。別PCで `claude` を起動するだけで本ファイルがコンテキストに入ります。

---

## プロジェクト概要

- **名称**: むかわけい 公式ホームページ
- **所有者**: 務川 慧（相模原市議会議員・南区）
- **目的**: 議会活動・政策発信・市民との双方向コミュニケーション
- **公開URL（現行）**: https://www.kmukawa.com/ （旧Wix）／ Netlify ホスティング側で稼働中
- **本番ドメイン（予定）**: `kmukawa.jp`（未取得、お名前.comで取得予定）
- **GitHub リポジトリ**: `kmukawa0126/kmukawa-website`
- **ローカルパス**: `C:\Users\gikai044\プロジェクト\議員活動担当\SNS担当\kmukawa-website\`

---

## 技術スタック（一行サマリ）

**Jekyll** で静的サイト生成 → **GitHub Pages** でホスティング（apex は 185.199.108-111.153）→ **Sveltia CMS**（旧Decap CMS）でブログ編集 → **GitHub OAuth**（Cloudflare Worker `sveltia-cms-auth` による認証プロキシ）

> ⚠️ **2026-05-31 ホスティング実態の訂正**: 本番 kmukawa.jp は **GitHub Pages** で配信中（`Server: GitHub.com`）。Netlify ではない。
> 旧構成は CMS の GitHub OAuth プロキシのみ Netlify Functions に依存していたが、その Netlify が「300クレジット超過」で 5/30 サスペンド（503）→ CMS ログイン不能化。
> OAuth を **Cloudflare Worker（公式 sveltia-cms-auth・無料）** へ移行中。手順: [docs/CMS_AUTH_CLOUDFLARE.md](docs/CMS_AUTH_CLOUDFLARE.md)。DNS 変更なし。

詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照。

---

## ディレクトリ構成

```
kmukawa-website/
├── CLAUDE.md             ← このファイル（Claude Code 自動読込）
├── README.md             ← 人間向け簡易説明
├── docs/                 ← 詳細ドキュメント
│   ├── ARCHITECTURE.md   ← 技術スタック詳細
│   ├── HISTORY.md        ← 制作経緯・Wix移行経緯
│   ├── DEPLOYMENT.md     ← デプロイ手順
│   └── CONTENT-GUIDE.md  ← 投稿・編集ルール
├── _config.yml           ← Jekyll 設定（url: kmukawa.jp）
├── _layouts/post.html    ← ブログ記事レイアウト
├── _posts/               ← ブログ記事（Markdown、ファイル名 YYYY-MM-DD-slug.md）
├── _site/                ← Jekyll ビルド成果物（gitignore）
├── admin/                ← Decap CMS 管理画面（/admin/）
│   ├── index.html
│   └── config.yml        ← CMS 設定（GitHub backend）
├── netlify/functions/    ← Netlify Functions（GitHub OAuth プロキシ）
│   ├── auth.js
│   └── auth-callback.js
├── netlify.toml          ← Netlify ビルド設定
├── CNAME                 ← `kmukawa.jp`（GitHub Pages 用、現状は Netlify 主導）
├── Gemfile               ← Jekyll の依存関係
├── sitemap.xml
├── index.html            ← トップページ（ヒーロースライドショー含む）
├── profile.html          ← プロフィール
├── policy.html           ← 重点政策
├── activity.html         ← 議会活動
├── blog.html             ← ブログ一覧（記事サムネ表示）
├── newsletter.html       ← 市政報告レポート（PDF一覧）
├── contact.html          ← お問い合わせ（Formspree 連携）
├── support.html          ← ご支援のお願い
├── qa-r5-9.html ～ qa-r8-3.html  ← 各定例会の一般質問記録
├── css/style.css         ← サイト全体のスタイル
├── js/main.js            ← ハンバーガーメニュー等のスクリプト
├── images/               ← ヒーロー画像・人物写真等
│   └── blog/             ← ブログ記事内画像（Decap CMS の media_folder）
├── blog/                 ← 個別ブログ HTML（旧形式・移行残）
│   ├── 20260329/         ← 例: R8/3月議会報告
│   └── posts.json        ← ブログ一覧データ
└── report/               ← 市政報告 PDF（vol.4 〜 vol.13）
```

---

## 開発フロー（重要）

### ブログ記事を追加する

**推奨ルート（Decap CMS GUI）**:
1. `https://[Netlify URL]/admin/` にアクセス
2. GitHub OAuth でログイン
3. 「ブログ記事」コレクションから新規作成
4. CMS が `_posts/YYYY-MM-DD-slug.md` を生成し GitHub に push

**直接ルート（手動 commit）**:
1. `_posts/YYYY-MM-DD-スラッグ.md` を作成
2. front matter は `title`/`date`/`thumbnail`/`description` （`layout: post` は `_config.yml` で自動付与）
3. `git push` → Netlify が自動でビルド・デプロイ

詳細は [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md)。

### ページ・スタイル変更
- HTML 直接編集 → `git push` → Netlify 自動デプロイ
- ローカル確認は `bundle exec jekyll serve`（要 Ruby + Bundler）

---

## 進行中・未完了の重要タスク

1. **`kmukawa.jp` ドメイン取得**（お名前.com、未取得）
2. **Wix → 新サイトへの移行残作業**（旧ブログ500本は Wix 無料プランで存続させる方針）
3. **Google Analytics**: `G-GF42L60JH2` を `_layouts/post.html` に設置済み。他ページの導入状況は未確認
4. **OGP 設定**: SNSシェア時のサムネイル設定未対応
5. **Favicon**: 未設定

Wix移管の経緯と残タスクは [docs/HISTORY.md](docs/HISTORY.md) を参照。

---

## 編集時の注意点

- **コミットメッセージ**: `feat:`/`fix:`/`docs:` の conventional commits 形式（過去ログ参照）
- **画像配置**:
  - サイト全体で使う画像 → `images/`
  - ブログ記事内画像 → `images/blog/`（Decap CMS の出力先）
  - ファイル名は半角英数推奨（日本語ファイル名は CMS で文字化けの可能性）
- **ヒーロースライドショー（index.html）**: 7枚切替・5秒間隔。モバイル版は背景位置を1枚ごとに調整済み（最近の commit 履歴参照）
- **`_posts/` のファイル名規則**: `YYYY-MM-DD-slug.md` 必須。日付がファイル名と front matter で食い違うと Jekyll が無視する

---

## 外部サービス・連携

| サービス | 用途 | アカウント |
|---------|------|----------|
| GitHub | ソース管理・OAuth・**Pages ホスティング/ビルド** | `kmukawa0126` |
| Cloudflare Workers | **CMS の GitHub OAuth プロキシ**（sveltia-cms-auth） | kmukawa0126 アカウント |
| ~~Netlify~~（廃止予定） | 旧 OAuth Functions。5/30 サスペンド。CF Worker 移行後に停止/削除 | 旧URL: `frolicking-bublanina-a90bb7.netlify.app` |
| Formspree | お問い合わせフォーム送信 | Form ID: `mpqopyln` |
| Google Analytics | アクセス解析 | 測定ID: `G-GF42L60JH2` |
| お名前.com | ドメイン管理（予定） | `kmukawa.jp` 取得予定 |
| Wix | 旧サイト・旧ブログ存続 | 旧URL: `kmukawa.com`（移管検討中） |

---

## 関連ドキュメント

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 技術スタック・ファイル責務・データフロー
- [docs/HISTORY.md](docs/HISTORY.md) — 制作経緯・Wix移行の意思決定経緯
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Netlify / GitHub Pages デプロイ手順・DNS設定
- [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md) — ブログ・固定ページ編集ルール
- [README.md](README.md) — 人間向け簡易説明（GitHub 表示用）
