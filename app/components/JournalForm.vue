<script setup lang="ts">
import { ref, computed, useCssModule } from 'vue';
import { db } from '~/utils/local-db';

const content = ref('');
const mood = ref(5);
const loading = ref(false);
const result = ref<any>(null);

const style = useCssModule();

const moodColorClass = computed(() => {
  if (mood.value >= 8) return style.moodGood;
  if (mood.value >= 5) return style.moodNormal;
  return style.moodBad;
});

const { online, pushChanges, getUUID } = useSync();

async function submitJournal() {
  if (!content.value.trim()) return;

  loading.value = true;
  result.value = null;

  try {
    const uuid = getUUID();
    const entryData = {
      id: uuid, // Local ID is UUID
      content: content.value,
      moodScore: mood.value,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: 0,
      clientUuid: uuid
    };

    // 1. Save Locally
    await db.journalEntries.add(entryData);

    // 2. Queue Sync Action (Always queue first or try direct?)
    // If we queue first, we prevent race conditions.
    // But for immediate feedback, we want to try direct if online.
    // Hybrid:

    if (!online.value) {
      // Offline: Queue and Notify
      await db.syncQueue.add({
        action: 'create',
        payload: { ...entryData, clientUuid: uuid }, // Send standard Payload
        createdAt: new Date().getTime()
      });
      alert($t('journal.offline_saved') || 'Saved offline. Analysis will complete when back online.');
      content.value = '';
      mood.value = 5;
    } else {
      // Online: Try direct send (for immediate analysis result)
      // We still save locally first (done above).
      try {
        const response = await $fetch('/api/journal', {
          method: 'POST',
          body: {
            content: content.value,
            mood: mood.value,
            clientUuid: uuid
          }
        });

        // Success! Update local sync status and result
        await db.journalEntries.update(uuid, { synced: 1 });

        result.value = response;
        content.value = '';
        mood.value = 5;

      } catch (err) {
        console.warn('Online submit failed, queuing instead:', err);
        // Fallback to queue
        await db.syncQueue.add({
          action: 'create',
          payload: { ...entryData, clientUuid: uuid },
          createdAt: new Date().getTime()
        });
        alert($t('journal.saved_queued') || 'Saved. Will retry syncing shortly.');
        content.value = '';
        mood.value = 5;
      }
    }
  } catch (error) {
    console.error('Failed to save journal:', error);
    alert($t('common.error'));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="$style.wrapper">
    <form @submit.prevent="submitJournal" :class="[$style.form, 'card']">

      <div :class="$style.moodSection">
        <label :class="$style.label">{{ $t('journal.form.mood') }}: <span :class="moodColorClass">{{ mood
            }}</span></label>
        <input type="range" min="1" max="10" v-model.number="mood" :class="$style.slider"
          :style="{ backgroundSize: `${(mood - 1) * 100 / 9}% 100%` }" />
      </div>

      <div :class="$style.inputGroup">
        <textarea v-model="content" :placeholder="$t('journal.form.content')" :class="[$style.textarea, 'input-field']"
          @keydown.ctrl.enter.prevent="submitJournal" @keydown.meta.enter.prevent="submitJournal" required></textarea>
      </div>

      <div :class="$style.actions">
        <button type="submit" :class="[$style.submitBtn, 'btn-primary']" :disabled="loading">
          <span v-if="loading">{{ $t('common.saving') }}</span>
          <span v-else>{{ $t('journal.form.analyze') }}</span>
        </button>
      </div>
    </form>

    <!-- RESULT CARD -->
    <div v-if="result" :class="$style.resultSection">
      <h3 :class="$style.resultTitle">Analyze Result</h3>
      <JournalCard :journal="result" />

      <div :class="$style.resultActions">
        <NuxtLink to="/" :class="$style.homeLink">{{ $t('journal.result.backToHome') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style module>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
}

.result {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

.resultTitle {
  color: #2d3748;
  margin-bottom: 1.5rem;
}



.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.slider {
  width: 100%;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.textarea {
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
}

.actions {
  display: flex;
  justify-content: flex-end;
}



.error {
  color: var(--color-danger);
  font-weight: 500;
}

.moodGood {
  color: var(--color-mood-good);
  font-weight: 700;
}

.moodNormal {
  color: var(--color-mood-normal);
  font-weight: 700;
}

.moodBad {
  color: var(--color-mood-bad);
  font-weight: 700;
}

.resultSection {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resultTitle {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0;
  padding-left: 0.5rem;
  border-left: 4px solid var(--color-primary);
  font-weight: 700;
}

.resultActions {
  text-align: center;
  margin-top: 1rem;
}

.homeLink {
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.homeLink:hover {
  text-decoration: underline;
  color: var(--color-primary);
}
</style>
