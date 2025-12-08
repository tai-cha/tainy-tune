<script setup lang="ts">
// Components will be auto-imported by Nuxt, but explicit import is also fine.
</script>

<template>
  <div :class="$style.layout">
    <header :class="$style.header">
      <h1>Private Life Log (Dev Verification)</h1>
    </header>

    <main :class="$style.main">
      <div :class="$style.section">
        <JournalForm />
      </div>
      <div :class="$style.section">
        <ChatInterface />
      </div>
    </main>
  </div>
</template>

<style module>
.layout {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
  color: #2d3748;
}

.main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .main {
    grid-template-columns: 1fr 1fr;
  }
}

.section {
  display: flex;
  flex-direction: column;
}
</style>
