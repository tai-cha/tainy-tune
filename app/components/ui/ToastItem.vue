<script setup lang="ts">
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import type { Toast } from '@app/composables/useToast'
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  (e: 'close', id: string): void
}>()

const iconComponent = computed(() => {
  switch (props.toast.type) {
    case 'success': return CheckCircleIcon
    case 'error': return XCircleIcon
    case 'warning': return ExclamationTriangleIcon
    case 'info': return InformationCircleIcon
    default: return InformationCircleIcon
  }
})

const typeClass = computed(() => {
  return props.toast.type
})
</script>

<template>
  <div :class="[$style.toast, $style[typeClass]]" role="alert">
    <component :is="iconComponent" :class="$style.icon" />

    <div :class="$style.content">
      <h4 v-if="toast.title" :class="$style.title">{{ toast.title }}</h4>
      <p :class="$style.description">{{ toast.description }}</p>
    </div>

    <button type="button" :class="$style.closeParams" :aria-label="t('common.close')" @click="emit('close', toast.id)">
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<style module>
.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  min-width: 320px;
  max-width: 420px;
  pointer-events: auto;
  transition: all 0.3s ease;
}

/* Type variations */
.success {
  border-left: 4px solid var(--color-success);
}

.error {
  border-left: 4px solid var(--color-danger);
}

.warning {
  border-left: 4px solid var(--color-warning);
}

.info {
  border-left: 4px solid var(--color-info);
}

/* Icon colors */
.success .icon {
  color: var(--color-success);
}

.error .icon {
  color: var(--color-danger);
}

.warning .icon {
  color: var(--color-warning);
}

.info .icon {
  color: var(--color-info);
}

.icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.content {
  flex: 1;
}

.title {
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-main);
}

.description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.closeParams {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-text-muted);
  border-radius: 4px;
  transition: background-color 0.2s;
  margin-left: 4px;
  margin-top: -4px;
}

.closeParams:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-main);
}
</style>
