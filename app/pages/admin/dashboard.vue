<script setup lang="ts">
definePageMeta({
  // middleware: 'auth' // global
});

const { t } = useI18n();

const { data: users, refresh: refreshUsers } = await useFetch('/api/admin/users');
const { data: settings, refresh: refreshSettings } = await useFetch('/api/admin/settings');

const loading = ref(false);

async function toggleRegistration() {
  if (!settings.value) return;
  loading.value = true;
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: { registrationEnabled: !settings.value.registrationEnabled }
    });
    await refreshSettings();
  } finally {
    loading.value = false;
  }
}

async function updateRole(userId: string, event: Event) {
  const select = event.target as HTMLSelectElement;
  const newRole = select.value;

  if (!confirm(t('admin.users.actions.confirmRole', { role: newRole }))) {
    await refreshUsers();
    return;
  }

  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: { role: newRole }
    });
  } catch (e) {
    alert(t('admin.users.actions.promote'));
    await refreshUsers();
  }
}

async function resetPassword(userId: string) {
  const newPassword = prompt(t('admin.users.actions.newPasswordPrompt'));
  if (!newPassword) return;

  try {
    await $fetch(`/api/admin/users/${userId}/password`, {
      method: 'POST',
      body: { newPassword }
    });
    alert(t('admin.users.actions.resetSuccess'));
  } catch (e: any) {
    alert(t('admin.users.actions.resetError', { message: e.response?._data?.message || e.message }));
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h1 :class="$style.title">{{ $t('admin.title') }}</h1>

      <!-- System Settings Card -->
      <div v-if="settings" :class="['card', $style.settingsCard]">
        <h3 :class="$style.cardTitle">{{ $t('admin.settings.title') }}</h3>
        <div :class="$style.settingItem">
          <span>{{ $t('admin.settings.registration') }}</span>
          <button @click="toggleRegistration"
            :class="[$style.btnToggle, settings.registrationEnabled ? $style.enabled : $style.disabled]"
            :disabled="loading">
            {{ settings.registrationEnabled ? $t('admin.settings.enabled') : $t('admin.settings.disabled') }}
          </button>
        </div>
      </div>
    </div>

    <!-- User List -->
    <div :class="['card', $style.tableContainer]">
      <h3 :class="$style.cardTitle">{{ $t('admin.users.title') }}</h3>
      <table :class="$style.userTable">
        <thead>
          <tr>
            <th>{{ $t('admin.users.table.name') }}</th>
            <th>{{ $t('admin.users.table.email') }}</th>
            <th>{{ $t('admin.users.table.role') }}</th>
            <th>{{ $t('admin.users.table.joined') }}</th>
            <th>{{ $t('admin.users.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <div :class="$style.userName">{{ user.name }}</div>
              <div :class="$style.userId">ID: {{ user.id.substring(0, 8) }}...</div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <select :value="user.role" @change="(e) => updateRole(user.id, e)" :class="$style.roleSelect">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <button @click="resetPassword(user.id)" :class="[$style.btnSm, $style.btnOutline]">
                {{ $t('admin.users.actions.resetPassword') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style module>
.container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title {
  margin: 0;
  font-size: 1.8rem;
  color: var(--color-text-main);
}

.settingsCard {
  padding: 1rem 1.5rem;
  min-width: 300px;
}

.cardTitle {
  margin-top: 0;
  font-size: 1.1rem;
}

.settingItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btnToggle {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.enabled {
  background-color: var(--color-bg-success-light);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.disabled {
  background-color: var(--color-bg-danger-light);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

.tableContainer {
  padding: 1.5rem;
  overflow-x: auto;
}

.userTable {
  width: 100%;
  border-collapse: collapse;
}

.userTable th,
.userTable td {
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.userTable th {
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.userName {
  font-weight: 600;
}

.userId {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.roleSelect {
  padding: 0.3rem;
  border-radius: 4px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.btnSm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 4px;
  cursor: pointer;
}

.btnOutline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
}

.btnOutline:hover {
  background: var(--color-bg-secondary);
}
</style>
