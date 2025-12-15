<script setup lang="ts">
import { ref } from 'vue';

const content = ref('');
const mood = ref(5);
const isSubmitting = ref(false);
const result = ref<any>(null);

async function submitJournal() {
  if (!content.value.trim()) return;

  isSubmitting.value = true;
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
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="wrapper">
    <form @submit.prevent="submitJournal" :class="$style.form" v-if="!result">
      <div :class="$style.field">
        <label :class="$style.label">
          Current Mood ({{ mood }}/10)
        </label>
        <input
          v-model.number="mood"
          type="range"
          min="1"
          max="10"
          :class="$style.slider"
        />
      </div>

      <div :class="$style.field">
        <label :class="$style.label" for="content">What's on your mind?</label>
        <textarea
          id="content"
          v-model="content"
          :class="$style.textarea"
          placeholder="Write your thoughts..."
          :disabled="isSubmitting"
        ></textarea>
      </div>

      <div :class="$style.actions">
        <button
          type="submit"
          :class="$style.button"
          :disabled="isSubmitting || !content.trim()"
        >
          {{ isSubmitting ? 'Saving & Analyzing...' : 'Save Log' }}
        </button>
      </div>
    </form>

    <div v-else :class="$style.result">
      <h3 :class="$style.resultTitle">Entry Saved</h3>
      
      <div :class="$style.feedback" v-if="result.advice">
        <h4 :class="$style.feedbackTitle">AI Feedback</h4>
        <p>{{ result.advice }}</p>
      </div>

      <div :class="$style.tags" v-if="result.tags?.length || result.distortion_tags?.length">
        <div v-for="tag in result.tags" :key="tag" :class="$style.tag">
          #{{ tag }}
        </div>
        <div v-for="dist in result.distortion_tags" :key="dist" :class="[$style.tag, $style.distortion]">
          ⚠ {{ dist }}
        </div>
      </div>

      <button @click="result = null" :class="$style.button">Write Another</button>
    </div>
  </div>
</template>

<style module>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
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

.feedback {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: left;
}

.feedbackTitle {
  color: #0369a1;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
}

.distortion {
  background: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
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
  accent-color: #3b82f6;
  cursor: pointer;
}

.textarea {
  min-height: 150px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.button {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.button:hover:not(:disabled) {
  background-color: #2563eb;
}

.error {
  color: #e53e3e;
  font-weight: 500;
}
</style>
