<script setup lang="ts">
import { FaceFrownIcon, FaceSmileIcon } from '@heroicons/vue/24/outline';

const mood = ref<number | null>(null);
const loading = ref(false);
const message = ref('');
const { t } = useI18n();

const moods = computed(() => [
  { value: 1, label: t('dashboard.selfCare.checkin.labels.veryBad'), icon: '😫' },
  { value: 2, label: t('dashboard.selfCare.checkin.labels.bad'), icon: '😓' },
  { value: 3, label: t('dashboard.selfCare.checkin.labels.neutral'), icon: '😐' },
  { value: 4, label: t('dashboard.selfCare.checkin.labels.good'), icon: '😊' },
  { value: 5, label: t('dashboard.selfCare.checkin.labels.excellent'), icon: '🥰' },
]);

async function submitCheckin(score: number) {
  loading.value = true;
  message.value = '';
  try {
    const res = await $fetch<{ status: string }>('/api/checkins', {
      method: 'POST',
      body: { mood_score: score },
    });

    // UI Feedback based on status
    if (res.status === 'created') {
      message.value = t('dashboard.selfCare.checkin.recorded');
    } else {
      message.value = t('dashboard.selfCare.checkin.updated');
    }
    mood.value = score;

    // Clear message after 3s
    setTimeout(() => { message.value = ''; }, 3000);
  } catch (err) {
    console.error(err);
    message.value = t('dashboard.selfCare.checkin.error');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="[$style.card, 'card']">
    <h3 :class="$style.title">{{ $t('dashboard.selfCare.checkin.title') }}</h3>
    <div :class="$style.emojiContainer">
      <button v-for="m in moods" :key="m.value" @click="submitCheckin(m.value)" :disabled="loading" :title="m.label"
        :class="[$style.emojiBtn, { [$style.active]: mood === m.value, [$style.loading]: loading }]">
        {{ m.icon }}
      </button>
    </div>
    <div v-if="message" :class="$style.message">
      {{ message }}
    </div>
  </div>
</template>

<style module>
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: white;
  min-height: 160px;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0 0 1rem 0;
}

.emojiContainer {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.emojiBtn {
  font-size: 2rem;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
  line-height: 1;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emojiBtn:hover:not(:disabled) {
  transform: scale(1.1);
  background: var(--color-bg-primary-light);
}

.emojiBtn:active:not(:disabled) {
  transform: scale(0.95);
}

.active {
  background: var(--color-bg-primary-light);
  border-color: var(--color-primary-light);
  transform: scale(1.1);
}

.loading {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--color-primary);
  font-weight: 500;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
