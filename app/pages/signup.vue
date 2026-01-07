<script setup lang="ts">
import { authClient } from '@app/utils/auth-client';

definePageMeta({
  layout: 'landing'
});

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: ''
});

const loading = ref(false);
const errorMsg = ref('');

async function handleSignup() {
  loading.value = true;
  errorMsg.value = '';

  if (form.password !== form.passwordConfirm) {
    errorMsg.value = 'パスワードが一致しません (Passwords do not match)';
    loading.value = false;
    return;
  }

  try {
    const { data, error } = await authClient.signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
      fetchOptions: {
        headers: {
          'x-turnstile-response': token.value
        }
      }
    });

    if (error) {
      errorMsg.value = error.message || 'Signup failed.';
      return;
    }

    // Success - redirect home
    await navigateTo('/', { external: true });
  } catch (err: any) {
    errorMsg.value = 'An unexpected error occurred.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const { data: settings } = await useFetch('/api/settings/public');
const token = ref('');
import VueTurnstile from 'vue-turnstile';
</script>

<template>
  <div :class="$style.container">
    <div :class="['card', $style.authCard]">
      <div :class="$style.header">
        <h1 :class="$style.title">{{ $t('signup.title') }}</h1>
        <p :class="$style.subtitle">{{ $t('signup.subtitle') }}</p>
      </div>

      <div v-if="settings && !settings.registrationEnabled" :class="$style.closedMessage">
        <p>{{ $t('signup.closed') }}</p>
        <NuxtLink to="/login" class="btn btn-primary" :class="$style.backBtn">{{ $t('common.back') }}</NuxtLink>
      </div>

      <form v-else @submit.prevent="handleSignup" :class="$style.form">
        <Transition name="fade">
          <div v-if="errorMsg" :class="$style.error">
            {{ errorMsg }}
          </div>
        </Transition>

        <div :class="$style.field">
          <label :class="$style.label">{{ $t('signup.form.name') }}</label>
          <input v-model="form.name" type="text" required :class="$style.input" placeholder="Your name" />
        </div>

        <div :class="$style.field">
          <label :class="$style.label">{{ $t('signup.form.email') }}</label>
          <input v-model="form.email" type="email" required :class="$style.input" placeholder="you@example.com" />
        </div>

        <div :class="$style.field">
          <label :class="$style.label">{{ $t('signup.form.password') }}</label>
          <input v-model="form.password" type="password" required minlength="8" :class="$style.input"
            placeholder="••••••••" />
        </div>

        <div :class="$style.field">
          <label :class="$style.label">{{ $t('signup.form.passwordConfirm') }}</label>
          <input v-model="form.passwordConfirm" type="password" required minlength="8" :class="$style.input"
            placeholder="••••••••" />
        </div>

        <div v-if="settings?.turnstileSiteKey && settings?.registrationEnabled" :class="$style.turnstileWrapper">
          <VueTurnstile :site-key="settings.turnstileSiteKey" v-model="token" theme="light" />
        </div>

        <button type="submit" :class="['btn-primary', $style.submitBtn]" :disabled="loading">
          <span v-if="loading">{{ $t('signup.form.submitting') }}</span>
          <span v-else>{{ $t('signup.form.submit') }}</span>
        </button>
      </form>

      <div :class="$style.footer">
        {{ $t('signup.loginLink.text') }}
        <NuxtLink to="/login" :class="$style.link">{{ $t('signup.loginLink.link') }}</NuxtLink>
      </div>
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
  max-width: 400px;
  padding: 2.5rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1rem;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-main);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: var(--color-bg-card);
}

.error {
  background-color: var(--color-bg-danger-light);
  color: var(--color-danger);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  text-align: center;
}

.submitBtn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  justify-content: center;
}

.footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.closedMessage {
  text-align: center;
  padding: 2rem 0;
  color: var(--color-text-main);
  font-weight: 500;
}

.backBtn {
  margin-top: 1rem;
  display: inline-block;
  text-decoration: none;
}
</style>
