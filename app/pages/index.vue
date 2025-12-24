<script setup lang="ts">
import { useSession } from '~/app/utils/auth-client';
import { computed } from 'vue';

definePageMeta({
  layout: false
});

const session = useSession();
const isPending = computed(() => session.value?.isPending ?? true);
const isAuthenticated = computed(() => !!session.value?.data);

const layoutName = computed(() => isAuthenticated.value ? 'default' : 'landing');
</script>

<template>
  <div v-if="isPending" class="loading-screen">
    <!-- Simple loading state -->
  </div>
  <NuxtLayout v-else :name="layoutName">
    <Dashboard v-if="isAuthenticated" />
    <LandingPage v-else />
  </NuxtLayout>
</template>

<style scoped>
.loading-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
