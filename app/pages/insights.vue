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
      <section :class="$style.section">
        <h2 :class="$style.sectionTitle">{{ $t('insights.moodChart') }}</h2>
        <div :class="$style.chartWrapper">
          <ClientOnly>
            <MoodChart v-if="stats?.moodHistory.length" :data="stats.moodHistory" />
            <div v-else :class="$style.noData">{{ $t('insights.noData') }}</div>
          </ClientOnly>
        </div>
      </section>

      <!-- Distortion Chart -->
      <section :class="$style.section">
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
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #64748b;
  margin: 0;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.sectionTitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.chartWrapper {
  min-height: 300px;
}

.noData {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 8px;
}

.loading {
  text-align: center;
  color: #64748b;
  padding: 2rem;
}
</style>
