# Contributing Guide

このプロジェクトへの貢献において、品質と一貫性を保つためのルールをまとめました。
開発者は以下のルールを順守してください。

## 1. Styling Strategy: CSS Modules
このプロジェクトは **Vanilla CSS (CSS Modules)** を採用しています。

*   ✅ **推奨**: `<style module>` とCSS変数（`var(--color-primary)`など）を使用する。
*   ❌ **非推奨**: `class="bg-blue-500"` のようなユーティリティクラスの使用（プロジェクトに含まれていません）。
*   ⚠️ **注意**: `<style>` 内でのハードコードされたHEXカラー（`#3b82f6` など）は極力控え、`main.css` の定義済み変数を使用してください。

## 2. Localization (i18n): "No Hardcoded English"
UI上のテキストは全て **日本語化（i18n対応）** が必須です。

*   ❌ **禁止**: UI要素に "Start", "Stop", "min" などのテキストを直接書くこと。
*   ✅ **正解**: `i18n/locales/ja.json` にキーを追加し、`$t()` または `t()` で参照すること。

## 3. Refactoring Safety (AI-Specific Warning)
AIによる大規模なリファクタリング（特にi18n化などの文字列置換）において、**ロジックコードを誤って削除する事故** が多発しています。

*   ⚠️ **注意**: テキスト置換を行う際は、関数定義、`import` 文、`ref` 定義を巻き込まないか細心の注意を払ってください。
*   ⚠️ **必須**: コードを書き換えた後は、必ず `ref` や関数が残っているかDiffを確認すること。

## 4. Server/API Imports
深い相対パスは可読性とメンテナンス性を損ないます。

*   ❌ **禁止**: `import { db } from '../../../db'`
*   ✅ **正解**: `import { db } from '@server/db'`

## 5. Component Design & Contrast
*   **Visual States**: ボタンなどのインタラクティブな要素だけでなく、全てのUI要素において、ホバー時やアクティブ時の配色コントラストが維持されているか確認してください。
    *   特に背景色に透明度を使用する場合や、変数が未定義でスタイルが崩れる（透明になる）ケースに注意が必要です。
