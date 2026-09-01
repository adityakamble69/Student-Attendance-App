<!-- routes/teacher/history/+page.svelte — Phase 3: Attendance History Screen -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getMyClasses, type ClassItem } from '$lib/services/classes';
  import {
    getAttendanceHistory,
    type AttendanceHistoryResult,
  } from '$lib/services/attendance';
  import StatusChip from '$lib/components/StatusChip.svelte';

  let classes: ClassItem[] = [];
  let selectedClassId: number | null = null;
  let historyData: AttendanceHistoryResult | null = null;

  let fromDate = '';
  let toDate = '';
  let loadingClasses = true;
  let loadingHistory = false;
  let error = '';

  onMount(async () => {
    try {
      classes = await getMyClasses();
      const queryClassId = $page.url.searchParams.get('classId');
      if (queryClassId && classes.some((c) => c.class_id === Number(queryClassId))) {
        selectedClassId = Number(queryClassId);
      } else if (classes.length > 0) {
        selectedClassId = classes[0].class_id;
      }

      if (selectedClassId) {
        await loadHistory();
      }
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load your classes.';
    } finally {
      loadingClasses = false;
    }
  });

  async function loadHistory() {
    if (!selectedClassId) return;
    loadingHistory = true;
    error = '';
    try {
      historyData = await getAttendanceHistory(selectedClassId, {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
    } catch (e: any) {
      error = e.response?.data?.error || 'Failed to load attendance history.';
    } finally {
      loadingHistory = false;
    }
  }

  function handleClassChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    selectedClassId = Number(target.value);
    loadHistory();
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatTime(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="screen">
  <!-- Top Navigation -->
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/teacher')} type="button">
      ← Timetable
    </button>
  </div>

  <h1 class="screen-title">Attendance History</h1>
  <p class="screen-subtitle">View past attendance records, statistics, and audit logs.</p>

  {#if loadingClasses}
    <p class="muted">Loading classes…</p>
  {:else if error && classes.length === 0}
    <p class="error">{error}</p>
  {:else if classes.length === 0}
    <div class="empty-state">
      <p class="empty-title">No classes assigned</p>
      <p class="empty-desc">You do not have any active classes assigned yet.</p>
    </div>
  {:else}
    <!-- Filters Header -->
    <div class="filters-card">
      <div class="filter-group">
        <label for="class-select" class="filter-label">SELECT CLASS</label>
        <select
          id="class-select"
          class="select-input"
          value={selectedClassId}
          on:change={handleClassChange}
        >
          {#each classes as c}
            <option value={c.class_id}>
              {c.subject_name} {c.section ? `(Sec ${c.section})` : ''} • {c.day} {c.start_time.slice(0, 5)}
            </option>
          {/each}
        </select>
      </div>

      <div class="date-filters">
        <div class="filter-group">
          <label for="from-date" class="filter-label">FROM</label>
          <input
            id="from-date"
            type="date"
            class="date-input"
            bind:value={fromDate}
            on:change={loadHistory}
          />
        </div>
        <div class="filter-group">
          <label for="to-date" class="filter-label">TO</label>
          <input
            id="to-date"
            type="date"
            class="date-input"
            bind:value={toDate}
            on:change={loadHistory}
          />
        </div>
      </div>
    </div>

    <!-- History Sessions List -->
    {#if loadingHistory}
      <p class="muted">Loading history records…</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else if !historyData || historyData.sessions.length === 0}
      <div class="empty-state">
        <p class="empty-title">No attendance sessions recorded yet</p>
        <p class="empty-desc">Mark attendance from your timetable to start building history logs.</p>
        <button
          class="primary-btn"
          type="button"
          on:click={() => goto(`/teacher/attendance/${selectedClassId}`)}
        >
          Mark Today's Attendance
        </button>
      </div>
    {:else}
      <div class="history-list">
        {#each historyData.sessions as session}
          <div class="session-card">
            <div class="session-header">
              <div class="session-date-info">
                <span class="session-date">{formatDate(session.date)}</span>
                <span class="session-method-badge">{session.method}</span>
              </div>
              <div class="pct-badge">
                <span class="pct-num">{session.attendance_percentage}%</span>
                <span class="pct-lbl">Present</span>
              </div>
            </div>

            <div class="session-breakdown">
              <div class="count-pill">
                <span class="dot green"></span>
                <span class="count-val">{session.present_count} Present</span>
              </div>
              <div class="count-pill">
                <span class="dot red"></span>
                <span class="count-val">{session.absent_count} Absent</span>
              </div>
              <div class="count-pill">
                <span class="dot amber"></span>
                <span class="count-val">{session.late_count} Late</span>
              </div>
              <span class="total-meta">Total: {session.total_records} students</span>
            </div>

            <div class="session-footer">
              <span class="timestamp-meta">
                Marked at {formatTime(session.last_marked_at)}
              </span>
              <button
                class="edit-btn"
                type="button"
                on:click={() => {
                  const dateStr = session.date.slice(0, 10);
                  goto(`/teacher/attendance/${selectedClassId}`);
                }}
              >
                Edit Records →
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
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
    transition: color 150ms;
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
    margin: 0 0 24px 0;
  }

  .filters-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #f4f3f3;
    padding: 16px 18px;
    border-radius: 14px;
    margin-bottom: 24px;
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
    letter-spacing: 0.1em;
    color: rgba(25, 25, 25, 0.5);
  }
  .select-input,
  .date-input {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    color: #191919;
    outline: none;
  }
  .select-input:focus,
  .date-input:focus {
    border-color: #191919;
  }
  .date-filters {
    display: flex;
    gap: 12px;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .session-card {
    background: #f4f3f3;
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: background 150ms;
  }
  .session-card:hover {
    background: #eaeaea;
  }
  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .session-date-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .session-date {
    font-size: 15px;
    font-weight: 600;
  }
  .session-method-badge {
    font-size: 11px;
    font-weight: 500;
    background: rgba(25, 25, 25, 0.08);
    padding: 2px 7px;
    border-radius: 4px;
    color: rgba(25, 25, 25, 0.7);
  }
  .pct-badge {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .pct-num {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 20px;
    font-weight: 600;
  }
  .pct-lbl {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.6);
  }

  .session-breakdown {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 12px;
  }
  .count-pill {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .dot.green {
    background: #16a34a;
  }
  .dot.red {
    background: #dc2626;
  }
  .dot.amber {
    background: #f59e0b;
  }
  .count-val {
    color: rgba(25, 25, 25, 0.8);
    font-weight: 500;
  }
  .total-meta {
    color: rgba(25, 25, 25, 0.5);
    margin-left: auto;
  }

  .session-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e5e7eb;
    padding-top: 10px;
    margin-top: 2px;
  }
  .timestamp-meta {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.5);
  }
  .edit-btn {
    font-size: 12px;
    font-weight: 500;
    color: #191919;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .edit-btn:hover {
    text-decoration: underline;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    background: #f9f9f9;
    border-radius: 14px;
  }
  .empty-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 6px 0;
  }
  .empty-desc {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.6);
    margin: 0 0 16px 0;
  }
  .primary-btn {
    padding: 10px 20px;
    background: #191919;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>
