<script setup lang="ts">
// Simple Landing Page
const { data: settings } = await useFetch('/api/settings/public');
</script>

<template>
  <div :class="$style.lp">
    <header :class="$style.hero">
      <h1 :class="$style.title">Tainy Tune</h1>
      <p :class="$style.tagline">
        心の整理整頓、はじめませんか？<br>
        AIと一緒に、あなたの毎日を少しだけ生きやすく。
      </p>

      <div :class="$style.cta">
        <NuxtLink to="/login" :class="['btn', 'btn-primary', $style.loginBtn]">
          ログインする
        </NuxtLink>

        <div v-if="settings?.registrationEnabled" :class="$style.subLinks">
          <NuxtLink to="/signup" :class="$style.link">アカウント作成</NuxtLink>
        </div>
      </div>
    </header>

    <div :class="$style.features">
      <div :class="$style.featureCard">
        <h3>📝 ジャーナリング</h3>
        <p>書くことで思考を整理。AIが感情や事実を分析し、客観的な視点を提供します。</p>
      </div>
      <div :class="$style.featureCard">
        <h3>💬 AIパートナー</h3>
        <p>過去の記録を記憶したAIが、あなたの専属パートナーとして対話します。</p>
      </div>
      <div :class="$style.featureCard">
        <h3>📊 心の分析</h3>
        <p>認知の歪みや感情の傾向を可視化し、自分自身の理解を深めます。</p>
      </div>
    </div>
  </div>
</template>

<style module>
.lp {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  padding: 3rem 0;
}

.title {
  font-size: 3rem;
  font-weight: 900;
  color: var(--color-primary);
  margin: 0;
  letter-spacing: -0.05em;
}

.tagline {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text-muted);
  margin: 0;
}

.cta {
  margin-top: 1rem;
}

.loginBtn {
  font-size: 1.1rem;
  padding: 0.75rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.subLinks {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.divider {
  opacity: 0.5;
}

.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 640px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
  }
}

.featureCard {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  text-align: left;
}

.featureCard h3 {
  color: var(--color-text-main);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.featureCard p {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
}
</style>
