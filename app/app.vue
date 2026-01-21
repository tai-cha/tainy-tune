<script setup lang="ts">
import { useSession } from '~/app/utils/auth-client';
import { useSync } from '~/app/composables/useSync';
import { useOnline } from '@vueuse/core';

const session = useSession();
const { pullChanges, pushChanges } = useSync();
const online = useOnline();

// Trigger sync when session is established
watch(() => session.value?.data, async (newData) => {
  if (newData != null && online.value === true) {
    await pushChanges();
    await pullChanges();
  }
}, { immediate: true });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
