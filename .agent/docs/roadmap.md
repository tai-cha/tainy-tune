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

## Phase 6: Self-Care & Mindfulness
**Goal**: 自分のペースで心を整える（非強制・低摩擦）。

- [x] **Mindfulness Tools**:
    - 「やらなきゃ」を生まない、シンプルなタイマー（呼吸・瞑想）。
    - 記録は自動。中断してもOK。
- [x] **One-Tap Check-in**:
    - 「朝の調子はどう？」など、気が向いた時にワンタップで今の状態を記録。
    - 定型文入力すら面倒な時、AIアドバイスなしで純粋に記録のみを行う。

## Phase 7: Mobile Experience (PWA)
**Goal**: スマホでの利用体験を最適化し、セルフケア機能の価値を最大化する。

- **PWA Support**: `@vite-pwa/nuxt` の導入。
    - Manifest設定（ホーム画面追加時のアイコン・名称）。
    - Service Workerによるキャッシュ戦略（オフライン起動の高速化）。
- **Mobile UI Polish**:
    - タッチ操作に最適化されたUI調整（ボタンサイズ、セーフエリア対応）。

## Phase 8: Innovation & Renovation
**Goal**: アーキテクチャの刷新とマルチユーザー対応。

- [x] **User Authentication**: 認証機能（Better Auth）の導入。
- [x] **Multi-tenancy**: ユーザー概念の追加（`user_id` 連携）により、プロファイル切り替えや公開サーバーでのセキュアな個人利用を可能にする。（※不特定多数への公開ではなく、あくまでセキュアな自己利用・家族利用を想定）
- [x] **Admin Initialization**: 環境変数 (`INIT_ADMIN_PASSWORD`) による初期管理者アカウント作成機能。
- [x] **Admin Dashboard** (Management UI):
    - [x] **User List**: 登録ユーザー一覧の表示。
    - [x] **Registration Control**: 新規ユーザー登録の有効化・無効化（招待制運用のため）。
    - [x] **User Management**:
        - 任意のユーザーのパスワード再発行（Reset Password）。
        - ユーザーのRole変更（User <-> Admin）。
- [x] **User Profile**:
    - [x] **Profile Settings**: 表示名、メールアドレス、パスワードの変更フォーム。
    - [x] **UI Polish**:
        - [x] `/signup` や `/admin/setup` への `password_confirmation` (確認用パスワード入力) の追加。
        - [x] Dashboardへのユーザー名表示。
- [ ] **Security Hardening**:
    - [ ] **Captcha Integration**: Better AuthのCaptcha Pluginを使用し、Cloudflare TurnstileをLogin/Signupフォームへ導入する。
    - [ ] **Rate Limiting**: Better Auth標準のRate Limit機能を有効化し、認証エンドポイントへの試行回数を制限する（例: 100 req/min, サインイン試行制限）。

## Phase 9: True Offline Capability
**Goal**: 電波の届かない場所でも、心のケアを継続できるようにする。
- **Offline Data Sync**: IndexedDB を活用し、オフラインで書いた日記やチェックインを一時保存。オンライン復帰時にサーバーへ同期（Background Sync）。
- **Offline Meditation**: 瞑想ガイドやタイマー音声をキャッシュし、完全オフラインでの再生をサポート。
- **Reliability**: ネットワーク不安定時の再試行ロジックの強化。

## Phase 10: Medication Management
**Goal**: 服薬習慣の定着を支援し、ダイアリー（気分）との相関を可視化する。
- **Medication Alarm**: 服薬リマインダー機能。飲み忘れ防止のアラーム通知と、ダイアリーと連携した服用記録のログ化。
