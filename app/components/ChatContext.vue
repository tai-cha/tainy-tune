<script setup lang="ts">
import { BookOpenIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import { ref } from 'vue';

const props = defineProps<{
  journals: any[];
}>();

const isCollapsed = ref(false);
</script>

<template>
  <div v-if="journals && journals.length > 0" :class="$style.contextArea">
    <button @click="isCollapsed = !isCollapsed" :class="$style.headerBtn">
      <div :class="$style.left">
        <BookOpenIcon :class="$style.iconSm" />
        <span :class="$style.label">
          {{ $t('chat.contextLabel') }}
          <span :class="$style.count">({{ journals.length }})</span>
        </span>
      </div>
      <ChevronDownIcon :class="[$style.iconSm, $style.chevron, isCollapsed && $style.rotate]" />
    </button>

    <div v-show="!isCollapsed" :class="$style.contextList">
      <JournalCard v-for="journal in journals" :key="journal.id" :journal="journal" :hide-discussion="true"
        :class="$style.miniJournalCard" />
    </div>
  </div>
</template>

<style module>
.contextArea {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
}

.headerBtn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #64748b;
  margin-bottom: 0.5rem;
}

/* Remove margin if collapsed to save space? */
/* Actually, margin-bottom is on the button, which acts as header. */

.left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 0.8rem;
  font-weight: 600;
}

.count {
  font-weight: 400;
  margin-left: 0.25rem;
  font-size: 0.75rem;
}

.iconSm {
  width: 16px;
  height: 16px;
}

.chevron {
  transition: transform 0.2s;
}

.rotate {
  transform: rotate(-90deg);
}

.contextList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 0.5rem;
}

.miniJournalCard {
  border: 1px solid #e2e8f0;
  box-shadow: none;
  font-size: 0.85rem;
}
</style>
