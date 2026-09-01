<!-- routes/student/history/+page.svelte — Phase 4: Student Attendance History Logs -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getMyHistory, type StudentAttendanceRecord } from '$lib/services/student';
  import StatusChip from '$lib/components/StatusChip.svelte';

  let records: StudentAttendanceRecord[] = [];
  let fromDate = '';
  let toDate = '';
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadHistory();
  });

  async function loadHistory() {
    loading = true;
    error = '';
    try {
      const res = await getMyHistory({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      records = res.records;
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load attendance logs.';
    } finally {
      loading = false;
    }
  }

  function formatDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTime(t: string): string {
    if (!t) return '';
    const dt = new Date(t);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="screen">
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/student')} type="button">
      ← Dashboard
    </button>
  </div>

  <h1 class="screen-title">Attendance History</h1>
  <p class="screen-subtitle">Your attendance verification audit logs.</p>

  <!-- Filter Bar -->
  <div class="filter-card">
    <div class="filter-group">
      <label for="from-dt" class="filter-label">FROM</label>
      <input
        id="from-dt"
        type="date"
        class="date-input"
        bind:value={fromDate}
        on:change={loadHistory}
      />
    </div>
    <div class="filter-group">
      <label for="to-dt" class="filter-label">TO</label>
      <input
        id="to-dt"
        type="date"
        class="date-input"
        bind:value={toDate}
        on:change={loadHistory}
      />
    </div>
  </div>

  {#if loading}
    <p class="muted">Loading records…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if records.length === 0}
    <div class="empty-state">
      <p class="empty-title">No attendance records found</p>
      <p class="empty-desc">No attendance records match your filter criteria.</p>
    </div>
  {:else}
    <div class="records-list">
      {#each records as rec}
        <div class="record-row">
          <div class="record-left">
            <span class="subject-title">{rec.subject_name}</span>
            <span class="record-date">{formatDate(rec.date)}</span>
            <span class="record-meta">
              Instructor: {rec.teacher_name} • Via {rec.method}
            </span>
          </div>
          <div class="record-right">
            <StatusChip status={rec.status} />
            <span class="record-time">{formatTime(rec.marked_at)}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .screen {
    max-width: 680px;
    margin: 0 auto;
    padding: 32px 20px;
    font-family: 'Inter', sans-serif;
    color: #191919;
  }
  .top-bar {
    margin-bottom: 16px;
  }
  .back-link {
    font-size: 13px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.7);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .back-link:hover {
    color: #191919;
  }
  .screen-title {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 26px;
    font-weight: 400;
    margin: 0 0 4px 0;
  }
  .screen-subtitle {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.7);
    margin: 0 0 20px 0;
  }

  .filter-card {
    display: flex;
    gap: 12px;
    background: #f4f3f3;
    padding: 14px 16px;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }
  .filter-label {
    font-size: 10px;
    font-weight: 600;
    color: rgba(25, 25, 25, 0.5);
    letter-spacing: 0.1em;
  }
  .date-input {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 6px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    outline: none;
  }

  .records-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .record-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f4f3f3;
    padding: 14px 18px;
    border-radius: 12px;
    transition: background 150ms;
  }
  .record-row:hover {
    background: #eaeaea;
  }
  .record-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .subject-title {
    font-size: 14px;
    font-weight: 600;
  }
  .record-date {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.8);
  }
  .record-meta {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.5);
  }
  .record-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .record-time {
    font-size: 10px;
    color: rgba(25, 25, 25, 0.4);
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    background: #f9f9f9;
    border-radius: 14px;
  }
  .empty-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }
  .empty-desc {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.5);
    margin: 0;
  }

  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>
