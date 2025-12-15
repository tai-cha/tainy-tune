<script setup lang="ts">
// Simple wrapper for JournalForm
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">New Entry</h1>
      <p :class="$style.subtitle">How are you feeling right now?</p>
    </header>

    <div :class="$style.formContainer">
      <JournalForm />
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
}

.header {
  text-align: center;
}

.title {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #718096;
}

.formContainer {
  /* Add any container styles if needed */
}
</style>
