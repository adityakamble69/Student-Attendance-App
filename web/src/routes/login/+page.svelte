<!-- routes/login/+page.svelte — replaces navigation/AuthStack.tsx + screens/auth/LoginScreen.tsx
     Wired to lib/services/auth.ts (POST /auth/login) via the auth store. -->
<script lang="ts">
  import { authUser, type Role } from '$lib/stores/auth';

  let role: Role = 'student';
  let email = '';
  let password = '';
  let error: string | null = null;
  let isSubmitting = false;

  const roles: { value: Role; label: string }[] = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Admin' }
  ];

  async function handleSubmit() {
    error = null;

    if (!email || !password) {
      error = 'Please enter both email and password.';
      return;
    }

    isSubmitting = true;
    try {
      await authUser.login(role, email, password);
      // +layout.svelte's redirect logic picks the right dashboard once
      // authUser updates — no manual goto() needed here.
    } catch (err: any) {
      error = err?.response?.data?.error || 'Invalid email or password.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="screen">
  <div class="card">
    <p class="micro-label">Student Attendance</p>
    <h1 class="title">Sign in</h1>

    <div class="role-select" role="tablist" aria-label="Select role">
      {#each roles as r}
        <button
          type="button"
          class="role-pill"
          class:active={role === r.value}
          aria-pressed={role === r.value}
          on:click={() => (role = r.value)}
        >
          {r.label}
        </button>
      {/each}
    </div>

    <form on:submit|preventDefault={handleSubmit}>
      <label class="field">
        <span class="field-label">Email</span>
        <input type="email" bind:value={email} placeholder="you@example.com" autocomplete="email" />
      </label>

      <label class="field">
        <span class="field-label">Password</span>
        <input type="password" bind:value={password} placeholder="••••••••" autocomplete="current-password" />
      </label>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button type="submit" class="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  </div>
</div>

<style>
  .screen {
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    padding: 20px;
    font-family: 'Inter', sans-serif;
  }

  .card {
    width: 100%;
    max-width: 380px;
  }

  .micro-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #19191980;
    margin: 0 0 8px;
  }

  .title {
    font-family: 'PT Serif', serif;
    font-weight: 400;
    font-size: 32px;
    color: #191919;
    margin: 0 0 24px;
  }

  .role-select {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }

  .role-pill {
    flex: 1;
    padding: 10px 16px;
    border-radius: 9999px;
    border: 1px solid #19191933;
    background: transparent;
    color: #191919;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 200ms;
  }

  .role-pill.active {
    background: #191919;
    border-color: #191919;
    color: #ffffff;
  }

  .field {
    display: block;
    margin-bottom: 16px;
  }

  .field-label {
    display: block;
    font-size: 12px;
    color: #191919b3;
    margin-bottom: 6px;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #f4f3f3;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #191919;
    outline: none;
    transition: border-color 200ms;
  }

  input:focus {
    border-color: #19191966;
  }

  .error {
    font-size: 13px;
    color: #dc2626;
    margin: 0 0 16px;
  }

  .submit-btn {
    width: 100%;
    padding: 12px 24px;
    border-radius: 9999px;
    border: none;
    background: #191919;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 200ms;
  }

  .submit-btn:hover:not(:disabled) {
    background: #191919e6;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
