# HISTORY.md — 制作経緯・Wix移行の意思決定

## 背景: なぜ移行したか

**旧サイト（kmukawa.com）**は Wix の有料プランで運用していたが、以下の課題があった：

1. **コスト負担**: Wix の有料プラン継続費用
2. **編集制約**: HTML/CSS の自由度が低く、技術的なカスタマイズが困難
3. **ブログ移植の壁**: 500本以上の記事が Wix 独自形式で蓄積されており、フル移植は非現実的

## 移行方針: B+C 方式

完全移植ではなく、**「旧ブログは残す・新サイトは新規でビルド」** の B+C 方式を採用：

- **B**: 旧ブログ（500本以上）は Wix の無料プランに格下げして wixsite.com の URL で存続
- **C**: 新サイトに旧記事への明示リンクを設置しつつ、今後の新記事は新サイトに発信

**理由**: SEO の蓄積を失わずに、新サイトで自由度の高い発信に切り替えるため。

## ドメイン戦略: kmukawa.com → kmukawa.jp

当初は `kmukawa.com` を新サイトに移管する計画だったが、**方針変更**：

- **新ドメイン**: `kmukawa.jp`（お名前.comで取得予定）
- **旧ドメイン `kmukawa.com`**: Wix で旧ブログを存続させるために維持

### kmukawa.com 移管試行の経緯

1. **1回目の申請（2026-03-30以前）** → **不受理**
   - 原因: Whois 情報の住所が不正確だった
2. **Wix 側で Whois 住所情報を修正済み**
3. **再申請 URL**: https://www.onamae.com/service/d-transfer/
4. **AuthCode**: `H8prEcVox\2d`（必要時に使用）
5. **費用**: 1,012円 + 250円（サービス維持調整費）
6. **その後の判断**: 移管デメリット（旧ブログ500本のSEO損失）が大きいと判断 → 移管中止

### kmukawa.jp 採用の理由

- 新サイトは新規ドメインで育てる（旧サイトと完全分離）
- `.jp` の方が信頼性が高い（市議としての公式性を強調）
- 旧ブログ群は `kmukawa.com` または wixsite.com のままで SEO 損失を回避

## 技術スタック選定の経緯

### 初期構想: 静的HTML + GitHub Pages
- 当初は素の HTML/CSS/JS で GitHub Pages にホスティングする計画
- README.md にも当時の手順が残っている（DNS 設定など）

### 現状: Jekyll + Netlify + Decap CMS
理由：

1. **ブログ運用の継続性**: ブログを書き続けるには GUI 編集が必須
   → Decap CMS を導入
2. **Decap CMS の認証**: 旧 Netlify CMS Identity が終了
   → Netlify Functions で GitHub OAuth プロキシを自前実装
3. **静的サイト生成**: 記事を Markdown で書きたい
   → Jekyll を採用（GitHub Pages と互換性、Ruby ベース）
4. **ビルド・配信**: GitHub Pages では Functions が動かない
   → Netlify に切り替え（同じく無料、Functions 対応）

## 主要マイルストーン（git log より抜粋）

直近の commit から読み取れる作業履歴：

| 時期 | 内容 |
|------|------|
| 〜2026/3月 | 初期構築・Jekyll 化・Decap CMS 導入 |
| 2026/3月 | Netlify Functions 自前認証プロキシ実装（`5c5da18`） |
| 2026/3月 | `/admin/` と `/api/auth` のリダイレクト追加（`2140730`） |
| 2026/3月 | CMS の description フィールド追加・ブログ記事の description 充実 |
| 2026/3月末 | グリーンスローモビリティ式典・もえぎ台閉校の記事追加 |
| 2026/3月末 | ヒーローセクション 5 秒切替に変更（`dc6d0d6`） |
| 2026/3月末 | スマホ版ヒーロー各画像の背景位置調整（`0331f8a` 〜 `e6b4443`） |

## 完了済みの主な作業

- `index.html`: ヒーローセクションの議会登壇画像を `IMG_1358.PNG` に変更
- `blog/20260329/`: 3月定例会一般質問レポート記事を作成（緑の資産・教職員環境）
- `blog.html`: 最新記事へのリンク・サムネイル更新
- `css/style.css`: ブログ一覧サムネイルを2倍（240×160px）に拡大
- `contact.html`: Formspree の実際の Form ID（`mpqopyln`）を設定
- ブログ記事ページのパス修正（`../` → `../../`）
- Decap CMS の自前 OAuth プロキシ実装（Netlify Functions）

## 残タスク

詳細は CLAUDE.md ルート、および [project_wix_migration メモリ] に記載。要点のみ：

1. **`kmukawa.jp` の取得**（お名前.com）
2. **GitHub Pages 設定でカスタムドメインに `kmukawa.jp` を入力**（Netlify 主体に切り替えるかは要判断）
3. **`policy.html` と `blog.html` の旧 Wix リンク書き換え**
   - `https://www.kmukawa.com/post/...` → wixsite 無料 URL（移管完了後に確認）
   - `https://www.kmukawa.com/_files/...` → 同様または PDF を新サイトに移動
4. **Google Search Console** に `kmukawa.jp`（取得後）を登録 → サイトマップ送信
5. **Wix のサブスクリプション解約**（旧ブログを無料プランに切り替えてから）
6. **OGP 設定**（SNSシェア時のサムネイル）
7. **Favicon 設定**

## 学習済みの教訓

- **ドメイン移管は SEO 損失を伴う**: 500記事の蓄積を捨てるのは合理的でないため、旧ブログは残す方針が正解だった
- **Decap CMS の認証は自前で持つしかない**: Netlify Identity 終了により、OAuth プロキシを自前実装する必要がある
- **Jekyll の `_posts/` 命名規則は厳格**: ファイル名と front matter の日付が食い違うと記事が表示されない
