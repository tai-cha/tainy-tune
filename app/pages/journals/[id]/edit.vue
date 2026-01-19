<script setup lang="ts">
import { db } from '~/utils/local-db';
import { useToast } from '@app/composables/useToast';

const route = useRoute();
const router = useRouter();
const journalId = route.params.id as string;

const journal = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    // 1. Try Local DB first (Best for offline/speed)
    const local = await db.journalEntries.get(journalId);
    if (local) {
      journal.value = local;
    } else {
      // 2. Fallback to Network (if online)
      // We might need an endpoint for GET /api/journals/[id] if it doesn't exist
      // But typically we sync everything. Let's assume sync handles it or we fetch list.
      // If we really need it, we might need to implement GET /api/journals/[id].
      // For now, let's rely on what we have. If it's not local, it might not exist or be synced yet.
      // Let's try to fetch from server if possible, or just fail gracefully.
      try {
        // We don't have a direct single-fetch API in the list, but we can try generic fetch or assume local is truth.
        // Given "Offline First" nature, local should have it if it was synced.
        // If it's a new device, sync might not be done.
        // Let's add a safe fallback if we can, but for MVP, local DB check is robust enough given existing architecture.
        // Actually, let's try to fetch if we are online and local failed.
        const data = await $fetch(`/api/journals/${journalId}`);
        if (data) journal.value = data;
      } catch (e) {
        console.warn('Journal not found locally or remotely', e);
      }
    }
  } catch (e) {
    console.error('Error loading journal', e);
  } finally {
    isLoading.value = false;
  }
});

const handleSuccess = () => {
  router.push('/history');
};

// Explicitly use the default layout or whatever fits
definePageMeta({
  layout: 'default'
});

const { data: settings } = useSystemSettings();
const { error: toastError } = useToast();

watchEffect(() => {
  if (settings.value && !settings.value.allowJournalEditing) {
    toastError('Journal editing is disabled.'); // Or use a nicer UI state
    router.push('/history');
  }
});
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <button @click="router.back()" :class="$style.backBtn">← {{ $t('common.back') }}</button>
      <h1 :class="$style.title">{{ $t('journal.edit.title') }}</h1>
      <p :class="$style.subtitle">{{ $t('journal.edit.subtitle') }}</p>
    </header>

    <div v-if="isLoading" :class="$style.loading">
      {{ $t('common.loading') }}...
    </div>

    <div v-else-if="journal">
      <JournalForm :initialJournal="journal" @update:success="handleSuccess" />
    </div>

    <div v-else :class="$style.error">
      {{ $t('common.error.notFound') }}
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
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.backBtn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1rem;
  padding: 0.5rem;
  transition: color 0.2s;
}

.backBtn:hover {
  color: #2d3748;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.subtitle {
  color: #718096;
}
</style>
