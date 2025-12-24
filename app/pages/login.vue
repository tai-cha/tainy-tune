<script setup lang="ts">
import { signIn } from '~/app/utils/auth-client';

definePageMeta({
  layout: false // Custom simple layout for login
});

const form = ref({
  email: '',
  password: '',
});

const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    console.log('Attempting login with:', form.value.email);
    const { data, error: err } = await signIn.email({
      email: form.value.email,
      password: form.value.password,
    });

    console.log('Login response:', { data, err });

    if (err) {
      console.error('Login error:', err);
      error.value = 'ログインに失敗しました。メールアドレスかパスワードを確認してください。';
      loading.value = false;
      return;
    }

    console.log('Login success, navigating to /');
    // Redirect handled by client or middleware, but explicit is safe
    await navigateTo('/');
  } catch (e) {
    console.error('Unexpected login error:', e);
    error.value = '予期せぬエラーが発生しました。';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="card login-card">
      <h1 class="title">Tainy Tune</h1>
      <p class="subtitle">おかえりなさい</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input id="email" v-model="form.email" type="email" required class="input-field"
            placeholder="example@local.host" />
        </div>

        <div class="form-group">
          <label for="password">パスワード</label>
          <input id="password" v-model="form.password" type="password" required class="input-field" />
        </div>

        <div v-if="error" class="error-msg">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary full-width" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログイン' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-page);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
}

.title {
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  color: var(--color-primary);
}

.subtitle {
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.full-width {
  width: 100%;
  margin-top: 1rem;
}

.error-msg {
  color: var(--color-danger);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
