<script setup lang="ts">
import { PencilSquareIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline';

import { useSession } from '~/app/utils/auth-client';
import { computed } from 'vue';
import { useOnline } from '@vueuse/core';
import type { JournalEntry } from '~/utils/local-db';

// User Greeting
const { t } = useI18n();
const session = useSession();
const user = computed(() => session.value?.data?.user);
const isOnline = useOnline();

const hours = new Date().getHours();
const greeting = hours < 12
  ? t('common.greeting.morning')
  : hours < 18
    ? t('common.greeting.afternoon')
    : t('common.greeting.evening');

// Recent Logs (Fetch last 3)
const { fetchJournals } = useJournalQuery();
const recentJournals = ref<JournalEntry[]>([]);

// Fetch on mount (client-side) to ensure we check offline/online status correctly via composable
onMounted(async () => {
  recentJournals.value = await fetchJournals({ limit: 3 }) || [];
});
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.greeting">
        <ClientOnly>
          {{ $t('common.greeting.format', { greeting: greeting, name: user?.name || $t('common.user') }) }}
        </ClientOnly>
      </h1>
      <p :class="$style.subtitle">{{ $t('dashboard.subtitle') }}</p>
    </header>

    <!-- Quick Actions -->
    <div :class="$style.actions">
      <NuxtLink to="/journal" :class="[$style.actionCard, 'card', 'card-hover']">
        <div :class="$style.actionIconBg">
          <PencilSquareIcon :class="$style.actionIcon" />
        </div>
        <div :class="$style.actionText">
          <h3>{{ $t('dashboard.quickActions.write.title') }}</h3>
          <p>{{ $t('dashboard.quickActions.write.desc') }}</p>
        </div>
      </NuxtLink>

      <ClientOnly>
        <button v-if="!isOnline" :class="[$style.actionCard, 'card', $style.disabled]">
          <div :class="[$style.actionIconBg, $style.chatBgDisabled]">
            <ChatBubbleLeftRightIcon :class="$style.actionIcon" />
          </div>
          <div :class="$style.actionText">
            <h3>{{ $t('dashboard.quickActions.chat.title') }} ({{ $t('common.offline') }})</h3>
            <p>{{ $t('dashboard.quickActions.chat.offline') || 'Unavailable offline' }}</p>
          </div>
        </button>

        <NuxtLink v-else to="/chat" :class="[$style.actionCard, 'card', 'card-hover']">
          <div :class="[$style.actionIconBg, $style.chatBg]">
            <ChatBubbleLeftRightIcon :class="$style.actionIcon" />
          </div>
          <div :class="$style.actionText">
            <h3>{{ $t('dashboard.quickActions.chat.title') }}</h3>
            <p>{{ $t('dashboard.quickActions.chat.desc') }}</p>
          </div>
        </NuxtLink>
      </ClientOnly>
    </div>

    <!-- Self Care Tools -->
    <div :class="$style.section">
      <div :class="$style.sectionHeader">
        <h2>{{ $t('dashboard.selfCare.title') }}</h2>
      </div>
      <div :class="$style.toolsGrid">
        <MoodCheckin />
        <MindfulnessTimer />
      </div>
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
  color: var(--color-text-main);
  margin: 0;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

/* Actions */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.actionCard {
  padding: 1.5rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actionIconBg {
  background: var(--color-bg-primary-light);
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.chatBg {
  background: var(--color-bg-success-light);
  color: var(--color-success);
}

.actionIcon {
  width: 24px;
  height: 24px;
}

.actionText h3 {
  margin: 0;
  color: var(--color-text-main);
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.actionText p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.toolsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .toolsGrid {
    grid-template-columns: 1fr 1fr;
  }
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
  color: var(--color-text-main);
  margin: 0;
}

.viewAll {
  color: var(--color-primary);
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
  color: var(--color-text-muted);
  padding: 2rem;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e0;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  border: none;
  background: white;
  text-align: left;
  width: 100%;
}

.chatBgDisabled {
  background: #cbd5e0;
  color: white;
}
</style>
