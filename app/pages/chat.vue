<script setup lang="ts">
// Simple wrapper for ChatInterface
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">{{ $t('chat.title') }}</h1>
      <p :class="$style.subtitle">{{ $t('chat.subtitle') }}</p>
    </header>

    <div :class="$style.chatContainer">
      <ChatInterface />
    </div>
  </div>
</template>

<style module>
.page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 100px); /* Fill available space */
}

.header {
  text-align: center;
  flex-shrink: 0;
}

.title {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
}

.chatContainer {
  flex: 1;
  min-height: 0; /* Enable scrolling inside */
  display: flex;
  flex-direction: column;
}
</style>
