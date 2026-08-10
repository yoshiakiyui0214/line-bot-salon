# セットアップ手順書(開発者向け)

このドキュメントは、このプロジェクトを新しく開発する人が、ゼロから環境構築して
ローカルで動かし、Vercelにデプロイできるようになるための手順書です。

対象読者はエンジニアを想定しています。オーナー様(店舗運営者)向けの操作説明は
[docs/operation-manual.md](./operation-manual.md) を参照してください。

---

## 1. プロジェクト概要

Next.js 16(App Router)で作られた、美容室向けLINE公式アカウントBotです。

- `app/api/line/webhook` — LINEからのメッセージを受け取るWebhook
- `app/admin` — FAQ・メニュー・お知らせ配信などを管理するオーナー向け管理画面(Basic認証)
- `lib/claude.ts` — Claude APIを使ってFAQをもとに回答を生成
- `lib/supabase/*` — Supabase(Postgres)へのデータアクセス
- `proxy.ts` — Next.js 16のミドルウェア相当。`/admin` 配下にBasic認証をかける

Next.js 16は破壊的変更が多いバージョンです。ルーティングやデータ取得のAPIで
迷ったら、まず `node_modules/next/dist/docs/` 内のドキュメントを確認してください
(詳細は `AGENTS.md` を参照)。

---

## 2. 必要なツール・アカウント

### ローカルにインストールするもの

