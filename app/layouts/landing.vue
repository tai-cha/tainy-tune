<template>
  <div :class="$style.layout">
    <main :class="$style.main">
      <slot />
    </main>
  </div>
</template>

<style module>
.layout {
  min-height: 100vh;
  background-color: var(--color-bg-page);
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  width: 100%;
}
</style>
