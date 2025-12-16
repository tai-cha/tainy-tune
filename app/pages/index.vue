<script setup lang="ts">
import { PencilSquareIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline';

// User Greeting
const { t } = useI18n();
const hours = new Date().getHours();
const greeting = hours < 12
  ? t('common.greeting.morning')
  : hours < 18
    ? t('common.greeting.afternoon')
    : t('common.greeting.evening');

// Recent Logs (Fetch last 3)
const { data: recentJournals } = await useFetch('/api/journals', {
  query: { limit: 3 }
});
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.greeting">{{ $t('common.greeting.format', { greeting: greeting, name: $t('common.user') }) }}
      </h1>
      <p :class="$style.subtitle">{{ $t('dashboard.subtitle') }}</p>
    </header>

    <!-- Quick Actions -->
    <div :class="$style.actions">
      <NuxtLink to="/journal" :class="$style.actionCard">
        <div :class="$style.actionIconBg">
          <PencilSquareIcon :class="$style.actionIcon" />
        </div>
        <div :class="$style.actionText">
          <h3>{{ $t('dashboard.quickActions.write.title') }}</h3>
          <p>{{ $t('dashboard.quickActions.write.desc') }}</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/chat" :class="$style.actionCard">
        <div :class="[$style.actionIconBg, $style.chatBg]">
          <ChatBubbleLeftRightIcon :class="$style.actionIcon" />
        </div>
        <div :class="$style.actionText">
          <h3>{{ $t('dashboard.quickActions.chat.title') }}</h3>
          <p>{{ $t('dashboard.quickActions.chat.desc') }}</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Recent Activity -->
    <div :class="$style.section">
      <div :class="$style.sectionHeader">
        <h2>{{ $t('dashboard.recent.title') }}</h2>
        <NuxtLink to="/history" :class="$style.viewAll">{{ $t('dashboard.recent.viewAll') }}</NuxtLink>
      </div>

      <div :class="$style.list">
        <div v-if="!recentJournals?.length" :class="$style.empty">
          {{ $t('dashboard.recent.empty') }}
        </div>
        <JournalCard v-for="journal in recentJournals" :key="journal.id" :journal="journal" />
      </div>
    </div>
  </div>
</template>

<style module>
.page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-top: 1rem;
}

.greeting {
  font-size: 2rem;
  color: #2d3748;
  margin: 0;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
  font-size: 1.1rem;
}

/* Actions */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.actionCard {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.actionCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.actionIconBg {
  background: #ebf8ff;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3182ce;
}

.chatBg {
  background: #f0fff4;
  color: #38a169;
}

.actionIcon {
  width: 24px;
  height: 24px;
}

.actionText h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.actionText p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

/* Recent Activity */
.section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sectionHeader h2 {
  font-size: 1.4rem;
  color: #2d3748;
  margin: 0;
}

.viewAll {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty {
  text-align: center;
  color: #a0aec0;
  padding: 2rem;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e0;
}
</style>
