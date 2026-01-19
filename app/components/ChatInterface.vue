<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useToast } from '@app/composables/useToast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const props = defineProps<{
  initialMessages?: Message[];
  threadId?: number;
  onSend?: (message: string, contextIds?: number[]) => Promise<void>;
}>();

// Remove emit - we use callback for async handling
// const emit = defineEmits<{ ... }>();

const input = ref('');
const messages = ref<Message[]>(props.initialMessages ? [...props.initialMessages] : []);
const isLoading = ref(false);
const messagesEndRef = ref<HTMLElement | null>(null);
const { error: toastError } = useToast();

const scrollToBottom = async () => {
  await nextTick();
  if (messagesEndRef.value) {
    messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

const sendMessage = async () => {
  const text = input.value.trim();
  if (!text || isLoading.value) return;

  if (!props.onSend) {
    console.error('onSend prop is missing');
    return;
  }

  isLoading.value = true;
  await scrollToBottom();

  try {
    // Await the parent's action (API call)
    await props.onSend(text);

    // Only clear input on success
    input.value = '';

    // Note: We expect parent to update `initialMessages`, which triggers the watcher to update `messages`.
  } catch (error: any) {
    console.error('Chat error:', error);
    // Show error message
    // If it's 429, the error message from backend is user-friendly.
    const msg = error.data?.message || error.message || useNuxtApp().$i18n.t('chat.error');
    toastError(msg);
    // Input remains populated for retry
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

// Watch for prop updates (from polling or refresh) and update local messages
watch(() => props.initialMessages, (newVal) => {
  if (newVal) {
    messages.value = [...newVal];
    // scrollToBottom(); // moved to sendMessage or manual trigger? 
    // Better to scroll if new message added.
    if (newVal.length > (messages.value.length || 0)) {
      scrollToBottom();
    } else {
      // Deep check? For now just scroll.
      scrollToBottom();
    }
  }
}, { deep: true });

</script>

<template>
  <div :class="[$style.container, 'card']">
    <h2 :class="$style.title">{{ $t('chat.header') }}</h2>

    <div :class="$style.chatArea">
      <div v-for="(msg, index) in messages" :key="index" :class="[
        $style.message,
        msg.role === 'user' ? $style.userMessage : $style.assistantMessage
      ]">
        <div :class="$style.roleLabel">{{ msg.role === 'user' ? $t('chat.role.user') : $t('chat.role.ai') }}</div>
        <div :class="$style.content">{{ msg.content }}</div>
      </div>
      <div v-if="isLoading" :class="$style.loading">{{ $t('chat.thinking') }}</div>
      <div ref="messagesEndRef" />
    </div>

    <form @submit.prevent="sendMessage" :class="$style.inputArea">
      <input v-model="input" type="text" :placeholder="$t('chat.placeholder')" :class="[$style.input, 'input-field']"
        :disabled="isLoading" />
      <button type="submit" :class="[$style.sendBtn, 'btn-primary']" :disabled="!input.trim() || isLoading">
        {{ $t('chat.send') }}
      </button>
    </form>
  </div>
</template>

<style module>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* Fixed height for scroll */
  overflow: hidden;
}

.title {
  padding: 1rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 2px solid var(--color-bg-page);
  background-color: white;
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
  background-color: var(--color-primary);
  color: white;
}

.assistantMessage {
  align-self: flex-start;
  background-color: var(--color-bg-page);
  color: var(--color-text-main);
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







/* .sendBtn is styled by global .btn-primary */
</style>
```
