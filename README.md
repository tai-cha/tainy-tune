# Tainy Tune: AI Mental Care & Life Log

ユーザーに寄り添う、CBT（認知行動療法）ベースのメンタルケア兼ライフログアプリ。
セルフホスト可能なWebアプリケーションです。

> [!CAUTION]
> **No Authentication / Security Warning**
> 本アプリケーションには現在、**ユーザー認証機能（ログイン機構）が実装されていません**。
> 公開サーバーにデプロイすると、誰でもデータにアクセス・操作できてしまいます。
>
> Cloudflare Tunnel などのアクセスコントロール外での**インターネット公開は絶対にしないでください**。
> 基本的には**開発用・テスト用**、またはセキュアな閉域網内での個人利用に限定してください。

## Features
*   **Life Log & Journaling**: 思考の整理、ポジティブ/ネガティブな感情の記録。
*   **AI Support**: Google Gemini 2.5 Flash を活用したCBTベースの対話とフィードバック。
*   **Privacy First**: ベクトル埋め込み（Embedding）をローカル（Transformers.js）で完結。データは全て自分のサーバー（PostgreSQL）に保存されます。
*   **RAG (Retrieval-Augmented Generation)**: 過去のログを文脈としてAIが参照し、長期的なケアを実現。

## Tech Stack
*   **Framework**: Nuxt 3 (Universal Rendering)
*   **Language**: TypeScript
*   **Database**: PostgreSQL 16+ (with `pgvector`)
*   **ORM**: Drizzle ORM
*   **AI**:
    *   LLM: Google Gemini 2.5 Flash API
    *   Embedding: Transformers.js (`Xenova/multilingual-e5-small`)

## Getting Started (Self-Hosting)

### Option 1: Docker Compose (Recommended)
`docker-compose.yml` が同梱されており、手軽に利用開始できます。

1.  **Environment Setup**:
    `.env.example` をコピーして `.env` を作成します。
    ```bash
    cp .env.example .env
    # .env を編集（GEMINI_API_KEYは必須、DATABASE_URLはローカルならそのままでOK）
    ```

2.  **Start Services**:
    ```bash
    docker compose up -d
    ```

3.  **Initialize Database**:
    初回のみ、テーブル作成（マイグレーション）が必要です。
    ```bash
    # コンテナ内のツールを使ってDB初期化
    docker compose exec app pnpm drizzle:push
    ```
    これで `http://localhost:3000` にアクセスできます。

### Option 2: Manual Setup
自分の環境（Node.js + PostgreSQL）で動かす場合。
*   **Requirements**: Node.js 20+, PostgreSQL 16+ (with `pgvector` extension)

1.  **Setup**:
    ```bash
    cp .env.example .env # DATABASE_URLを自分のPostgresに向ける
    pnpm install
    pnpm drizzle:push    # スキーマ反映
    pnpm build
    node .output/server/index.mjs
    ```

## Development
開発に参加する場合のセットアップです。

### DevContainer (Recommended for Devs)
VS Code の DevContainer を使えば、環境構築不要ですぐに開発を始められます。
1.  VS Code で "Reopen in Container"。
2.  `.env` を設定。
3.  `pnpm dev` で起動。

### Manual Setup
DevContainerを使わずに開発する場合。
1.  **Prerequisites**: Node.js 20+, PostgreSQL 16+ (pgvector必須)。
2.  **Setup**:
    ```bash
    cp .env.example .env
    pnpm install
    pnpm drizzle:push
    pnpm dev
    ```

## License
**GNU Affero General Public License v3.0 (AGPL-3.0)**
Copyright (c) 2025 tai-cha.

See [LICENSE](./LICENSE) for details.

