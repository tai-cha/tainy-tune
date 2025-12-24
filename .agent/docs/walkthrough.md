# System Walkthrough & Feature Guide

## 1. Core Journaling (Phase 1 & 5)
The core loop of the application is the structured journaling process.
- **Input**: "Low Friction" single-textarea input (`JournalForm`) supports Brain Dump style writing.
- **Shortcuts**: `Ctrl+Enter` (or `Cmd+Enter`) to quick submit.
- **AI Analysis**: 
    - **Fact/Emotion Decomposition**: AI automatically separates objective facts from subjective emotions/thoughts.
    - **Cognitive Distortions**: Automatically tags distortions (e.g., "All-or-Nothing", "Mind Reading").
    - **Smart Advice (RAG)**: AI provides CBT-based advice, referencing similar past entries to encourage insight.
    - **Mood Score**: Auto-estimated (1-10) but user-adjustable.

## 2. History & Reflection (Phase 2 & 3)
reviewing past entries to gain insights.
- **Dashboard**: `app/pages/index.vue` shows recent mood trends.
- **History List**: `app/pages/history.vue` lists all entries.
- **Search**: Full-text and Tag-based search allows filtering by specific cognitive distortions.
- **Insights**: `app/pages/insights.vue` visualizes:
    - **Mood Chart**: Line graph of mood over time.
    - **Distortion Chart**: Radar/Bar chart showing frequency of thinking patterns.

## 3. RAG Chat Partner (Phase 4)
Interactive deep-dive into the user's logs.
- **Thread Management**: Create, Rename, Pin, and Delete chat threads.
- **Context Awareness**: The AI has access to the user's journal entries (via Vector Search) to answer questions like "How was my sleep last month?".
- **Journal Integration**: "Discuss" button on any journal card opens a chat context specific to that entry.

## 4. Self-Care & Mindfulness (Phase 6)
"Low Friction" tools for immediate mental regulation.
- **One-Tap Check-in**: 5-scale mood selector for instant logging. Updates existing log if within 1 hour.
- **Mindfulness Timer**: Simple 1/3/5 min timer. Records "duration" as a separate success metric.
- **Unified Stats**: Mood Chart integrates both "Journal Entires" and "Check-ins" for a complete view of the user's state.

## 5. Technical Architecture
- **Framework**: Nuxt 3 (Universal Rendering).
- **Database**: PostgreSQL + `pgvector` (Drizzle ORM).
- **AI**: Gemini 2.5 Flash (via Google AI Studio).
- **Embeddings**: Local extraction via Transformers.js (Xenova/multilingual-e5-small) running on CPU.
- **i18n**: Fully localized (Japanese/English) via `@nuxtjs/i18n`.
- **PWA**: Fully offline-capable via `@vite-pwa/nuxt`. Installed as "Tainy Tune".

## 6. Authentication & Security (Phase 8)
Multi-user support for secure personal use.
- **Login**: Email/Password authentication via Better Auth.
- **Admin Setup**: First user created is Admin (seeded via `INIT_ADMIN_PASSWORD`).
- **Data Isolation**: All data (Journals, Chat, Vectors) is strictly isolated by `user_id`.
- **Session Management**: Secure session cookies with automatic expiration.
- **Route Protection**: 
    - Unauthenticated access to `/` shows the **Landing Page** (via dynamic layout switching).
    - Access to protected routes (e.g., `/journal`, `/history`) redirects to Login.
    - Navigation guards handle both client-side and server-side authentication checks.

### Verification of Multi-tenancy
Since the app defaults to single-admin mode, verifying data isolation requires creating a secondary user via CLI:
```bash
npx tsx scripts/create-user.ts test@local.host password "Test User"
```
Login as this new user to confirm they cannot see the Admin's data.
