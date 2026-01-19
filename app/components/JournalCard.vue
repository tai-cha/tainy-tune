<script setup lang="ts">
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChatBubbleBottomCenterTextIcon, ArrowPathIcon, TrashIcon, PencilSquareIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  journal: {
    id: number | string;
    content: string;
    moodScore: number | null;
    tags?: string[] | null;
    distortionTags?: string[] | null;
    advice?: string | null;
    fact?: string | null;
    emotion?: string | null;
    isAnalysisFailed?: boolean | null;
    createdAt: string | Date | null;
  };
  hideDiscussion?: boolean;
}>();

const formatDate = (date: string | Date | null) => {
  if (!date) return '';
  return format(new Date(date), 'M/d(E) HH:mm', { locale: ja });
};

const style = useCssModule();
const getMoodClass = (score: number) => {
  if (score >= 8) return [style.moodBase, style.moodGood];
  if (score >= 5) return [style.moodBase, style.moodNormal];
  return [style.moodBase, style.moodBad];
};

const router = useRouter();
const isRetrying = ref(false);
const isDeleting = ref(false);

const { data: settings } = useSystemSettings();

const startDiscussion = () => {
  router.push({ path: '/chat/new', query: { contextId: props.journal.id } });
};

const startEdit = () => {
  router.push(`/journals/${props.journal.id}/edit`);
};

const handleRetry = async () => {
  if (isRetrying.value) return;
  isRetrying.value = true;
  try {
    await $fetch(`/api/journals/${props.journal.id}/analyze`, { method: 'POST' });
    // Global refresh to update the list
    await refreshNuxtData();
  } catch (error: any) {
    alert(error.message || 'Retry failed');
  } finally {
    isRetrying.value = false;
  }
};

const handleDelete = async () => {
  if (!confirm('本当に削除してもよろしいですか？')) return;

  if (isDeleting.value) return;
  isDeleting.value = true;
  try {
    await $fetch(`/api/journals/${props.journal.id}`, { method: 'DELETE' });
    // Global refresh to update the list
    await refreshNuxtData();
  } catch (error: any) {
    alert(error.message || 'Delete failed');
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div :class="[$style.card, 'card']">
    <div :class="$style.header">
      <div :class="$style.meta">
        <span :class="$style.metaText">
          <ClientOnly>
            {{ formatDate(journal.createdAt) }}
          </ClientOnly>
        </span>
        <span :class="getMoodClass(journal.moodScore)" v-if="journal.moodScore">
          {{ $t('journalCard.mood') }}: {{ journal.moodScore }}
        </span>
      </div>

      <div :class="$style.actions">
        <button :class="$style.actionBtn" @click="handleDelete" :disabled="isDeleting" title="削除">
          <TrashIcon :class="$style.actionIcon" />
        </button>
        <button v-if="settings?.allowJournalEditing" :class="$style.actionBtn" @click="startEdit" title="編集">
          <PencilSquareIcon :class="$style.actionIcon" />
        </button>
        <button v-if="!hideDiscussion" :class="$style.actionBtn" @click="startDiscussion"
          :title="$t('journal.discuss')">
          <ChatBubbleBottomCenterTextIcon :class="$style.actionIcon" />
        </button>
      </div>
    </div>

    <p :class="$style.content">{{ journal.content }}</p>

    <div :class="$style.tags" v-if="journal.tags?.length || journal.distortionTags?.length">
      <span v-for="tag in journal.tags" :key="tag" :class="$style.tag">
        #{{ tag }}
      </span>
      <span v-for="dist in journal.distortionTags" :key="dist" :class="[$style.tag, $style.distortion]">
        ⚠ {{ $te(`distortions.${dist}`) ? $t(`distortions.${dist}`) : dist }}
      </span>
    </div>

    <div v-if="journal.fact || journal.emotion" :class="$style.breakdown">
      <div :class="$style.breakdownItem">
        <span :class="$style.breakdownLabel">事実</span>
        <p :class="$style.breakdownText">{{ journal.fact || 'なし' }}</p>
      </div>
      <div :class="$style.breakdownItem">
        <span :class="$style.breakdownLabel">思考・感情</span>
        <p :class="$style.breakdownText">{{ journal.emotion || 'なし' }}</p>
      </div>
    </div>

    <div :class="$style.advice" v-if="journal.advice">
      <div :class="$style.adviceIcon">💡</div>
      <div :class="$style.adviceContent">
        <p :class="$style.adviceText">{{ journal.advice }}</p>
      </div>

      <button v-if="journal.isAnalysisFailed" @click="handleRetry" :class="$style.retryBtn" :disabled="isRetrying">
        <ArrowPathIcon :class="[$style.retryIcon, isRetrying && $style.spin]" />
        {{ isRetrying ? '分析中...' : '再分析' }}
      </button>
    </div>
  </div>
</template>

<style module>
.card {
  padding: 1.5rem;
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

.moodBase {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.moodGood {
  background: var(--color-bg-info-light);
  color: var(--color-mood-good);
}

.moodNormal {
  background: var(--color-bg-success-light);
  color: var(--color-mood-normal);
}

.moodBad {
  background: var(--color-bg-warning-light);
  color: var(--color-mood-bad);
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
  background: var(--color-bg-page);
  color: var(--color-text-muted);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
}

.distortion {
  background: var(--color-bg-danger-light);
  color: var(--color-distortion);
  border: 1px solid var(--color-distortion);
  opacity: 0.8;
}

.advice {
  background: var(--color-bg-success-light);
  border: 1px solid var(--color-success);
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
  color: var(--color-success);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actionBtn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.actionBtn:hover {
  background: var(--color-bg-page);
  color: var(--color-primary);
}

.actionIcon {
  width: 20px;
  height: 20px;
}

.retryBtn {
  margin-left: auto;
  background: white;
  border: 1px solid var(--color-success);
  color: var(--color-success);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.retryBtn:hover:not(:disabled) {
  background: var(--color-bg-success-light);
}

.retryIcon {
  width: 14px;
  height: 14px;
}

.spin {
  animation: spin 1s linear infinite;
}


.breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.breakdownItem {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem;
  border-left: 3px solid #cbd5e0;
}

.breakdownItem:nth-child(1) {
  border-left-color: var(--color-info);
  /* Fact: Blue */
  background: var(--color-bg-info-light);
}

.breakdownItem:nth-child(2) {
  border-left-color: var(--color-warning);
  /* Emotion: Orange */
  background: var(--color-bg-warning-light);
}

.breakdownLabel {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.breakdownText {
  margin: 0;
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
}

.adviceContent {
  flex: 1;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
