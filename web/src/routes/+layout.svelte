<!-- routes/+layout.svelte — Root layout with role guard & universal navigation header -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authUser } from '$lib/stores/auth';
  import Navbar from '$lib/components/Navbar.svelte';

  let ready = false;

  const roleHome: Record<string, string> = {
    admin: '/admin',
    teacher: '/teacher',
    student: '/student',
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
  {#if $authUser && $page.url.pathname !== '/login'}
    <Navbar />
  {/if}
  <main>
    <slot />
  </main>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #ffffff;
    color: #191919;
    -webkit-font-smoothing: antialiased;
  }
  main {
    min-height: calc(100vh - 58px);
  }
</style>