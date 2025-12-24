<script setup lang="ts">
import {
  KeyIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'landing'
});

const form = reactive({
  name: '',
  email: '',
  password: '',
  initToken: ''
});

const loading = ref(false);
const errorMsg = ref('');

async function handleSetup() {
  loading.value = true;
  errorMsg.value = '';

  try {
    const res = await $fetch('/api/auth/setup', {
      method: 'POST',
      body: form
    });

    // Refresh admin status to update middleware guard
    await refreshNuxtData('admin-status');

    // Redirect to home
    await navigateTo('/');

  } catch (err: any) {
    errorMsg.value = err.data?.message || 'Setup failed. Please check your inputs and token.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="$style.container">
    <div :class="['card', $style.authCard]">
      <div :class="$style.header">
        <div :class="$style.iconWrapper">
          <KeyIcon :class="$style.headerIcon" />
        </div>
        <h1 :class="$style.title">{{ $t('setup.title') }}</h1>
        <p :class="$style.subtitle">{{ $t('setup.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSetup" :class="$style.form">
        <Transition name="fade">
          <div v-if="errorMsg" :class="$style.error">
            <ExclamationTriangleIcon :class="$style.alertIcon" />
            <span>{{ errorMsg }}</span>
          </div>
        </Transition>

        <div :class="$style.formGroup">
          <label :class="$style.label">{{ $t('setup.form.initToken.label') }}</label>
          <div :class="$style.inputWrapper">
            <div :class="$style.inputIcon">
              <ShieldCheckIcon :class="$style.icon" />
            </div>
            <input v-model="form.initToken" type="password" required :class="$style.input"
              :placeholder="$t('setup.form.initToken.placeholder')" />
          </div>
        </div>

        <div :class="$style.divider">
          <span>{{ $t('setup.form.adminProfile') }}</span>
        </div>

        <div :class="$style.formGroup">
          <label :class="$style.label">{{ $t('setup.form.displayName') }}</label>
          <div :class="$style.inputWrapper">
            <div :class="$style.inputIcon">
              <UserIcon :class="$style.icon" />
            </div>
            <input v-model="form.name" type="text" required :class="$style.input" placeholder="Admin" />
          </div>
        </div>

        <div :class="$style.formGroup">
          <label :class="$style.label">{{ $t('setup.form.email') }}</label>
          <div :class="$style.inputWrapper">
            <div :class="$style.inputIcon">
              <EnvelopeIcon :class="$style.icon" />
            </div>
            <input v-model="form.email" type="email" required :class="$style.input" placeholder="admin@example.com" />
          </div>
        </div>

        <div :class="$style.formGroup">
          <label :class="$style.label">{{ $t('setup.form.password') }}</label>
          <div :class="$style.inputWrapper">
            <div :class="$style.inputIcon">
              <LockClosedIcon :class="$style.icon" />
            </div>
            <input v-model="form.password" type="password" required minlength="8" :class="$style.input"
              placeholder="••••••••" />
          </div>
        </div>

        <button type="submit" :class="['btn-primary', $style.submitBtn]" :disabled="loading">
          <span v-if="loading">{{ $t('setup.form.submitting') }}</span>
          <span v-else>{{ $t('setup.form.submit') }}</span>
          <ArrowRightIcon v-if="!loading" :class="$style.btnIcon" />
        </button>
      </form>
    </div>
  </div>
</template>

<style module>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: var(--color-bg-page);
}

.authCard {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.iconWrapper {
  width: 3.5rem;
  height: 3.5rem;
  background-color: var(--color-bg-primary-light);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: var(--color-primary);
}

.headerIcon {
  width: 1.75rem;
  height: 1.75rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error {
  background-color: var(--color-bg-danger-light);
  color: var(--color-danger);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alertIcon {
  width: 1.25rem;
  height: 1.25rem;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.inputWrapper {
  position: relative;
}

.inputIcon {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  padding-left: 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-muted);
}

.inputWrapper:focus-within .icon {
  color: var(--color-primary);
}

.input {
  width: 100%;
  display: block;
  padding-left: 2.5rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-main);
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: var(--color-bg-card);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

.divider span {
  padding: 0 1rem;
}

.submitBtn {
  width: 100%;
  padding: 0.75rem;
  justify-content: center;
  gap: 0.5rem;
}

.btnContent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btnIcon {
  width: 1.25rem;
  height: 1.25rem;
}

.hidden {
  opacity: 0;
}
</style>
