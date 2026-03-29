# むかわ けい 公式ホームページ

## ファイル構成

```
kmukawa-website/
├── index.html        ← トップページ
├── profile.html      ← プロフィール
├── policy.html       ← 重点政策
├── activity.html     ← 議会活動
├── blog.html         ← ブログ（旧Wixサイトへのリンク）
├── contact.html      ← お問い合わせ
├── support.html      ← ご支援のお願い
├── css/
│   └── style.css     ← スタイルシート
├── js/
│   └── main.js       ← JavaScript
└── images/           ← 写真フォルダ（下記参照）
```

## 写真の追加方法

`images/` フォルダに以下のファイルを配置してください：

| ファイル名 | 用途 | 推奨サイズ |
|---|---|---|
| `hero.jpg` | トップページのヒーロー写真 | 600×800px以上（縦長） |
| `profile.jpg` | プロフィール写真 | 400×500px以上（縦長） |

## お問い合わせフォームの設定

`contact.html` の以下の部分を書き換えてください：

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### 手順：
1. https://formspree.io/ でアカウント作成（無料）
2. 「New Form」を作成
3. 表示されたフォームID（例：`xrgvabcd`）を上記の `YOUR_FORM_ID` に貼り付け

## GitHub Pages 公開手順

1. GitHubでリポジトリを作成（例：`kmukawa-website`）
2. このフォルダの中身をすべてアップロード
3. Settings → Pages → Branch: main / /(root) → Save
4. `https://gikai044.github.io/kmukawa-website/` で公開される

## ドメイン設定（kmukawa.com）

GitHub PagesにDNSを向ける手順：

1. Wixのドメイン管理画面でDNSを編集
2. 以下のDNSレコードを設定：
   - `A` レコード: `@` → `185.199.108.153`
   - `A` レコード: `@` → `185.199.109.153`
   - `A` レコード: `@` → `185.199.110.153`
   - `A` レコード: `@` → `185.199.111.153`
   - `CNAME` レコード: `www` → `gikai044.github.io`
3. GitHubリポジトリの Settings → Pages → Custom domain に `kmukawa.com` を入力
4. DNS反映まで最大48時間かかります
