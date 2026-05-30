# ARCHITECTURE.md — 技術スタック詳細

> ⚠️ **2026-05-31 訂正**: 本ドキュメントは旧「Netlify ホスティング」前提で書かれていたが、
> 実態は **本番 kmukawa.jp = GitHub Pages 配信**（`Server: GitHub.com`、apex A=185.199.108-111.153）。
> CMS の GitHub OAuth プロキシのみ Netlify Functions に依存していたが、Netlify サスペンド（5/30）を機に
> **Cloudflare Worker（公式 sveltia-cms-auth）** へ移行中。下記の「Netlify」記述は移行完了で順次廃止。
> 移行手順: [CMS_AUTH_CLOUDFLARE.md](CMS_AUTH_CLOUDFLARE.md)

## 全体アーキテクチャ（移行後）

```
┌─────────────────┐
│   GitHub Repo   │ kmukawa0126/kmukawa-website
│ （ソース管理）  │
└────────┬────────┘
         │ push trigger
         ↓
┌─────────────────┐         ┌─────────────────┐
│  GitHub Pages   │         │  Sveltia CMS    │
│ ・Jekyll build  │         │  (/admin/)      │
│ ・静的配信(apex)│         │  ブログ編集GUI  │
└────────┬────────┘         └────────┬────────┘
         │ HTTPS                     │ GitHub OAuth
         ↓                           ↓
┌─────────────────┐         ┌──────────────────────┐
│  訪問者ブラウザ │         │ Cloudflare Worker    │
└─────────────────┘         │ (sveltia-cms-auth)   │
                            │ /auth ・ /callback   │
                            └──────────────────────┘
```

## 旧・全体アーキテクチャ（参考・Netlify 時代）

```
┌─────────────────┐
│   GitHub Repo   │ kmukawa0126/kmukawa-website
│ （ソース管理）  │
└────────┬────────┘
         │ push trigger
         ↓
┌─────────────────┐         ┌─────────────────┐
│    Netlify      │ ←GitHub │  Decap CMS      │
│ ・Jekyll build  │  OAuth  │  (/admin/)      │
│ ・静的配信      │ ←──────│  ブログ編集GUI  │
│ ・Functions     │         └─────────────────┘
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  訪問者ブラウザ │
└─────────────────┘
```

## 各レイヤーの役割

### 1. ソース管理: GitHub
- リポジトリ: `kmukawa0126/kmukawa-website`
- ブランチ: `main` 一本（フィーチャーブランチ運用なし）
- push 検知で Netlify が自動ビルド

### 2. 静的サイト生成: Jekyll
- **設定**: `_config.yml`
  - `url: https://kmukawa.jp`
  - `permalink: /blog/:year:month:day/` （ブログ記事のURL構造）
  - `markdown: kramdown`
  - `_posts` の `type: posts` に `layout: "post"` を自動付与（`defaults` 設定）
- **依存**: `Gemfile`（`jekyll` gem）
- **ビルド**: `bundle exec jekyll build` → `_site/` を出力

### 3. ホスティング: GitHub Pages（現行）
- **配信元**: GitHub Pages（apex `kmukawa.jp` → A 185.199.108-111.153、`Server: GitHub.com`）
- **ビルド**: push to `main` → GitHub Pages が Jekyll を自動ビルド・配信
- **CNAME**: リポジトリ直下の `CNAME`（`kmukawa.jp`）で apex を紐付け
- **注意**: GitHub Pages は `_headers`（Cache-Control）と `netlify.toml` の redirects を **無視する**。
  キャッシュ制御は GitHub Pages 既定（`max-age=600`）。帯域はソフト上限 100GB/月。
- ~~**旧: Netlify**（`netlify.toml` / `frolicking-bublanina-a90bb7.netlify.app`）~~ → 5/30 サスペンド、廃止予定

### 4. CMS: Decap CMS（旧 Netlify CMS）
- **エントリーポイント**: `/admin/index.html`
- **設定**: `/admin/config.yml`
- **バックエンド**: GitHub（`backend: github`）
- **認証**: 自前 OAuth プロキシ経由（後述）
- **コレクション定義**:
  - `blog`: `_posts` フォルダに Markdown を生成
  - フィールド: `title` / `date` / `description`（120字以内）/ `thumbnail`（画像）/ `body`（Markdown）
  - スラッグ: `{{year}}-{{month}}-{{day}}-{{slug}}`
- **メディアフォルダ**: `images/blog/` （CMS がアップロードした画像の保存先）

