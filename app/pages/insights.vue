<script setup lang="ts">
import { ChartBarIcon } from '@heroicons/vue/24/outline'; // Or presentation-chart-line

// Fetch stats
const { data: stats, pending } = await useFetch('/api/stats');
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">{{ $t('insights.title') }}</h1>
      <p :class="$style.subtitle">Visualize your mental patterns.</p>
    </header>

    <div v-if="pending" :class="$style.loading">Loading...</div>

    <div v-else :class="$style.content">
      <!-- Mood Chart -->
      <section :class="[$style.section, 'card']">
        <h2 :class="$style.sectionTitle">{{ $t('insights.moodChart') }}</h2>
        <div :class="$style.chartWrapper">
          <ClientOnly>
            <MoodChart v-if="stats?.moodHistory.length" :data="stats.moodHistory" />
            <div v-else :class="$style.noData">{{ $t('insights.noData') }}</div>
          </ClientOnly>
        </div>
      </section>

      <!-- Distortion Chart -->
      <section :class="[$style.section, 'card']">
        <h2 :class="$style.sectionTitle">{{ $t('insights.distortionChart') }}</h2>
        <div :class="$style.chartWrapper">
          <ClientOnly>
            <DistortionChart v-if="stats && Object.keys(stats.distortionCounts).length"
              :counts="stats.distortionCounts" />
            <div v-else :class="$style.noData">{{ $t('insights.noData') }}</div>
          </ClientOnly>
        </div>
      </section>
    </div>
  </div>
</template>

<style module>
.page {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text-main);
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--color-text-muted);
  margin: 0;
}

.section {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.sectionTitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-bg-page);
}

.chartWrapper {
  min-height: 300px;
}

.noData {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-muted);
  background: var(--color-bg-page);
  border-radius: 8px;
}

.loading {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem;
}
</style>
