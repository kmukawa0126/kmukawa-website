# CMS_AUTH_CLOUDFLARE.md — Decap/Sveltia CMS の OAuth を Cloudflare Worker へ移行

最終更新: 2026-05-31

## なぜこの作業をするのか（背景）

- 本番サイト **kmukawa.jp は GitHub Pages で配信**されている（`Server: GitHub.com`）。Netlify ではない。
- ブログ編集 GUI（`/admin/` = Sveltia CMS）の **GitHub ログインだけが Netlify Functions 上の OAuth プロキシ**に依存していた。
- その Netlify プロジェクトが「300クレジット超過」で **2026-05-30 にサスペンド（503）** → **CMS ログインが不能**になった（公開サイトは無事）。
- GitHub Pages には Functions が無いため、OAuth プロキシを **Cloudflare Worker（無料）** に載せ替える。
- 公式実装 **[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)** を使う（CSRF対策・HttpOnly Cookie・origin限定 postMessage 済みで、旧自前実装より安全）。

**この作業で DNS は一切変更しません。** リスクは極小です。

---

## 全体像（5ステップ）

```
1. Cloudflare に sveltia-cms-auth Worker をデプロイ        … Worker URL が決まる
2. GitHub OAuth App の callback を Worker の /callback に更新 … Client ID / Secret 入手
3. Worker に env (CLIENT_ID/SECRET/ALLOWED_DOMAINS) を設定
4. admin/config.yml の base_url を Worker URL に差し替え → commit & push
5. /admin/ でログイン検証 → OK なら Netlify プロジェクトを停止/削除（課金根絶）
```

---

## ステップ 1: Worker をデプロイ

どちらか一方でOK。**A（ワンクリック）が最速。**

### A. ワンクリックデプロイ（推奨）
1. https://github.com/sveltia/sveltia-cms-auth を開く
2. README の **"Deploy to Cloudflare Workers"** ボタンを押す
3. Cloudflare（kmukawa0126 アカウント）でログイン → テンプレートから自分の GitHub にリポジトリが作られ、Worker がデプロイされる
4. デプロイ後の **Worker URL** を控える（例: `https://sveltia-cms-auth.<subdomain>.workers.dev`）

### B. ローカルから wrangler でデプロイ（現場アプリと同じ手順）
```powershell
git clone https://github.com/sveltia/sveltia-cms-auth.git
cd sveltia-cms-auth
npm install
npx wrangler deploy
```
→ 出力に表示される `https://....workers.dev` が Worker URL。

> 💡 現場工程管理アプリで Cloudflare/wrangler を使用済みなので、B も問題なく実行できます。

---

## ステップ 2: GitHub OAuth App の callback を更新

GitHub → **Settings → Developer settings → OAuth Apps**

既存の OAuth App（旧 Netlify 用）を**再利用**します:
- **Homepage URL**: `https://kmukawa.jp`
- **Authorization callback URL**: `https://<Worker URL>/callback`
  - 例: `https://sveltia-cms-auth.<subdomain>.workers.dev/callback`
- **Client ID** を控える
- **Client secret** は値が分かれば再利用、不明なら **"Generate a new client secret"** で再発行して控える

> ⚠️ 旧 callback（`.../.netlify/functions/auth-callback`）は不要になります。上書きして構いません。
> 既存 App が見つからない/迷う場合は **新規 OAuth App** を作っても可（Homepage=`https://kmukawa.jp` / Callback=`https://<Worker URL>/callback`）。

---

## ステップ 3: Worker に環境変数（シークレット）を設定

Cloudflare ダッシュボード → Workers & Pages → 該当 Worker → **Settings → Variables and Secrets**、
または wrangler でも可。**Secret は必ず "Encrypt" 指定**。

| 変数名 | 値 | 種別 |
|--------|-----|------|
| `GITHUB_CLIENT_ID` | ステップ2の Client ID | Plaintext可 |
| `GITHUB_CLIENT_SECRET` | ステップ2の Client secret | **Secret（暗号化）** |
| `ALLOWED_DOMAINS` | `kmukawa.jp` | Plaintext |

