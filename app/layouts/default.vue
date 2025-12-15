<script setup lang="ts">
import { HomeIcon, ClockIcon, PencilSquareIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline';
import { useRoute } from 'vue-router';

const route = useRoute();

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Journal', href: '/journal', icon: PencilSquareIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'History', href: '/history', icon: ClockIcon },
];

const isActive = (path: string) => route.path === path;
</script>

<template>
  <div :class="$style.layout">
    <!-- Desktop Sidebar -->
    <aside :class="$style.sidebar">
      <div :class="$style.logo">
        TainyTune
      </div>
      <nav :class="$style.nav">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[$style.navItem, isActive(item.href) && $style.active]"
        >
          <component :is="item.icon" :class="$style.icon" />
          <span>{{ item.name }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main :class="$style.main">
      <div :class="$style.container">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav :class="$style.bottomNav">
      <NuxtLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        :class="[$style.bottomNavItem, isActive(item.href) && $style.activeBottom]"
      >
        <component :is="item.icon" :class="$style.icon" />
        <span :class="$style.label">{{ item.name }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style module>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  box-sizing: border-box;
}

.layout *, .layout *::before, .layout *::after {
  box-sizing: border-box;
}

.sidebar {
  display: none; /* Hidden on mobile */
  width: 240px;
  background-color: white;
  border-right: 1px solid #e2e8f0;
  flex-direction: column;
  padding: 1.5rem;
  position: fixed;
  height: 100vh;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 2rem;
  padding-left: 0.75rem;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.navItem:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.navItem.active {
  background-color: #eff6ff;
  color: #3b82f6;
}

.icon {
  width: 24px;
  height: 24px;
}

.main {
  flex: 1;
  padding: 1rem;
  padding-bottom: 80px; /* Space for bottom nav */
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Mobile Bottom Nav */
.bottomNav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e2e8f0;
  padding: 0.5rem;
  justify-content: space-around;
  z-index: 50;
}

.bottomNavItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.75rem;
}

.bottomNavItem.activeBottom {
  color: #3b82f6;
}

@media (min-width: 768px) {
  .sidebar {
    display: flex;
  }

  .main {
    margin-left: 240px; /* Sidebar width */
    padding: 2rem;
  }

  .bottomNav {
    display: none;
  }
}
</style>
