<script setup lang="ts">
import { ChatBubbleLeftRightIcon, TrashIco } from '@heroicons/vue/24/outline'; // Check icons

const { t } = useI18n();
const { data: threads, refresh } = await useFetch('/api/chat/threads', { key: 'threads' });

const deleteThread = async (id: number) => {
  if (!confirm(t('chat.confirmDelete'))) return;
  try {
    await $fetch(`/api/chat/threads/${id}`, { method: 'DELETE' });
    refresh();
  } catch (e) {
    alert(t('chat.deleteError'));
  }
};
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">{{ $t('chat.title') }}</h1>
      <p :class="$style.subtitle">{{ $t('chat.subtitle') }}</p>
    </header>

    <div :class="$style.actions">
      <NuxtLink to="/chat/new" :class="[$style.newChatBtn, 'btn-primary']">
        <ChatBubbleLeftRightIcon :class="$style.icon" />
        {{ $t('chat.newChat') }}
      </NuxtLink>
    </div>

    <div :class="[$style.threadList, 'card']">
      <h2 :class="$style.listTitle">{{ $t('chat.recentThreads') }}</h2>

      <div v-if="!threads?.length" :class="$style.empty">
        {{ $t('chat.noThreads') }}
      </div>

      <div v-for="thread in threads" :key="thread.id" :class="$style.threadItem">
        <NuxtLink :to="`/chat/${thread.id}`" :class="$style.threadLink">
          {{ thread.title }}
          <span :class="$style.date">
            <ClientOnly>
              {{ new Date(thread.updated_at ?? thread.created_at ?? Date.now()).toLocaleDateString() }}
            </ClientOnly>
          </span>
        </NuxtLink>
        <button @click.prevent="deleteThread(thread.id)" :class="$style.deleteBtn">
          <TrashIcon :class="$style.iconSm" />
        </button>
      </div>
    </div>
  </div>
</template>

<style module>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.8rem;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.newChatBtn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  border-radius: 9999px;
  /* Override standard radius for pill shape */
}

.newChatBtn:hover {
  text-decoration: none;
}

.icon {
  width: 24px;
  height: 24px;
}

.threadList {
  padding: 0;
  /* Override card padding for list layout */
  overflow: hidden;
  gap: 0;
  /* Remove gap for list items */
}

.listTitle {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 1rem;
  margin: 0;
  background: var(--color-bg-page);
  border-bottom: 1px solid var(--color-border);
}

.empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
}

.threadItem {
  border-bottom: 1px solid var(--color-bg-page);
  display: flex;
  align-items: center;
}

.threadItem:last-child {
  border-bottom: none;
}

.threadLink {
  flex: 1;
  padding: 1rem;
  color: var(--color-text-main);
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.threadLink:hover {
  background: var(--color-bg-page);
}

.date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.deleteBtn {
  padding: 1rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.deleteBtn:hover {
  color: var(--color-danger);
}

.iconSm {
  width: 20px;
  height: 20px;
}
</style>