| ツール | バージョン目安 | 用途 |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20.9以上(推奨: 最新LTS) | Next.jsの実行に必要 |
| npm | Node.jsに同梱 | パッケージ管理 |
| [Git](https://git-scm.com/) | 任意 | ソース管理 |
| [ngrok](https://ngrok.com/) | 任意 | ローカルサーバーをLINEから叩けるように公開する(ローカルでBotの動作確認をする場合に必要) |

### 用意しておくアカウント

| アカウント | 用途 |
|---|---|
| GitHub | このリポジトリへのアクセス |
| [Vercel](https://vercel.com/) | 本番デプロイ先 |
| [Supabase](https://supabase.com/) | データベース(FAQ・メニュー・会話ログなど) |
| [LINE Developers](https://developers.line.biz/) | Messaging APIチャネル(Bot本体) |
| [Anthropic Console](https://console.anthropic.com/) | Claude APIキー(Botの回答生成) |
| ngrok | ローカル動作確認用の公開URL発行(アカウント登録してauthtokenを取得) |

---

## 3. リポジトリの取得と依存パッケージのインストール

```bash
git clone https://github.com/yoshiakiyui0214/line-bot-salon.git
cd line-bot-salon
npm install
```

---

## 4. Supabaseのセットアップ

1. [Supabase](https://supabase.com/) で新しいプロジェクトを作成します。
2. 以下の4つのテーブルを作成します(SQL Editorで実行するのが簡単です)。

   > このリポジトリには現時点でマイグレーションファイル(`supabase/`ディレクトリ)が
   > 含まれていません。以下のSQLは `lib/supabase/types.ts`(実際のスキーマから
   > 生成された型定義)をもとに再構成したものです。実行前に内容を確認してください。

   ```sql
   create extension if not exists "pgcrypto";

   create table faq (
     id uuid primary key default gen_random_uuid(),
     question text not null,
     answer text not null,
     category text,
     display_order integer,
     is_active boolean not null default true,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   create table menus (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     category text,
     price integer not null,
     duration_minutes integer not null,
     description text,
     display_order integer,
     is_active boolean not null default true,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   create table conversations (
     id uuid primary key default gen_random_uuid(),
     line_user_id text not null,
     role text not null,
     message text not null,
     message_type text not null default 'text',
     metadata jsonb,
     created_at timestamptz not null default now()
   );

   create table broadcasts (
     id uuid primary key default gen_random_uuid(),
     message text not null,
     sent_at timestamptz not null default now()
   );

   -- アプリはservice roleキー経由(RLSをバイパス)でのみアクセスする想定。
   -- anonキーからの直接アクセスを防ぐため、RLSを有効化してポリシーなしにしておく。
   alter table faq enable row level security;
   alter table menus enable row level security;
   alter table conversations enable row level security;
   alter table broadcasts enable row level security;
   ```

3. Supabaseダッシュボードの **Project Settings → API** から、次の値を控えておきます(環境変数の設定で使います)。
   - Project URL
   - `anon` `public` キー
   - `service_role` キー(⚠️ 秘密情報。絶対にクライアント側コードや公開リポジトリに含めない)

---

## 5. LINE Messaging APIチャネルのセットアップ

1. [LINE Developers](https://developers.line.biz/) で Providerを作成(またははあれば既存のものを使用)し、
   Messaging APIチャネルを新規作成します。
2. チャネル基本設定(Basic settings)から **Channel secret** を控えます。
3. Messaging API設定(Messaging API)タブから **チャネルアクセストークン(長期)** を発行して控えます。
4. 同じタブの **Webhook設定** で「Webhookの利用」をONにします(URLはこのあとの手順で設定します)。
5. LINE公式アカウント機能の「応答メッセージ」「あいさつメッセージ」は、Botの返信と競合しないようLINE Official Account Managerでオフにしておくことをおすすめします。
6. オーナー(低確信度の回答を通知したい相手)のLINEユーザーIDを控えます。複数人いる場合はカンマ区切りで環境変数に設定します。

---

## 6. Anthropic APIキーの取得

[Anthropic Console](https://console.anthropic.com/) → API Keys から新しいキーを発行します。

---

## 7. 環境変数一覧

`.env.example` をコピーして `.env.local` を作成し、値を埋めます。

```bash
cp .env.example .env.local
```

| 変数名 | 取得元 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase ダッシュボード → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase ダッシュボード → Project Settings → API → `anon` `public` キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase ダッシュボード → Project Settings → API → `service_role` キー(取り扱い注意) |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers → Messaging API設定 → チャネルアクセストークン(長期)を発行 |
| `LINE_CHANNEL_SECRET` | LINE Developers → チャネル基本設定 → Channel secret |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |
| `LINE_OWNER_USER_ID` | 通知を受け取りたいオーナーのLINEユーザーID(複数はカンマ区切り) |
| `ADMIN_BASIC_AUTH_USER` | 任意で決める(管理画面 `/admin` のBasic認証ユーザー名) |
| `ADMIN_BASIC_AUTH_PASSWORD` | 任意で決める(管理画面 `/admin` のBasic認証パスワード。推測されにくいものにする) |

`.env.local` は `.gitignore` によりコミット対象外です。値を書いたファイルをコミットしたり、
Slackなどに直接貼り付けたりしないでください。

---

## 8. ローカルでの起動方法

### 8-1. アプリを起動する

```bash
npm run dev
```

`http://localhost:3000` で起動します。管理画面は `http://localhost:3000/admin`(Basic認証あり)です。

この時点で管理画面の動作確認やUI開発は可能ですが、LINEからのメッセージを実際に
受け取るには、ローカルサーバーをインターネットに公開する必要があります(次項)。

### 8-2. ngrokでローカルサーバーを公開する

```bash
ngrok http 3000
```

表示された `https://xxxx.ngrok-free.dev` のようなURLをコピーします。

### 8-3. LINEのWebhook URLをngrokのURLに向ける

LINE Developersコンソールの **Messaging API設定 → Webhook URL** に

```
https://xxxx.ngrok-free.dev/api/line/webhook
```

を設定し、「検証」ボタンで疎通確認します。

コンソール操作の代わりに、Messaging APIを直接叩いて更新することもできます
(`LINE_CHANNEL_ACCESS_TOKEN` が必要です)。

```bash
curl -X PUT https://api.line.me/v2/bot/channel/webhook/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LINE_CHANNEL_ACCESS_TOKEN" \
  -d '{"endpoint":"https://xxxx.ngrok-free.dev/api/line/webhook"}'
```

疎通確認:

```bash
curl -X POST https://api.line.me/v2/bot/channel/webhook/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LINE_CHANNEL_ACCESS_TOKEN" \
  -d '{"endpoint":"https://xxxx.ngrok-free.dev/api/line/webhook"}'
```

`"success":true` が返れば、LINEからローカル環境まで通信が届く状態になっています。

> ngrokは再起動するたびにURLが変わります(無料プランの場合)。再起動したら
> Webhook URLの再設定を忘れずに行ってください。

---

## 9. Vercelへのデプロイ手順

### 9-1. コードをGitHubにpush

```bash
git push origin main
```

### 9-2. Vercelでプロジェクトをインポート

1. https://vercel.com/new を開く
2. GitHubと連携し、このリポジトリ(`line-bot-salon`)をImport
3. Framework Presetは自動で「Next.js」が検出されるので、ビルド設定はデフォルトのままでOK

### 9-3. 環境変数を登録

Vercelの Project Settings → Environment Variables に、[6. 環境変数一覧](#7-環境変数一覧)の9つを登録します。
Production / Preview の両方に設定しておくと、プレビューデプロイでも動作確認ができます。

### 9-4. デプロイ

Import時に自動でデプロイが走ります。以後は `main` ブランチにpushするたびに自動で再デプロイされます。
発行された本番URL(例: `https://line-bot-salon-six.vercel.app`)を控えます。

### 9-5. LINEのWebhook URLを本番URLに変更

8-3と同じ手順で、今度はngrokのURLの代わりに本番URLを設定します。

```bash
curl -X PUT https://api.line.me/v2/bot/channel/webhook/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LINE_CHANNEL_ACCESS_TOKEN" \
  -d '{"endpoint":"https://<本番ドメイン>/api/line/webhook"}'
```

### 9-6. 動作確認

- `https://<本番ドメイン>/api/line/webhook` へのWebhookテストが成功すること
- `https://<本番ドメイン>/admin` を開き、Basic認証(`ADMIN_BASIC_AUTH_USER`/`ADMIN_BASIC_AUTH_PASSWORD`)でログインできること
- LINE公式アカウントを実際に友だち追加し、メッセージを送って返信が来ること

---

## 10. よくあるつまずきポイント

- **`Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars` エラー**
  `.env.local`(ローカル)またはVercelの環境変数が未設定・タイプミスです。
- **LINEからの応答がない**
  Webhook URLの設定漏れ、LINE Developersで「Webhookの利用」がOFF、
  ngrokの再起動によるURL変更、のいずれかが多いです。
- **「メニュー・料金管理」で登録した内容がBotの回答に反映されない**
  現状の実装では、Botの回答は `faq` テーブルの内容のみを参照します
  (`lib/claude.ts` / `app/api/line/webhook/route.ts` を参照)。`menus` テーブルは
  管理画面上の一覧表示にのみ使われており、Botの回答生成には使われていません。
  料金などをBotに答えさせたい場合は、FAQとしても登録する必要があります。
- **`/admin` にアクセスできない**
  Basic認証の環境変数が未設定だと500エラーになります(`proxy.ts` 参照)。

---

_最終更新: 2026-08-10_