### 5. 認証: Cloudflare Worker による GitHub OAuth プロキシ（現行）
- **理由**: GitHub Pages には Functions が無いため、OAuth トークン交換を外部 Worker に委譲
- **実装**: 公式 [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)（Cloudflare Workers・無料）
  - `/auth` — GitHub OAuth 認可画面へリダイレクト（CSRF token を HttpOnly Cookie に発行）
  - `/callback` — code を access_token に交換し、origin 限定で CMS に postMessage
- **環境変数（Worker secret）**: `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `ALLOWED_DOMAINS=kmukawa.jp`
- **CMS 側設定**: `admin/config.yml` の `backend.base_url` を Worker URL に指定
- ~~**旧: Netlify Functions**（`netlify/functions/auth.js` / `auth-callback.js`）~~ → 廃止予定

## ファイル責務マップ

### ルートのHTMLファイル
| ファイル | 役割 |
|---------|------|
| `index.html` | トップページ。ヒーロースライドショー（7枚・5秒切替）、最新情報、政策ピックアップ |
| `profile.html` | プロフィール（経歴・委員会歴） |
| `policy.html` | 重点政策（交通・インフラ・教育・福祉） |
| `activity.html` | 議会活動の概要 |
| `blog.html` | ブログ記事一覧（サムネ240×160） |
| `newsletter.html` | 市政報告レポート（PDF一覧） |
| `contact.html` | お問い合わせフォーム（Formspree: `mpqopyln`） |
| `support.html` | ご支援のお願い |
| `qa-rX-Y.html` | 各定例会の一般質問記録（R5/9月〜R8/3月、計8本） |

### スタイル・スクリプト
- `css/style.css` — 全ページ共通スタイル。レスポンシブ対応（モバイル・タブレット・PC）
- `js/main.js` — ハンバーガーメニュー、ヒーロースライダー、ドロワー開閉

### Jekyll 関連
- `_config.yml` — Jekyll 設定
- `_layouts/post.html` — ブログ記事のテンプレ（GA タグ、ヘッダー、シェアボタン）
- `_posts/*.md` — ブログ記事本体（Markdown + front matter）

### CMS 関連
- `admin/index.html` — Decap CMS のエントリポイント（CDN から JS 読込）
- `admin/config.yml` — CMS の編集スキーマ

### サーバーレス関数
- `netlify/functions/auth.js` — OAuth 開始エンドポイント
- `netlify/functions/auth-callback.js` — OAuth コールバック処理

### コンテンツアセット
- `images/` — 人物写真・ヒーロー画像・各ページ画像
- `images/blog/` — ブログ記事用画像（Decap CMS の出力先）
- `blog/20260329/` — 個別ブログ HTML（旧形式・新形式への移行残）
- `blog/posts.json` — ブログ一覧データ（旧 SPA 的実装の名残）
- `report/*.pdf` — 市政報告レポート vol.4 〜 vol.13、市政報告vol12.pdf 〜 vol.13.pdf

## データフロー: ブログ記事公開まで

```
[管理者] /admin/ にアクセス
    ↓
[Decap CMS] GitHub OAuth ボタンを表示
    ↓
[/api/auth → auth.js] GitHub の OAuth 認可画面へリダイレクト
    ↓
[ユーザー] GitHub で「Authorize」をクリック
    ↓
[GitHub] /api/auth/callback にコードを渡してリダイレクト
    ↓
[auth-callback.js] access_token を取得し CMS へ postMessage
    ↓
[Decap CMS] 認証完了・編集 UI 表示
    ↓
[管理者] 記事を作成 → 「公開」ボタン
    ↓
[Decap CMS] _posts/YYYY-MM-DD-slug.md を生成し GitHub に commit
    ↓
[GitHub] Webhook で Netlify に通知
    ↓
[Netlify] bundle exec jekyll build を実行
    ↓
[Netlify CDN] 新しい _site/ を配信開始
    ↓
[訪問者] /blog/YYYYMMDD/ で記事を閲覧
```

## 既知の技術的負債・注意点

1. **`blog/` 配下の旧形式 HTML と `_posts/` の Jekyll 形式が共存**
   - 一部記事は `blog/20260329/20260329.html` のように直書きで存在
   - 新規記事は必ず `_posts/` に Markdown で作成すること
2. **`blog/posts.json` は旧 SPA 実装の名残**
   - 現在は Jekyll が `_posts/` から自動生成する一覧と二重管理状態
3. **`CNAME` ファイルは `kmukawa.jp` だが現在は Netlify ホスティング**
   - GitHub Pages を併用するか Netlify 単独にするか方針を要確認
4. **モバイル版ヒーロー画像の背景位置**
   - 各画像で `background-position` を個別調整しているため、画像差し替え時は注意
