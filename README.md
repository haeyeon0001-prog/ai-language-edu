# AI ✖️ 言語教育・言語学習

語学教員のための AI 活用情報サイト — 白海燕 博士（学術）

## About

大学で中国語・韓国語・日本語を教える教員が、AI を活用して教育の効率化を図る実践を共有するサイトです。

## Setup

`index.html` をブラウザで開くだけで動作します。  
GitHub Pages を有効にすれば、そのまま公開サイトとして使えます。

## GitHub Pages で公開する手順

1. リポジトリの **Settings** → **Pages** を開く
2. Source を **Deploy from a branch** に設定
3. Branch を **main** / **(root)** に設定して Save
4. 数分後に `https://<username>.github.io/ai-language-education/` で公開されます

## 多言語ページ（EN / KO / ZH）

`en.html`・`ko.html`・`zh.html` は `index.html`（日本語）から自動生成しています。直接編集しないでください。

1. `index.html` を編集する
2. 文章を変えた・追加した場合は、`i18n/build.py` の翻訳表に同じ文と訳を追加する
3. `python3 i18n/build.py` を実行する（翻訳漏れがあると警告が出ます）

## 教科書連動アプリのログイン（account/）

`account/` はログイン機能の元ファイルです。次の3つのアプリのリポジトリに同じものをコピーして使っています。

- 3c2k3hwuhu（韓国語 料理編）
- chinese-cuisine（中国語 料理編）
- kanji55-practice（漢字から広がる韓国語の世界）

各アプリの全ページの `<head>` で `account/gate.js` を読み込んでいます。未ログイン、または氏名・所属が未登録の人は `account/login.html` に移動します。

- ログイン方法：メールに届くリンク（Firebase Authentication のメールリンク。Blaze プランが必要）
- 登録情報：Firestore の `users/{uid}` に保存（email・name・affiliation）
- `firebase-config.js` が `null` のあいだは、ログイン確認をせず誰でも開けます
- Firestore のルールは `account/firestore.rules` の内容を Firebase コンソールに貼り付けます
- アプリのページを作り直して上書きした場合は、`<head>` の次の2行を戻してください（パスはページの階層に合わせる）

```html
<style id="bhy-gate">html{visibility:hidden}</style>
<script type="module" src="account/gate.js"></script>
```
