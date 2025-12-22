# Project Roadmap (Awarefly Clone)

## Done (Phase 1)
- [x] **Smart Journaling**: Text input, Mood Score (1-10).
- [x] **AI Analysis**: Auto-tagging, Cognitive Distortion detection, Quick Advice.

## Phase 2: History & Reflection (Next)
**Goal**: 過去のログを振り返り、自己理解を深める。

1. **History List & Calendar View** (High Priority)
   - 日別・週別・月別でのログ表示。
   - カレンダーでの視覚的振り返り。
   
2. **Search & Filter**
   - 「白黒思考」などのタグで過去ログを検索。

   - [x] **Search & Filter**
   - 「白黒思考」などのタグで過去ログを検索。

## Phase 2.5: Localization (i18n)
**Goal**: 日本語化対応と将来的な多言語対応の基盤作り。
1. **Nuxt I18n Setup**
   - `@nuxtjs/i18n` の導入。
   - 既存テキストの外部ファイル化 (`locales/ja.json`)。

## Phase 3: Insights & Visuals
**Goal**: データの傾向を可視化し、バイオリズムを知る。

- **Mood Chart**: 感情グラフ。
- **Distortion Stats**: 認知の歪み傾向分析。

## Phase 4: AI Partner
**Goal**: 対話による深掘り。

- **RAG Chat**: 過去の記憶を持つAIとの対話。

## Phase 5: Enhanced CBT & Memory
**Goal**: CBTアプリとしての本質的価値「構造化と洞察」を深める。（旧Phase 6を格上げ）

- **Structured Journaling (AI Decomposition)**: 入力は「自由記述」のまま（継続コスト重視）、分析時にAIが「事実（出来事）」と「解釈（思考・感情）」を切り分けてフィードバックする。ユーザーは書き分ける負担なく、CBT的な気づき（認知の区別）を事後的に得られるようにする。
- **Smart Advice**: 日記分析時に、類似した過去の記録（RAG）をコンテキストに含めて、より深い洞察とアドバイスを提供する。

## Phase 6: Routine & Self-Care
**Goal**: 生活リズムの安定化。

- **Meditation Timer**: 簡易的な瞑想タイマーと記録。
- **Check-in**: 定型質問による朝夜の振り返り。

## Phase 7: Innovation & Renovation
**Goal**: アーキテクチャの刷新とマルチユーザー対応。

- **User Authentication**: 認証機能（Auth.js等）の導入。
- **Multi-tenancy**: ユーザー概念の追加（`user_id` 連携）により、プロファイル切り替えや公開サーバーでのセキュアな個人利用を可能にする。（※不特定多数への公開ではなく、あくまでセキュアな自己利用・家族利用を想定）
- **Admin Initialization**: 環境変数 (`INIT_ADMIN_PASSWORD`) による初期管理者アカウント作成機能。
- **Registration Control**: 管理者による新規ユーザー登録の許可/停止設定（基本は招待制・閉鎖運用）。
- **Feature Toggles**: 機能ごとの有効/無効設定。全体設定（Global Default）とユーザー個別上書き（User Override: Default/On/Off）の2段階構成にし、「特定の家族にはチャットも許可する」といった柔軟な運用を可能にする。
