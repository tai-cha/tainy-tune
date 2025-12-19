<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// If contextId is present, we are discussing a journal
const contextId = route.query.contextId ? Number(route.query.contextId) : null;
const { data: journals } = await useFetch('/api/journals', {
  query: { id: contextId || undefined },
  immediate: !!contextId,
  key: `journal-${contextId}`
});

const contextJournals = computed(() => journals.value || []);

const handleSend = async (message: string) => {
  // Let exceptions bubble up to ChatInterface for handling (restoring input etc)
  const response = await $fetch<any>('/api/chat/threads', {
    method: 'POST',
    body: {
      message,
      initialContextIds: contextId ? [contextId] : [],
    }
  });

  // Refresh threads list in sidebar
  await refreshNuxtData('threads');

  // Redirect to the new thread
  router.replace(`/chat/${response.thread.id}`);
};
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">
        {{ contextId ? $t('chat.discussTitle') : $t('chat.newChat') }}
      </h1>
      <p :class="$style.subtitle">
        {{ $t('chat.subtitle') }}
      </p>
    </header>

    <div :class="$style.chatContainer">
      <ChatContext :journals="contextJournals" />
      <ChatInterface :on-send="handleSend" />
    </div>
  </div>
</template>

<style module>
.page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 1rem;
  text-align: center;
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
