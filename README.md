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

## Setup (DevContainer Recommended)
このプロジェクトは、環境構築の手間を省くために DevContainer の利用を推奨しています。
（手動でセットアップする場合は、Node.js, PostgreSQL, pgvector などを個別に用意してください）

1.  **Open in DevContainer**:
    VS Code でリポジトリを開き、DevContainer を起動します。
    *   初回起動時に `pnpm install` が自動的に実行されます。

2.  **Environment Setup**:
    `.env.example` をコピーして `.env` を作成し、環境変数を設定します。
    ```bash
    cp .env.example .env
    ```
    *   `GEMINI_API_KEY` を設定してください。
    *   `DATABASE_URL` はデフォルトのままで動作します。

3.  **Database Setup**:
    DBコンテナは自動で起動しています。以下のコマンドでテーブルを作成（スキーマ反映）します。
    ```bash
    pnpm drizzle:push
    ```

4.  **Run Development Server**:
    ```bash
    pnpm dev
    ```

## License
**GNU Affero General Public License v3.0 (AGPL-3.0)**
Copyright (c) 2025 tai-cha.

See [LICENSE](./LICENSE) for details.