wrangler の場合:
```powershell
npx wrangler secret put GITHUB_CLIENT_SECRET   # プロンプトに secret を貼り付け
# CLIENT_ID と ALLOWED_DOMAINS は wrangler.toml の [vars] でも可
```

設定後、Worker を再デプロイ（または保存で自動反映）。

---

## ステップ 4: admin/config.yml を差し替えて push

このリポジトリの `admin/config.yml` は既に下記の状態に編集済み（base_url がプレースホルダ）:

```yaml
backend:
  name: github
  repo: kmukawa0126/kmukawa-website
  branch: main
  base_url: https://REPLACE-WITH-YOUR-WORKER.workers.dev   # ← ここを実URLに
```

1. `base_url` を **ステップ1の実 Worker URL** に書き換える（末尾に `/` は付けない）
2. commit & push:
```powershell
git add admin/config.yml
git commit -m "fix: CMS OAuth を Cloudflare Worker に移行 (Netlifyサスペンド対応)"
git push origin main
```
3. GitHub Pages が 1〜2分で再ビルド・反映

---

## ステップ 5: ログイン検証 → Netlify 廃止

### 検証
1. `https://kmukawa.jp/admin/` を開く
2. 「GitHub でログイン」→ ポップアップで GitHub 認可 → 編集 UI が出れば成功
3. 失敗時は「トラブルシューティング」参照

### Netlify プロジェクト停止/削除（課金・サスペンドメール根絶）
ログインが確認できたら:
1. https://app.netlify.com/ → サイト `frolicking-bublanina-a90bb7`
2. **Site configuration → Build & deploy → Stop builds**（GitHub 連携の自動ビルドを解除）
   - これで以後クレジット消費・サスペンドメールが止まる
3. 完全に不要なら **Site configuration → Danger zone → Delete this site**
4. （任意）リポジトリの Netlify 残骸を削除:
   ```powershell
   git rm netlify.toml
   git rm -r netlify/functions
   git commit -m "chore: Netlify 残骸を削除 (Cloudflare Worker へ移行済)"
   git push origin main
   ```
   ※ GitHub Pages はこれらを無視するため削除して安全。履歴に残るので復元も可能。

---

## トラブルシューティング

| 症状 | 確認点 |
|------|--------|
| ログインポップアップが即閉じ/無反応 | `base_url` が実 Worker URL か（プレースホルダのままでないか）。末尾 `/` を付けていないか |
| `CSRF_DETECTED` | Cookie がブロックされていないか（ブラウザのサードパーティ Cookie 設定）。再度ログインし直す |
| `redirect_uri mismatch` (GitHub画面) | OAuth App の callback が `https://<Worker URL>/callback` と完全一致しているか |
| ログイン後に編集UIが出ない | `ALLOWED_DOMAINS=kmukawa.jp` が設定されているか。Worker の env と再デプロイを確認 |
| token 交換失敗 | `GITHUB_CLIENT_SECRET` が正しく Secret 設定されているか（再発行した場合は新しい値か） |

---

## 補足: GitHub Pages の帯域ソフト上限について（任意の後続対策）

- GitHub Pages 無料枠には **月100GB のソフト帯域上限** がある。
- 現状 `report/`（PDF 18MB）+ `images/`（16MB）が重い。`robots.txt` で AI bot は遮断済みだが、
  **GitHub Pages は `_headers`（Cache-Control）を無視する**ため 5/25 のキャッシュ対策は GitHub Pages 上では効いていない。
- もし将来 GitHub Pages でも帯域警告が出たら、`report/` の PDF を **Cloudflare R2**（現場アプリで使用中・無料15GB）へ移動し
  `newsletter.html` のリンクを R2 URL に差し替えるのが最も効果的（このリポジトリから 18MB が消える）。
- 現時点では緊急性なし。Netlify と違い GitHub Pages はサスペンドではなく throttle 中心で、議員サイト規模なら 100GB は当面十分。
