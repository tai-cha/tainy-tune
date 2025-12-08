<script setup lang="ts">
import { ref, nextTick } from 'vue';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const input = ref('');
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const messagesEndRef = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesEndRef.value) {
    messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

const sendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return;

  const userMessage = input.value.trim();
  messages.value.push({ role: 'user', content: userMessage });
  input.value = '';
  isLoading.value = true;
  await scrollToBottom();

  try {
    const response = await $fetch<{ reply: string }>('/api/chat', {
      method: 'POST',
      body: { message: userMessage },
    });

    messages.value.push({ role: 'assistant', content: response.reply });
  } catch (error) {
    console.error('Chat error:', error);
    messages.value.push({ role: 'assistant', content: 'Error: Could not get response.' });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};
</script>

<template>
  <div :class="$style.container">
    <h2 :class="$style.title">AI Memory Chat</h2>
    
    <div :class="$style.chatArea">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="[
          $style.message,
          msg.role === 'user' ? $style.userMessage : $style.assistantMessage
        ]"
      >
        <div :class="$style.roleLabel">{{ msg.role === 'user' ? 'You' : 'AI' }}</div>
        <div :class="$style.content">{{ msg.content }}</div>
      </div>
      <div v-if="isLoading" :class="$style.loading">Thinking...</div>
      <div ref="messagesEndRef" />
    </div>

    <div :class="$style.inputArea">
      <input
        v-model="input"
        @keyup.enter="sendMessage"
        :class="$style.input"
        placeholder="Ask about your past journals..."
        :disabled="isLoading"
      />
      <button
        @click="sendMessage"
        :class="$style.sendButton"
        :disabled="!input.trim() || isLoading"
      >
        Send
      </button>
    </div>
  </div>
</template>

<style module>
.container {
  display: flex;
  flex-direction: column;
  height: 500px; /* Fixed height for scroll */
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  overflow: hidden;
}

.title {
  padding: 1rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f7fafc;
}

.chatArea {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  max-width: 80%;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.userMessage {
  align-self: flex-end;
  background-color: #eebcbd; /* Soft pinkish/red to match project theme maybe? Or just generic user color */
  background-color: #3182ce;
  color: white;
}

.assistantMessage {
  align-self: flex-start;
  background-color: #edf2f7;
  color: #2d3748;
}

.roleLabel {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  opacity: 0.8;
}

.loading {
  font-size: 0.875rem;
  color: #718096;
  font-style: italic;
  padding: 0.5rem;
}

.inputArea {
  padding: 1rem;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.5rem;
}

.input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.sendButton {
  padding: 0.5rem 1rem;
  background-color: #38a169;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.sendButton:hover:not(:disabled) {
  background-color: #2f855a;
}

.sendButton:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
</style>
