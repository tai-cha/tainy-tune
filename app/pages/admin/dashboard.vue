<script setup lang="ts">
definePageMeta({
  // middleware: 'auth' // global
});

const { t } = useI18n();

const { data: users, refresh: refreshUsers } = await useFetch('/api/admin/users');
const { data: settings, refresh: refreshSettings } = await useFetch('/api/admin/settings');

const loading = ref(false);

const form = reactive({
  turnstileSiteKey: '',
  turnstileSecretKey: ''
});

watch(settings, (val) => {
  if (val) {
    form.turnstileSiteKey = val.turnstileSiteKey || '';
    form.turnstileSecretKey = val.turnstileSecretKey || '';
  }
}, { immediate: true });

async function saveKeys() {
  if (!confirm(t('common.save') + '?')) return;
  loading.value = true;
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: {
        turnstileSiteKey: form.turnstileSiteKey,
        turnstileSecretKey: form.turnstileSecretKey
      }
    });
    await refreshSettings();
    alert(t('admin.settings.turnstile.saved'));
  } catch (e: any) {
    alert(t('common.error'));
  } finally {
    loading.value = false;
  }
}

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

async function toggleJournalEditing() {
  if (!settings.value) return;
  loading.value = true;
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: { allowJournalEditing: !settings.value.allowJournalEditing }
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
    </div>

    <div :class="$style.grid">
      <!-- Settings Section -->
      <div :class="$style.settingsSection">

        <!-- Registration Card -->
        <div v-if="settings" :class="['card', $style.card, $style.registrationCard]">
          <h3 :class="$style.cardTitle">{{ $t('admin.settings.registration') }}</h3>
          <div :class="$style.settingContent">
            <p :class="$style.settingDesc">{{ settings.registrationEnabled ? $t('auth.registration.status.enabled_desc')
              : $t('auth.registration.status.disabled_desc') }}</p>
            <button @click="toggleRegistration"
              :class="[$style.btnToggle, settings.registrationEnabled ? $style.enabled : $style.disabled]"
              :disabled="loading">
              {{ settings.registrationEnabled ? $t('admin.settings.enabled') : $t('admin.settings.disabled') }}
            </button>
          </div>
        </div>

        <!-- Journal Editing Card -->
        <div v-if="settings" :class="['card', $style.card, $style.registrationCard]">
          <h3 :class="$style.cardTitle">{{ $t('admin.settings.journalEditing.title') }}</h3>
          <div :class="$style.settingContent">
            <p :class="$style.settingDesc">
              {{ settings.allowJournalEditing ? $t('admin.settings.journalEditing.enabled_desc') :
                $t('admin.settings.journalEditing.disabled_desc') }}
            </p>
            <button @click="toggleJournalEditing"
              :class="[$style.btnToggle, settings.allowJournalEditing ? $style.enabled : $style.disabled]"
              :disabled="loading">
              {{ settings.allowJournalEditing ? $t('admin.settings.enabled') : $t('admin.settings.disabled') }}
            </button>
          </div>
        </div>

        <!-- Security Card -->
        <div :class="['card', $style.card, $style.securityCard]">
          <h3 :class="$style.cardTitle">{{ $t('admin.settings.turnstile.title') }}</h3>
          <form @submit.prevent="saveKeys">
            <div :class="$style.formGroup">
              <label>{{ $t('admin.settings.turnstile.siteKey') }}</label>
              <input v-model="form.turnstileSiteKey" type="text" :class="$style.input" placeholder="0x4AAAAAA..." />
            </div>
            <div :class="$style.formGroup">
              <label>{{ $t('admin.settings.turnstile.secretKey') }}</label>
              <input v-model="form.turnstileSecretKey" type="password" :class="$style.input"
                placeholder="0x4AAAAAA..." />
            </div>
            <div :class="$style.formFooter">

              <button type="submit" :class="$style.btnSave" :disabled="loading">
                {{ $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- User List Section -->
      <div :class="['card', $style.card, $style.userListCard]">
        <h3 :class="$style.cardTitle">{{ $t('admin.users.title') }}</h3>
        <div :class="$style.tableWrapper">
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
                  <select :value="user.role" @change="(e: Event) => updateRole(user.id, e)" :class="$style.roleSelect">
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
    </div>
  </div>
</template>

<style module>
.container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  color: var(--color-text-main);
  margin: 0;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
}

.grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.settingsSection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  /* Ensure it doesn't overflow */
}

/* ... */

.input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  /* ... */
}

/* ... */

.btnToggle {
  width: 100%;
  max-width: 100%;
  /* ... */
}

/* ... */

.btnSave {
  width: 100%;
  max-width: 100%;
  /* ... */
}

.card {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
}

.cardTitle {
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-main);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
}

.settingContent {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.settingDesc {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.btnToggle {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}


.enabled {
  background-color: var(--color-bg-success-light);
  color: var(--color-success);
  border: 1px solid var(--color-success-dim);
}

.disabled {
  background-color: var(--color-bg-danger-light);
  color: var(--color-danger);
  border: 1px solid var(--color-danger-dim);
}

.formGroup {
  margin-bottom: 1.25rem;
}

.formGroup label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-main);
  color: var(--color-text-main);
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.formFooter {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btnSave {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btnSave:hover {
  background: var(--color-primary-dark);
}

.btnSave:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.note {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
  text-align: center;
}

.userListCard {
  min-height: 500px;
}

.tableWrapper {
  overflow-x: auto;
}

.userTable {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
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
  font-size: 0.85rem;
  background-color: var(--color-bg-secondary);
}

.userTable tr:last-child td {
  border-bottom: none;
}

.userName {
  font-weight: 600;
  color: var(--color-text-main);
}

.userId {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
}

.roleSelect {
  padding: 0.4rem;
  border-radius: 4px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  font-size: 0.9rem;
}

.btnSm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.btnOutline {
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.btnOutline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-bg-primary-light);
}
</style>
