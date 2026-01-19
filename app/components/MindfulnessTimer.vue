<script setup lang="ts">
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/vue/24/solid';
import { useToast } from '@app/composables/useToast';

const timeLeft = ref(0);
const isRunning = ref(false);
const selectedDuration = ref(60); // Default 1 min
const timer = ref<NodeJS.Timeout | null>(null);
const { t } = useI18n();
const { success: toastSuccess } = useToast();

const DURATIONS = computed(() => [
  { label: `1 ${t('common.unit.minute')}`, value: 60 },
  { label: `3 ${t('common.unit.minute')}`, value: 180 },
  { label: `5 ${t('common.unit.minute')}`, value: 300 },
]);

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

function startTimer() {
  if (timer.value) clearInterval(timer.value);
  timeLeft.value = selectedDuration.value;
  isRunning.value = true;

  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      finishTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (timer.value) clearInterval(timer.value);
  isRunning.value = false;
  timeLeft.value = 0;
}

async function finishTimer() {
  if (timer.value) clearInterval(timer.value);
  isRunning.value = false;

  // Play sound or vibrate?
  // navigator.vibrate([200, 100, 200]); (Optional)

  // Save record
  try {
    await $fetch('/api/meditations', {
      method: 'POST',
      body: { durationSeconds: selectedDuration.value },
    });
    toastSuccess(t('dashboard.selfCare.timer.finished'));
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <div :class="[$style.card, 'card']">
    <h3 :class="$style.title">{{ $t('dashboard.selfCare.timer.title') }}</h3>

    <!-- Duration Selection -->
    <div v-if="!isRunning" :class="$style.durationSelect">
      <button v-for="d in DURATIONS" :key="d.value" @click="selectedDuration = d.value"
        :class="[$style.durationBtn, { [$style.activeDuration]: selectedDuration === d.value }]">
        {{ d.label }}
      </button>
    </div>

    <!-- Timer Display -->
    <div v-if="isRunning" :class="$style.timerDisplay">
      <span :class="$style.time">{{ formattedTime }}</span>
    </div>

    <!-- Controls -->
    <div :class="$style.controls">
      <button v-if="!isRunning" @click="startTimer" :class="[$style.controlBtn, $style.startBtn]">
        <PlayIcon :class="$style.icon" />
        {{ $t('dashboard.selfCare.timer.start') }}
      </button>
      <button v-else @click="stopTimer" :class="[$style.controlBtn, $style.stopBtn]">
        <StopIcon :class="$style.icon" />
        {{ $t('dashboard.selfCare.timer.stop') }}
      </button>
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
  margin: 0 0 1.5rem 0;
}

.durationSelect {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--color-bg-secondary);
  padding: 0.25rem;
  border-radius: 8px;
}

.durationBtn {
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.durationBtn:hover {
  color: var(--color-text-main);
}

.activeDuration {
  background: white;
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timerDisplay {
  margin-bottom: 1.5rem;
}

.time {
  font-size: 2.5rem;
  font-family: monospace;
  font-weight: 300;
  color: var(--color-text-main);
  letter-spacing: 2px;
}

.controls {
  display: flex;
  justify-content: center;
}

.controlBtn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 100px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.startBtn {
  background: var(--color-primary);
  color: white;
}

.startBtn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(var(--color-primary-rgb), 0.3);
}

.startBtn:active {
  transform: translateY(0);
}

.stopBtn {
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
}

.stopBtn:hover {
  background: #e2e8f0;
  color: var(--color-text-main);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
