<script setup lang="ts">
import { ref, computed, useCssModule } from 'vue';

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

async function submitJournal() {
  if (!content.value.trim()) return;

  loading.value = true;
  result.value = null; // Reset result

  try {
    const response = await $fetch('/api/journal', {
      method: 'POST',
      body: {
        content: content.value,
        mood: mood.value,
      },
    });

    // Show result
    result.value = response;
    content.value = '';
    mood.value = 5;

  } catch (error) {
    console.error('Failed to save journal:', error);
    alert('Failed to save journal. Please try again.');
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
