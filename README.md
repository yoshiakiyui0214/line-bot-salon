# line-bot-salon

美容室向けのLINE公式アカウントBotです。お客様がLINEで質問を送ると、店舗が事前に登録した
FAQをもとに、Claude(Anthropic)がその場で回答を生成して自動返信します。回答の確信度が
低い場合はオーナーへ自動でLINE通知が届き、店舗運営者向けの管理画面からFAQ・メニュー・
お知らせ配信・会話ログを一括管理できます。

**公開URL:** https://line-bot-salon-six.vercel.app

[ここにトップページ or LINEでの実際のやり取りのスクリーンショット]

---

## 主な機能

- **FAQ自動応答**
  お客様からのLINEメッセージに対し、登録済みFAQのみを根拠にClaudeが回答を生成。
  FAQに無い内容は推測で答えず、店舗への問い合わせ案内を返す設計。

  [ここにLINEトーク画面のスクリーンショット]

- **回答の確信度判定 & オーナー自動通知**
  回答ごとに確信度(高・中・低)をAIが自己判定し、「低」と判定された場合は
  即座にオーナーのLINEへプッシュ通知。回答漏れ・誤答に気付きやすい仕組み。

  [ここに通知メッセージのスクリーンショット]

- **管理画面(オーナー向け・Basic認証)**
  - FAQ管理(追加・編集・削除・公開/非公開切り替え)
  - メニュー・料金管理
  - お知らせ一斉配信(送信前の確認ステップ・配信履歴あり)
  - 会話ログ閲覧(お客様ごとのやり取りと確信度を確認可能)

  [ここに管理画面のスクリーンショット]

---

## 使った技術

| 分類 | 技術 |
|---|---|
| フレームワーク | [Next.js 16](https://nextjs.org/)(App Router / Turbopack) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| AI | [Anthropic Claude API](https://www.anthropic.com/)(`claude-sonnet-5`、JSON Schema出力・プロンプトキャッシュ利用) |
| データベース | [Supabase](https://supabase.com/)(Postgres) |
| メッセージング | [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/) |
| ホスティング | [Vercel](https://vercel.com/) |
| ローカル検証 | ngrok(LINE Webhookのローカル疎通確認用) |

### 設計のポイント

- **ハルシネーション対策**: BotはFAQに書かれた内容のみを根拠に回答するようシステム
  プロンプトで制約し、さらに確信度を自己申告させることで、誤情報の見逃しをオーナー通知で
  補足する二段構えにしている。
- **署名検証**: LINEからのWebhookは `x-line-signature` をHMAC-SHA256でタイミングセーフに検証。
- **管理画面**: REST APIを介さず、Next.jsのServer Actionsでフォーム送信を直接処理。
  `/admin` 配下はミドルウェア(`proxy.ts`)でBasic認証を一括適用。

技術的な詳細(API仕様・DB設計・外部サービス連携図)は [docs/technical-doc.md](./docs/technical-doc.md) にまとめています。

---

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [docs/setup-guide.md](./docs/setup-guide.md) | ゼロから環境構築する手順(必要なツール・環境変数・ローカル起動・Vercelデプロイ) |
| [docs/technical-doc.md](./docs/technical-doc.md) | API仕様・DB設計・外部サービス連携図(エンジニア引き継ぎ用) |
| [docs/operation-manual.md](./docs/operation-manual.md) | 店舗オーナー向けの操作マニュアル(FAQ追加・お知らせ配信など) |

---

## ローカルでの動かし方(概要)

詳しい手順は [docs/setup-guide.md](./docs/setup-guide.md) を参照してください。

```bash
npm install
cp .env.example .env.local   # 値はSupabase / LINE Developers / Anthropic Consoleから取得して入力
npm run dev
```

`http://localhost:3000/admin` で管理画面(Basic認証)、`http://localhost:3000/api/line/webhook`
がLINE Webhookの受け口です。LINEから実際にメッセージを試すにはngrok等でのローカル公開が必要です。
