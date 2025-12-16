<script setup lang="ts">
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const props = defineProps<{
  journal: {
    id: number;
    content: string;
    mood_score: number | null;
    tags: string[] | null;
    distortion_tags: string[] | null;
    advice: string | null;
    created_at: string | Date | null;
  }
}>();

const formatDate = (date: string | Date | null) => {
  if (!date) return '';
  return format(new Date(date), 'M/d(E) HH:mm', { locale: ja });
};
</script>

<template>
  <div :class="$style.card">
    <div :class="$style.header">
      <div :class="$style.meta">
        <span :class="$style.date">{{ formatDate(journal.created_at) }}</span>
        <span :class="$style.mood" v-if="journal.mood_score">
          {{ $t('journalCard.mood') }}: {{ journal.mood_score }}
        </span>
      </div>
    </div>

    <p :class="$style.content">{{ journal.content }}</p>

    <div :class="$style.tags" v-if="journal.tags?.length || journal.distortion_tags?.length">
      <span v-for="tag in journal.tags" :key="tag" :class="$style.tag">
        #{{ tag }}
      </span>
      <span v-for="dist in journal.distortion_tags" :key="dist" :class="[$style.tag, $style.distortion]">
        ⚠ {{ $te(`distortions.${dist}`) ? $t(`distortions.${dist}`) : dist }}
      </span>
    </div>

    <div :class="$style.advice" v-if="journal.advice">
      <div :class="$style.adviceIcon">💡</div>
      <p :class="$style.adviceText">{{ journal.advice }}</p>
    </div>
  </div>
</template>

<style module>
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
  color: #64748b;
}

.mood {
  background: #f0f9ff;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.content {
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
}

.distortion {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
}

.advice {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.adviceIcon {
  font-size: 1.2rem;
}

.adviceText {
  color: #15803d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}
</style>
