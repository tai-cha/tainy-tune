<script setup lang="ts">
import { HomeIcon, ClockIcon, PencilSquareIcon, ChatBubbleLeftRightIcon, ChartPieIcon, TrashIcon, EllipsisHorizontalIcon, StarIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid';
import { useRoute } from 'vue-router';
import { ref, watch, computed } from 'vue';
import { signOut, useSession } from '~/app/utils/auth-client';

const handleLogout = async () => {
  if (!confirm(t('auth.logoutConfirm'))) return;
  await signOut();
  navigateTo('/');
};

const route = useRoute();
const { t } = useI18n();
const session = useSession();
const user = computed(() => session.value?.data?.user);
const isAdmin = computed(() => (user.value as any)?.role === 'admin');

const navigation = computed(() => [
  { name: 'nav.dashboard', href: '/', icon: HomeIcon },
  { name: 'nav.journal', href: '/journal', icon: PencilSquareIcon },
  { name: 'nav.chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'nav.history', href: '/history', icon: ClockIcon },
  { name: 'nav.insights', href: '/insights', icon: ChartPieIcon },
]);

const adminNavigation = computed(() => [
  { name: 'nav.profile', href: '/settings/profile', icon: Cog6ToothIcon },
  ...(isAdmin.value ? [{ name: 'nav.admin', href: '/admin/dashboard', icon: ShieldCheckIcon }] : [])
]);

const isActive = (path: string) => route.path === path;

// Fetch Recent Threads (lazy to prevent blocking navigation)
const { data: threads, refresh, error: threadsError } = useFetch('/api/chat/threads', {
  key: 'threads',
  lazy: true
});

// Ensure threads list is updated when navigating
watch(() => route.path, () => {
  refresh();
});

const activeThread = ref<any>(null);
const menuPos = ref({ top: 0, left: 0 });

const showMenu = (event: MouseEvent, thread: any) => {
  event.stopPropagation();
  if (activeThread.value?.id === thread.id) {
    activeThread.value = null;
    return;
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  activeThread.value = thread;
  // Position menu below button, aligned to right
  menuPos.value = {
    top: rect.bottom + 5,
    left: rect.left
  };
};

const closeMenu = () => {
  activeThread.value = null;
};

const pinThread = async () => {
  if (!activeThread.value) return;
  const thread = activeThread.value;
  closeMenu();
  try {
    const isCurrentlyPinned = !!thread.pinned_at;
    await $fetch(`/api/chat/threads/${thread.id}`, {
      method: 'PATCH',
      body: { isPinned: !isCurrentlyPinned }
    });
    refresh();
  } catch (e) {
    alert('Failed to update thread');
  }
};

const renameThread = async () => {
  if (!activeThread.value) return;
  const thread = activeThread.value;
  closeMenu();
  const newTitle = prompt(t('chat.renamePrompt'), thread.title);
  if (newTitle && newTitle !== thread.title) {
    try {
      await $fetch(`/api/chat/threads/${thread.id}`, {
        method: 'PATCH',
        body: { title: newTitle }
      });
      refresh();
    } catch (e) {
      alert('Failed to rename thread');
    }
  }
};

const deleteThread = async () => {
  if (!activeThread.value) return;
  const id = activeThread.value.id;
  closeMenu();
  if (!confirm(t('chat.confirmDelete'))) return;
  try {
    await $fetch(`/api/chat/threads/${id}`, { method: 'DELETE' });
    refresh();
    if (route.params.id && Number(route.params.id) === id) {
      navigateTo('/chat');
    }
  } catch (e) {
    alert(t('chat.deleteError'));
  }
};

const mobileMenuOpen = ref(false);
const mobileMenuPos = ref({ top: 0, left: 0 });

const showMobileMenu = (event: MouseEvent) => {
  event.stopPropagation();
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  mobileMenuPos.value = {
    top: rect.bottom + 5,
    left: rect.right
  };
  mobileMenuOpen.value = !mobileMenuOpen.value;
  activeThread.value = null; // Close thread menu if open
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// Override closeMenu to also close mobile menu
const closeAllMenus = () => {
  activeThread.value = null;
  mobileMenuOpen.value = false;
};
</script>

<template>
  <div :class="$style.layout" @click="closeAllMenus">
    <!-- Desktop Sidebar -->
    <aside :class="$style.sidebar">
      <div :class="$style.logo">
        TainyTune
      </div>
      <nav :class="$style.nav">
        <NuxtLink to="/" :class="[$style.navItem, isActive('/') && $style.active]">
          <HomeIcon :class="$style.icon" />
          <span :class="$style.navLabel">{{ $t('nav.dashboard') }}</span>
        </NuxtLink>
        <NuxtLink to="/journal" :class="[$style.navItem, isActive('/journal') && $style.active]">
          <PencilSquareIcon :class="$style.icon" />
          <span :class="$style.navLabel">{{ $t('nav.journal') }}</span>
        </NuxtLink>
        <!-- New Chat Button link -->
        <NuxtLink to="/chat" :class="[$style.navItem, isActive('/chat') && $style.active]">
          <ChatBubbleLeftRightIcon :class="$style.icon" />
          <span :class="$style.navLabel">{{ $t('nav.chat') }}</span>
        </NuxtLink>
        <NuxtLink to="/history" :class="[$style.navItem, isActive('/history') && $style.active]">
          <ClockIcon :class="$style.icon" />
          <span :class="$style.navLabel">{{ $t('nav.history') }}</span>
        </NuxtLink>
        <NuxtLink to="/insights" :class="[$style.navItem, isActive('/insights') && $style.active]">
          <ChartPieIcon :class="$style.icon" />
          <span :class="$style.navLabel">{{ $t('nav.insights') }}</span>
        </NuxtLink>

        <!-- Settings Links -->
        <div :class="$style.separator"></div>
        <NuxtLink v-for="item in adminNavigation" :key="item.name" :to="item.href"
          :class="[$style.navItem, isActive(item.href) && $style.active]">
          <component :is="item.icon" :class="$style.icon" />
          <span :class="$style.navLabel">{{ $t(item.name) }}</span>
        </NuxtLink>

        <!-- Threads List -->
        <div :class="$style.separator"></div>
        <div :class="$style.threadsHeader">{{ $t('chat.recentThreads') }}</div>

        <div :class="$style.threadList">
          <div v-for="thread in threads" :key="thread.id" :class="$style.threadItemWrapper">
            <NuxtLink :to="`/chat/${thread.id}`"
              :class="[$style.threadLink, isActive(`/chat/${thread.id}`) && $style.activeThread]">
              <span :class="$style.threadTitle">{{ thread.title }}</span>
              <StarIconSolid v-if="thread.pinned_at" :class="$style.pinnedIcon" />
            </NuxtLink>

            <button @click="showMenu($event, thread)" :class="$style.menuBtn">
              <EllipsisHorizontalIcon :class="$style.iconXs" />
            </button>
          </div>
          <div v-if="!threads?.length" :class="$style.noThreads">
            {{ $t('chat.noThreads') }}
          </div>
        </div>


        <div :class="$style.logoutWrapper">
          <button @click="handleLogout" :class="$style.logoutBtn">
            <ArrowLeftOnRectangleIcon :class="$style.icon" />
            <span :class="$style.navLabel">{{ $t('auth.logout') }}</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- Mobile Header -->
    <header :class="$style.mobileHeader">
      <div :class="$style.logoMobile">TainyTune</div>

      <div :class="$style.mobileMenuWrapper">
        <button @click="(e) => showMobileMenu(e)" :class="$style.headerMenuBtn">
          <EllipsisHorizontalIcon :class="$style.icon" />
        </button>
      </div>
    </header>

    <!-- Mobile Menu Dropdown Teleport -->
    <Teleport to="body">
      <div v-if="mobileMenuOpen" :class="$style.menuDropdown"
        :style="{ top: `${mobileMenuPos.top}px`, left: `${mobileMenuPos.left}px`, transform: 'translateX(-100%)' }">

        <NuxtLink v-for="item in adminNavigation" :key="item.name" :to="item.href" :class="$style.menuItem"
          @click="closeMobileMenu">
          <component :is="item.icon" :class="$style.iconXs" />
          {{ $t(item.name) }}
        </NuxtLink>

        <div :class="$style.menuSeparator"></div>

        <button @click="handleLogout" :class="[$style.menuItem, $style.menuItemRed]">
          <ArrowLeftOnRectangleIcon :class="$style.iconXs" />
          {{ $t('auth.logout') }}
        </button>
      </div>
    </Teleport>

    <!-- Main Content -->
    <main :class="$style.main">
      <div :class="$style.container">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav :class="$style.bottomNav">
      <NuxtLink v-for="item in navigation" :key="item.name" :to="item.href"
        :class="[$style.bottomNavItem, isActive(item.href) && $style.activeBottom]">
        <component :is="item.icon" :class="$style.icon" />
        <span :class="$style.label">{{ $t(item.name) }}</span>
      </NuxtLink>
    </nav>

    <!-- Context Menu Teleport -->
    <Teleport to="body">
      <div v-if="activeThread" :class="$style.menuDropdown"
        :style="{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }">
        <button @click="pinThread" :class="$style.menuItem">
          <component :is="activeThread.pinned_at ? StarIcon : StarIconSolid" :class="$style.iconXs" />
          {{ activeThread.pinned_at ? $t('chat.unpin') : $t('chat.pin') }}
        </button>
        <button @click="renameThread" :class="$style.menuItem">
          <PencilSquareIcon :class="$style.iconXs" />
          {{ $t('chat.rename') }}
        </button>
        <button @click="deleteThread" :class="[$style.menuItem, $style.menuItemRed]">
          <TrashIcon :class="$style.iconXs" />
          {{ $t('chat.delete') }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style module>
.layout {
  display: flex;
  flex-direction: column;
  /* Default to column for mobile (Header -> Main -> Footer) */
  min-height: 100vh;
  background-color: var(--color-bg-page);
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .layout {
    flex-direction: row;
    /* Row for Desktop (Sidebar | Main) */
  }
}

.layout *,
.layout *::before,
.layout *::after {
  box-sizing: border-box;
}

.sidebar {
  display: none;
  width: 240px;
  background-color: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  flex-direction: column;
  padding: 1.5rem;
  position: fixed;
  height: 100vh;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 2rem;
  padding-left: 0.75rem;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-height: 0;
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
  flex-shrink: 0;
}

.navItem:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.navItem.active {
  background-color: var(--color-bg-primary-light);
  color: var(--color-primary);
}

.icon {
  width: 24px;
  height: 24px;
}

.separator {
  height: 1px;
  background: var(--color-border);
  margin: 1rem 0;
  flex-shrink: 0;
}

.threadsHeader {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
  flex-shrink: 0;
}

.threadList {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  /* Use flex-grow to fill available space instead of fixed max-height */
  flex: 1;
  min-height: 0;
}

.threadItemWrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-right: 0.5rem;
  position: relative;
}

.threadLink {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: #475569;
  text-decoration: none;
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.threadLink:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.activeThread {
  background: var(--color-bg-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.threadTitle {
  overflow: hidden;
  text-overflow: ellipsis;
}

.pinnedIcon {
  width: 14px;
  height: 14px;
  color: #f59e0b;
  flex-shrink: 0;
}

.menuContainer {
  position: relative;
}

.menuBtn {
  background: transparent;
  border: none;
  color: #cbd5e0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.threadItemWrapper:hover .menuBtn,
.menuBtn:focus,
.menuDropdown {
  opacity: 1;
}

.menuBtn:hover {
  color: #475569;
  background: #f1f5f9;
}

.menuDropdown {
  position: fixed;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 9999;
  min-width: 140px;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
}

.menuItem {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 0.85rem;
  color: #475569;
  cursor: pointer;
  border-radius: 4px;
  text-decoration: none;
}

.menuItem:hover {
  background: #f8fafc;
  color: #1e293b;
}

.menuItemRed {
  color: #ef4444;
}

.menuItemRed:hover {
  background: #fee2e2;
  color: #dc2626;
}

.iconXs {
  width: 16px;
  height: 16px;
}

.noThreads {
  padding: 0.5rem;
  font-size: 0.85rem;
  color: #cbd5e0;
  font-style: italic;
}

.main {
  flex: 1;
  padding: 1rem;
  padding-bottom: 80px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

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

.mobileLogout {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-danger);
}

.bottomNavItem.activeBottom {
  color: var(--color-primary);
}

.logoutWrapper {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.logoutBtn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  width: 100%;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--color-danger);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.logoutBtn:hover {
  background-color: var(--color-bg-danger-light);
}

.mobileHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 40;
}

.logoMobile {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
}

.headerMenuBtn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.headerMenuBtn:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.menuSeparator {
  height: 1px;
  background: var(--color-border);
  margin: 0.25rem 0;
}

@media (min-width: 768px) {
  .sidebar {
    display: flex;
  }

  .mobileHeader {
    display: none;
  }

  .main {
    margin-left: 240px;
    padding: 2rem;
  }

  .bottomNav {
    display: none;
  }
}
</style>
