---
trigger: always_on
---

# Project Context: AI Mental Care & Life Log App (Self-Hosted)

## 1. Project Overview
ユーザーに寄り添う、CBT（認知行動療法）ベースのメンタルケア兼ライフログアプリ。
**「最小限の工数で、最大のQoL向上（実用性）」**を目指す。

## 2. Core Concept & UX Philosophy
* **Purpose:** 思考の整理、認知の歪みの修正、ポジティブ/ネガティブな感情の記録。
* **Target User:** メンタルケアを必要とするユーザー。
* **UX Principles:**
    * **Low Friction:** 入力までの手数は最小限に。
    * **Hide Complexity:** 裏側は高機能（RAG等）でも、UIはシンプルに。

## 3. Technical Stack (Strict)
このプロジェクトでは以下の技術スタックを厳守すること。
* **Framework:** Nuxt 3 (Full Stack / Universal Rendering)
* **Language:** TypeScript (Strict Mode)
* **Database:** PostgreSQL 16+ with `pgvector` extension
* **ORM:** **Drizzle ORM**
    * *Driver:* `postgres` (postgres.js) - for maximum performance.
    * *Vector Support:* Use `drizzle-orm/pg-core` vector type.
* **AI (LLM):** Google Gemini 2.5 Flash API (via Google AI Studio Free Tier)
    * *Role:* Chat generation, CBT interaction.
    * *Constraint:* Handle Rate Limits (15 RPM) gracefully.
* **AI (Embedding):** Transformers.js (`@xenova/transformers`)
    * *Model:* `Xenova/multilingual-e5-small` (Run locally on Node.js CPU)
    * *Role:* Vectorize diary entries for RAG. Do NOT use external Embedding APIs.
* **Infrastructure:**
    * *Dev:* DevContainer (VS Code / Antigravity) on local PC.
    * *Prod:* Home Workstation (Docker Compose) exposed via Cloudflare Tunnel.

## 4. Architecture: "The Monolithic Nuxt"
Nuxt 3のサーバー機能(`server/api`)を最大限活用し、Node.js単一プロセスで完結させる。Pythonコンテナは使用しない。

```marmaid
graph TD
    User[Browser] -->|HTTPS| Nuxt[Nuxt 3 App]
    subgraph "Nuxt Server Engine (Nitro)"
        API[API Routes /server/api]
        Embed[Transformers.js (Local CPU)]
        DB_Client[Drizzle Client]
    end
    
    Nuxt --> API
    API -->|Text| Embed
    Embed -->|Vector| API
    API -->|SQL + Vector Search| DB[(PostgreSQL + pgvector)]
    API -->|Chat Context| Gemini[Gemini 2.5 Flash API]
```

## 5. Implementation Roadmap (MVP)

### Phase 1: Hello Gemini (Dev Environment Setup)
* DevContainer setup (Node.js, Git).
* Nuxt 3 init.
* Setup Drizzle ORM (installation, config `drizzle.config.ts`).
* *Goal:* Ensure API connectivity and Drizzle Studio functionality.

### Phase 2: "Private" Life Log (Local Embedding)
* Setup PostgreSQL + pgvector via Docker Compose.
* Define Schema in Drizzle (`server/db/schema.ts`):
    * `journal_entries` table with `vector(384)` column.
* Implement Drizzle migration generation & push.
* Integrate Transformers.js to convert text to vector on save.
* *Goal:* Store logs securely with vector data using Drizzle.

### Phase 3: RAG Implementation (The "Memory")
* Implement vector search logic using Drizzle's `sql` operator (Cosine Similarity `<=>`).
* Construct prompt: `System Instruction + Relevant Past Logs + Current Input`.
* *Goal:* AI understands context ("As I wrote last week...").

## 6. Development Rules for AI Assistant
1.  **Code Style:**
    * Use Composition API (`<script setup lang="ts">`).
    * Ensure Type Safety for API responses.
2.  **Drizzle Specifics:**
    * Use `drizzle-kit` for schema management.
    * Use `postgres.js` as the driver.
    * Explicitly define relationships in `schema.ts`.
    * Use `sql` template tag for vector similarity queries.
3.  **Privacy First:**
    * Embeddings MUST be generated locally.
4.  **Simplicity:**
    * Prioritize "working MVP" over complex abstractions.