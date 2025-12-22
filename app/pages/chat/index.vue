<script setup lang="ts">
import { ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/vue/24/outline'; // Check icons

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
      <NuxtLink to="/chat/new" :class="$style.newChatBtn">
        <ChatBubbleLeftRightIcon :class="$style.icon" />
        {{ $t('chat.newChat') }}
      </NuxtLink>
    </div>

    <div :class="$style.threadList">
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
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
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
  background: #3b82f6;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.newChatBtn:hover {
  background: #2563eb;
}

.icon {
  width: 24px;
  height: 24px;
}

.threadList {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.listTitle {
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  padding: 1rem;
  margin: 0;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.empty {
  padding: 2rem;
  text-align: center;
  color: #cbd5e0;
}

.threadItem {
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
}

.threadItem:last-child {
  border-bottom: none;
}

.threadLink {
  flex: 1;
  padding: 1rem;
  color: #334155;
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.threadLink:hover {
  background: #f8fafc;
}

.date {
  font-size: 0.8rem;
  color: #94a3b8;
}

.deleteBtn {
  padding: 1rem;
  background: none;
  border: none;
  color: #cbd5e0;
  cursor: pointer;
  transition: color 0.2s;
}

.deleteBtn:hover {
  color: #ef4444;
}

.iconSm {
  width: 20px;
  height: 20px;
}
</style>
