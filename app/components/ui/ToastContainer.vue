<script setup lang="ts">
import { useToast } from '@app/composables/useToast'
import ToastItem from './ToastItem.vue'

const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div :class="$style.container">
      <TransitionGroup :name="$style.list">
        <ToastItem v-for="toast in toasts" :key="toast.id" :toast="toast" @close="remove" />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style module>
.container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  /* Let clicks pass through empty areas */
}

/* Animations using non-module classes for TransitionGroup name */
:global(.list-enter-active),
:global(.list-leave-active) {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

:global(.list-enter-from) {
  opacity: 0;
  transform: translateX(30px);
}

:global(.list-leave-to) {
  opacity: 0;
  transform: translateX(30px);
}
</style>
