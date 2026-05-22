# DEPLOYMENT.md — デプロイ・運用手順

## 通常のデプロイフロー（自動）

1. ローカルで編集
2. `git add . && git commit -m "..." && git push origin main`
3. GitHub の Webhook が Netlify に通知
4. Netlify が `bundle exec jekyll build` を実行
5. ビルド完了後、`_site/` が CDN に配信される（通常 1〜2分）

**ローカルでの Jekyll ビルドは通常不要**（Netlify で自動ビルドされる）。
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

## Netlify ダッシュボード

- **URL**: https://app.netlify.com/
- **サイト名**: `frolicking-bublanina-a90bb7`（実 URL）
- **環境変数**（Site settings → Environment variables）:
  - `GITHUB_CLIENT_ID` — Decap CMS の OAuth 用
  - `GITHUB_CLIENT_SECRET` — 同上
- **ビルドログ**: Deploys タブから確認可能

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

## Decap CMS の OAuth 設定

新しい PC でも OAuth 設定の変更は不要（GitHub OAuth App は既に設定済み）。

### GitHub OAuth App（変更が必要な場合のみ）

- **GitHub Settings → Developer settings → OAuth Apps**
- **Homepage URL**: `https://frolicking-bublanina-a90bb7.netlify.app`
- **Authorization callback URL**: `https://frolicking-bublanina-a90bb7.netlify.app/.netlify/functions/auth-callback`
- **Client ID / Client Secret**: Netlify の環境変数に設定済み

カスタムドメイン (`kmukawa.jp`) を設定後は、上記 URL を新ドメインに合わせて更新する必要あり。

---

## トラブルシューティング

### ビルド失敗

- Netlify Deploys タブのログを確認
- よくある原因:
  - `_posts/` のファイル名が `YYYY-MM-DD-slug.md` 形式でない
  - Markdown 内の YAML front matter が不正
  - `Gemfile` の依存関係エラー

### CMS にログインできない

- Netlify の環境変数（`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`）が設定されているか確認
- GitHub OAuth App の callback URL が現在の Netlify URL と一致しているか確認
- ブラウザの開発者ツールでネットワークタブを開き、`/api/auth` のレスポンスを確認

### ローカルプレビューでスタイルが崩れる

- `_config.yml` の `baseurl: ""` が空であることを確認
- ブラウザの強制リロード（Ctrl+Shift+R）

### 記事を投稿したのに反映されない

- `_posts/` のファイル名と front matter の `date` が一致しているか確認
- ファイル名に日本語が含まれている場合は半角英数のスラッグに変更
- Netlify のビルドログでエラーが出ていないか確認

---

## バックアップ運用

- **コード**: GitHub にすべて push されているため、GitHub がバックアップを兼ねる
- **画像**: `images/` 配下も Git 管理されている
- **PDF**: `report/` 配下も Git 管理（重いファイルは要 Git LFS 検討）
- **CMS で作成した記事**: GitHub に commit されるため自動バックアップ
- **環境変数**: Netlify ダッシュボードでのみ管理。設定値は別途記録しておくこと
