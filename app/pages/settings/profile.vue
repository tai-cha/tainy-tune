<script setup lang="ts">
import { useSession } from '~/app/utils/auth-client';

const { t } = useI18n();
const session = useSession();
const user = computed(() => session.value?.data?.user);

const formData = reactive({
  name: '',
});

watchEffect(() => {
  if (user.value) {
    formData.name = user.value.name;
  }
});

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
});

const status = reactive({
  type: '' as 'success' | 'error' | '',
  message: ''
});

const loading = ref(false);

async function updateProfile() {
  loading.value = true;
  status.message = '';
  try {
    await $fetch('/api/user/profile', {
      method: 'PUT',
      body: { name: formData.name }
    });
    status.type = 'success';
    status.message = t('profile.general.success');
  } catch (e) {
    status.type = 'error';
    status.message = t('profile.general.error');
  } finally {
    loading.value = false;
  }
}

async function changePassword() {
  if (passwordForm.new !== passwordForm.confirm) {
    status.type = 'error';
    status.message = t('profile.security.mismatch');
    return;
  }

  loading.value = true;
  status.message = '';

  try {
    await $fetch('/api/user/password', {
      method: 'PUT',
      body: {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      }
    });
    status.type = 'success';
    status.message = t('profile.security.success');
    passwordForm.current = '';
    passwordForm.new = '';
    passwordForm.confirm = '';
  } catch (e: any) {
    status.type = 'error';
    status.message = e.response?._data?.message || t('profile.security.error');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="$style.container">
    <div :class="['card', $style.profileCard]">
      <h2 :class="$style.title">{{ $t('profile.title') }}</h2>

      <div v-if="status.message" :class="[$style.alert, status.type === 'success' ? $style.success : $style.error]">
        {{ status.message }}
      </div>

      <div :class="$style.section">
        <h3 :class="$style.subtitle">{{ $t('profile.general.title') }}</h3>
        <form @submit.prevent="updateProfile">
          <div :class="$style.field">
            <label :class="$style.label">{{ $t('profile.general.name') }}</label>
            <input v-model="formData.name" type="text" :class="$style.inputField" required />
          </div>
          <div :class="$style.field">
            <label :class="$style.label">{{ $t('profile.general.email') }}</label>
            <input :value="user?.email" type="email" :class="$style.inputField" disabled />
            <span :class="$style.hint">{{ $t('profile.general.emailHint') }}</span>
          </div>
          <button type="submit" :class="['btn-primary', $style.btn]" :disabled="loading">{{ $t('profile.general.save')
            }}</button>
        </form>
      </div>

      <div :class="$style.divider"></div>

      <div :class="$style.section">
        <h3 :class="$style.subtitle">{{ $t('profile.security.title') }}</h3>
        <form @submit.prevent="changePassword">
          <div :class="$style.field">
            <label :class="$style.label">{{ $t('profile.security.current') }}</label>
            <input v-model="passwordForm.current" type="password" :class="$style.inputField" required />
          </div>
          <div :class="$style.field">
            <label :class="$style.label">{{ $t('profile.security.new') }}</label>
            <input v-model="passwordForm.new" type="password" :class="$style.inputField" required minlength="8" />
          </div>
          <div :class="$style.field">
            <label :class="$style.label">{{ $t('profile.security.confirm') }}</label>
            <input v-model="passwordForm.confirm" type="password" :class="$style.inputField" required minlength="8" />
          </div>
          <button type="submit" :class="['btn-primary', $style.btn]" :disabled="loading">{{
            $t('profile.security.update') }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style module>
.container {
  padding: 2rem 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.profileCard {
  padding: 2rem;
}

.title {
  margin-top: 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
  font-size: 1.5rem;
  color: var(--color-text-main);
}

.subtitle {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-text-main);
}

.section {
  margin-bottom: 2rem;
}

.field {
  margin-bottom: 1rem;
}

.label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-main);
}

.inputField {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.inputField:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--input-focus-ring);
}

.hint {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.divider {
  height: 1px;
  background: var(--color-border);
  margin: 2rem 0;
}

.alert {
  padding: 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.success {
  background-color: var(--color-bg-success-light);
  color: var(--color-success);
}

.error {
  background-color: var(--color-bg-danger-light);
  color: var(--color-danger);
}

.btn {
  /* Inherits basic styles from global .btn-primary but we can add overrides here */
  width: 100%;
}
</style>
