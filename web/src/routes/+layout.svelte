<!--
  routes/+layout.svelte
  Replaces the old App.tsx (ThemeProvider > AuthProvider > RootNavigator).
  SvelteKit's file-based routing replaces AuthStack/AdminStack/TeacherStack/
  StudentStack — see routes/login, routes/admin, routes/teacher, routes/student.
  This layout guards routes based on the auth store, the same job
  RootNavigator used to do by picking which stack to render. It also
  rehydrates the session from storage on first load via authUser.init().
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authUser } from '$lib/stores/auth';

  let ready = false;

  const roleHome: Record<string, string> = {
    admin: '/admin',
    teacher: '/teacher',
    student: '/student'
  };

  onMount(async () => {
    await authUser.init();
    ready = true;
  });

  $: if (ready) {
    const path = $page.url.pathname;
    if (!$authUser && path !== '/login') {
      goto('/login');
    } else if ($authUser && (path === '/login' || path === '/')) {
      goto(roleHome[$authUser.role]);
    }
  }
</script>

{#if ready}
  <slot />
{/if}