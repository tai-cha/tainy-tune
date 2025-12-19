<script setup lang="ts">
const route = useRoute();
const threadId = route.params.id as string;

// Fetch thread messages
const { data: threadData, refresh } = await useFetch(`/api/chat/threads/${threadId}`);

const messages = computed(() => {
  if (!threadData.value) return [];
  // Transform DB messages to UI format if needed, or update ChatInterface to accept DB format
  // Assuming ChatInterface accepts { role: 'user'|'assistant', content: string }
  return threadData.value.messages.map((m: any) => ({
    role: m.role,
    content: m.content
  }));
});

const contextJournals = computed(() => threadData.value?.contextJournals || []);

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const formatDate = (date: string | Date | null) => {
  if (!date) return '';
  return format(new Date(date), 'M/d(E) HH:mm', { locale: ja });
};

const handleSend = async (message: string, contextIds?: number[]) => {
  await $fetch(`/api/chat/threads/${threadId}/messages`, {
    method: 'POST',
    body: { message, contextIds }
  });
  refresh();
};
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">
        {{ threadData?.thread?.title || $t('chat.title') }}
      </h1>
      <p :class="$style.subtitle">
        {{ $t('chat.subtitle') }}
      </p>
    </header>

    <div :class="$style.chatContainer">
      <ChatContext :journals="contextJournals" />
      <ChatInterface :initial-messages="messages" :thread-id="Number(threadId)" :on-send="handleSend" />
    </div>
  </div>
</template>

<style module>
.page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);
  /* Adjust based on layout */
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 1rem;
}

.title {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.subtitle {
  color: #718096;
}

.chatContainer {
  flex: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
