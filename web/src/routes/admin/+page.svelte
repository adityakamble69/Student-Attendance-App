<!-- routes/admin/+page.svelte — Phase 2: replaces the Phase 0 placeholder -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getDashboardCounts, type DashboardCounts } from '$lib/services/admin';
  import ListRow from '$lib/components/ListRow.svelte';

  let counts: DashboardCounts | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      counts = await getDashboardCounts();
    } catch (e) {
      error = 'Could not load dashboard stats.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="screen">
  <p class="greeting">Welcome back, Admin</p>

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if counts}
    <h1 class="hero-stat">{counts.totalStudents}</h1>
    <p class="hero-label">Total Students</p>

    <div class="divider"></div>

    <p class="micro-label">INSTITUTE OVERVIEW</p>
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-value">{counts.totalTeachers}</span>
        <span class="summary-key">Teachers</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{counts.totalSubjects}</span>
        <span class="summary-key">Subjects</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{counts.totalClasses}</span>
        <span class="summary-key">Classes</span>
      </div>
    </div>

    <div class="divider"></div>

    <p class="micro-label">MANAGE</p>
    <ListRow label="Teachers" meta={String(counts.totalTeachers)} onClick={() => goto('/admin/teachers')} />
    <ListRow label="Students" meta={String(counts.totalStudents)} onClick={() => goto('/admin/students')} />
    <ListRow label="Subjects" meta={String(counts.totalSubjects)} onClick={() => goto('/admin/subjects')} />
    <ListRow label="Classes" meta={String(counts.totalClasses)} onClick={() => goto('/admin/classes')} />
  {/if}
</div>

<style>
  .screen {
    max-width: 640px;
    margin: 0 auto;
    padding: 32px 20px;
    font-family: 'Inter', sans-serif;
    color: #191919;
  }
  .greeting {
    font-size: 14px;
    color: rgba(25, 25, 25, 0.7);
    margin-bottom: 4px;
  }
  .hero-stat {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 48px;
    font-weight: 400;
    margin: 0;
  }
  .hero-label {
    font-size: 14px;
    color: rgba(25, 25, 25, 0.7);
    margin-top: 4px;
  }
  .divider {
    height: 1px;
    background: #e5e7eb;
    margin: 24px 0;
  }
  .micro-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(25, 25, 25, 0.5);
    margin-bottom: 12px;
  }
  .summary-grid {
    display: flex;
    gap: 24px;
    margin-bottom: 8px;
  }
  .summary-item {
    display: flex;
    flex-direction: column;
  }
  .summary-value {
    font-size: 20px;
    font-weight: 600;
  }
  .summary-key {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.7);
  }
  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>