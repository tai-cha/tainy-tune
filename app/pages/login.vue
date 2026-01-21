<script setup lang="ts">
import { authClient } from '@app/utils/auth-client';

definePageMeta({
  layout: false // Custom simple layout for login
});

const form = reactive({
  email: '',
  password: '',
});

const errorMsg = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';

  try {
    const { data, error } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
      fetchOptions: {
        headers: {
          'x-turnstile-response': token.value
        }
      }
    }
    );

    if (error) {
      errorMsg.value = 'ログインに失敗しました。メールアドレスかパスワードを確認してください。'; // Fallback
      return;
    }

    await navigateTo('/', { external: true });
  } catch (e) {
    console.error('Unexpected login error:', e);
    errorMsg.value = '予期せぬエラーが発生しました。';
  } finally {
    loading.value = false;
  }
};
const { data: settings, refresh: refreshSettings } = await useFetch('/api/settings/public');
const token = ref('');

onMounted(() => {
  refreshSettings();
});
import VueTurnstile from 'vue-turnstile';
</script>

<template>
  <div :class="$style.container">
    <div :class="['card', $style.authCard]">
      <div :class="$style.header">
        <h1 :class="$style.title">{{ $t('login.title') }}</h1>
        <p :class="$style.subtitle">{{ $t('login.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleLogin" :class="$style.form">
        <div :class="$style.field">
          <label :class="$style.label">{{ $t('login.form.email') }}</label>
          <input v-model="form.email" type="email" required :class="$style.input" placeholder="example@local.host" />
        </div>

        <div :class="$style.field">
          <label :class="$style.label">{{ $t('login.form.password') }}</label>
          <input v-model="form.password" type="password" required :class="$style.input" placeholder="••••••••" />
        </div>

        <div v-if="settings?.turnstileSiteKey && settings?.registrationEnabled" :class="$style.turnstileWrapper">
          <VueTurnstile :key="settings.turnstileSiteKey" :site-key="settings.turnstileSiteKey" v-model="token"
            theme="light" />
        </div>

        <Transition name="fade">
          <div v-if="errorMsg" :class="$style.error">
            {{ errorMsg }}
          </div>
        </Transition>

        <button type="submit" :class="['btn-primary', $style.submitBtn]" :disabled="loading">
          <span v-if="loading">{{ $t('login.form.submitting') }}</span>
          <span v-else>{{ $t('login.form.submit') }}</span>
        </button>
      </form>

      <div v-if="settings?.registrationEnabled" :class="$style.footer">
        {{ $t('login.signupLink.text') }}
        <NuxtLink to="/signup" :class="$style.link">{{ $t('login.signupLink.link') }}</NuxtLink>
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
  background-color: var(--color-bg-page);
  padding: 1rem;
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
  color: var(--color-primary);
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
</style>
