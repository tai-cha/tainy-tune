---
trigger: always_on
---

# Coding Rules
## 日本語化する際のルール

このプロジェクトではvue-i18nを使っています。すべてテキストは`i18n/locales/ja.json`に記述し、それを利用する形で書いてください
```vue
<span :class="$style.label">
  {{ $t('chat.contextLabel') }}
  <span :class="$style.count">({{ journals.length }})</span>
</span>
```

## Vue SFCについて
本プロジェクトではVue composition API(`<script setup>`)、css module（`<style module>`）を推奨しています

## Stylingについて
`app/assets/css/main.css`のほか、`app/components`配下のコンポーネントの実装も見て、コンポーネント間でスタイルの調和がとれるようにすること

## TypeScriptについて
このプロジェクトではTypeScriptを利用しています。anyという型指定は**絶対に検討すべきではない**です。型情報を参照し、適切にコーディングを行ってください