# DEPLOYMENT.md — デプロイ・運用手順

> ⚠️ **2026-05-31 訂正**: 本番ホスティングは **GitHub Pages**（Netlify ではない）。
> CMS の GitHub OAuth は **Cloudflare Worker** へ移行中（[CMS_AUTH_CLOUDFLARE.md](CMS_AUTH_CLOUDFLARE.md)）。
> 以下の「Netlify」前提の記述は移行完了で廃止。

## 通常のデプロイフロー（自動）

1. ローカルで編集
2. `git add . && git commit -m "..." && git push origin main`
3. GitHub Pages が push を検知して `jekyll build` を自動実行
4. ビルド完了後、`kmukawa.jp`（GitHub Pages）に配信される（通常 1〜2分）

**ローカルでの Jekyll ビルドは通常不要**（GitHub Pages で自動ビルドされる）。
プレビュー確認したい場合のみ後述の「ローカル開発」手順を実行。

---

## 別PCでのセットアップ手順

新しい PC で開発を再開する場合：

### 1. 必要ツール

- Git
- Claude Code CLI
- （ローカルプレビューが必要な場合のみ）Ruby + Bundler + Node.js

### 2. リポジトリのクローン

```powershell
cd "C:\Users\gikai044\プロジェクト\議員活動担当\SNS担当"
git clone https://github.com/kmukawa0126/kmukawa-website.git
cd kmukawa-website
```

### 3. Claude Code 起動

```powershell
claude
```

`CLAUDE.md` が自動で読み込まれ、プロジェクト仕様がコンテキストに入ります。

### 4. （任意）ローカルプレビュー環境

```powershell
gem install bundler jekyll
bundle install
bundle exec jekyll serve
# → http://localhost:4000 でプレビュー
```

---

## ビルド状況の確認（GitHub Pages）

- リポジトリ **Settings → Pages** で公開状態・カスタムドメイン（`kmukawa.jp`）・HTTPS を確認
- ビルド/デプロイのログは **Actions タブ**（"pages build and deployment" ワークフロー）で確認
- ビルド失敗時は Actions のログでエラー箇所を特定

### ~~旧: Netlify ダッシュボード~~（廃止予定）
- `frolicking-bublanina-a90bb7` は 5/30 サスペンド。CF Worker 移行後に停止/削除（[CMS_AUTH_CLOUDFLARE.md](CMS_AUTH_CLOUDFLARE.md) ステップ5）

---

## カスタムドメイン設定手順（kmukawa.jp 取得後）

### お名前.com 側

1. お名前.com で `kmukawa.jp` を取得
2. DNS 設定で以下を追加：
   - `A` レコード: `@` → `185.199.108.153`
   - `A` レコード: `@` → `185.199.109.153`
   - `A` レコード: `@` → `185.199.110.153`
   - `A` レコード: `@` → `185.199.111.153`
   - `CNAME` レコード: `www` → `kmukawa0126.github.io`

（**注**: 現状は Netlify 主体運用のため、Netlify の DNS 設定に切り替える選択肢もあり。要判断）

### Netlify 側で運用する場合

1. Netlify ダッシュボード → Domain settings → Add custom domain → `kmukawa.jp`
2. Netlify が指示する DNS レコード（CNAME or A）をお名前.com で設定
3. Netlify が自動で Let's Encrypt SSL 証明書を発行（通常 1〜24時間）

### GitHub Pages で運用する場合

1. リポジトリ Settings → Pages → Custom domain に `kmukawa.jp` を入力
2. `CNAME` ファイルが自動で `kmukawa.jp` に更新される（既に存在）
3. Enforce HTTPS にチェック（証明書発行後）

---

## CMS の OAuth 設定（Cloudflare Worker 版）

詳細な移行・運用手順は **[CMS_AUTH_CLOUDFLARE.md](CMS_AUTH_CLOUDFLARE.md)** に集約。要点のみ:

- OAuth プロキシ = Cloudflare Worker（公式 sveltia-cms-auth）。GitHub Pages に Functions は無い。
- **GitHub OAuth App**
  - Homepage URL: `https://kmukawa.jp`
  - Authorization callback URL: `https://<Worker URL>/callback`
- **Worker env**: `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `ALLOWED_DOMAINS=kmukawa.jp`
- **CMS 設定**: `admin/config.yml` の `backend.base_url` = `https://<Worker URL>`

---

## トラブルシューティング

### ビルド失敗

- GitHub の **Actions タブ**（"pages build and deployment"）のログを確認
- よくある原因:
  - `_posts/` のファイル名が `YYYY-MM-DD-slug.md` 形式でない
  - Markdown 内の YAML front matter が不正
  - `Gemfile` の依存関係エラー

### CMS にログインできない

- `admin/config.yml` の `base_url` が実 Worker URL になっているか（プレースホルダのままでないか・末尾 `/` 無し）
- Cloudflare Worker の env（`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`/`ALLOWED_DOMAINS`）が設定されているか
- GitHub OAuth App の callback URL が `https://<Worker URL>/callback` と完全一致しているか
- 詳細な切り分けは [CMS_AUTH_CLOUDFLARE.md](CMS_AUTH_CLOUDFLARE.md) のトラブルシューティング表を参照

### ローカルプレビューでスタイルが崩れる

- `_config.yml` の `baseurl: ""` が空であることを確認
- ブラウザの強制リロード（Ctrl+Shift+R）

### 記事を投稿したのに反映されない

- `_posts/` のファイル名と front matter の `date` が一致しているか確認
- ファイル名に日本語が含まれている場合は半角英数のスラッグに変更
- GitHub の Actions タブでビルドエラーが出ていないか確認

---

## バックアップ運用

- **コード**: GitHub にすべて push されているため、GitHub がバックアップを兼ねる
- **画像**: `images/` 配下も Git 管理されている
- **PDF**: `report/` 配下も Git 管理（重いファイルは要 Git LFS 検討）
- **CMS で作成した記事**: GitHub に commit されるため自動バックアップ
- **環境変数（OAuth）**: Cloudflare Worker の Secret として管理。`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` の値は別途記録しておくこと
