<script setup lang="ts">
import { ref } from 'vue';

const content = ref('');
const status = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');

const saveJournal = async () => {
  if (!content.value.trim()) return;

  status.value = 'saving';
  try {
    await $fetch('/api/journal', {
      method: 'POST',
      body: { content: content.value },
    });
    status.value = 'saved';
    content.value = '';
    setTimeout(() => {
      status.value = 'idle';
    }, 2000);
  } catch (error) {
    console.error('Failed to save journal:', error);
    status.value = 'error';
  }
};
</script>

<template>
  <div :class="$style.container">
    <h2 :class="$style.title">New Journal Entry</h2>
    <textarea
      v-model="content"
      :class="$style.textarea"
      placeholder="What's on your mind?"
      :disabled="status === 'saving'"
    />
    <div :class="$style.footer">
      <button
        @click="saveJournal"
        :class="$style.button"
        :disabled="!content.trim() || status === 'saving'"
      >
        {{ status === 'saving' ? 'Saving...' : 'Save' }}
      </button>
      <span v-if="status === 'saved'" :class="$style.success">Saved!</span>
      <span v-if="status === 'error'" :class="$style.error">Error occurred.</span>
    </div>
  </div>
</template>

<style module>
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.textarea {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
}

.textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.footer {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover:not(:disabled) {
  background-color: #2b6cb0;
}

.button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.success {
  color: #38a169;
  font-weight: 500;
}

.error {
  color: #e53e3e;
  font-weight: 500;
}
</style>
