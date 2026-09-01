<!-- routes/teacher/+page.svelte — Phase 3: Teacher Dashboard & Today's Timetable -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/stores/auth';
  import { getTeacherDashboardSummary, type TeacherDashboardSummary } from '$lib/services/attendance';
  import StatusChip from '$lib/components/StatusChip.svelte';

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let selectedDay: string = 'Mon';
  let summary: TeacherDashboardSummary | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    const todayIndex = new Date().getDay();
    selectedDay = todayIndex === 0 ? 'Mon' : dayNames[todayIndex];
    await loadSummary();
  });

  async function loadSummary(day: string = selectedDay) {
    loading = true;
    error = '';
    try {
      summary = await getTeacherDashboardSummary(day);
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load timetable.';
    } finally {
      loading = false;
    }
  }

  function handleSelectDay(day: string) {
    selectedDay = day;
    loadSummary(day);
  }

  function formatTime(timeStr: string): string {
    if (!timeStr) return '';
    // Format "09:30:00" -> "09:30"
    return timeStr.slice(0, 5);
  }
</script>

<div class="screen">
  <div class="header-row">
    <div>
      <p class="greeting">Welcome back, {$authUser?.name || 'Teacher'}</p>
      <h1 class="screen-title">Teacher Dashboard</h1>
    </div>
    <div class="header-actions">
      <button class="nav-btn" on:click={() => goto('/teacher/history')} type="button">
        History
      </button>
      <button class="nav-btn" on:click={() => goto('/teacher/classes')} type="button">
        My Classes
      </button>
      <button class="nav-btn" on:click={() => goto('/teacher/leave')} type="button">
        Leave
      </button>
      <button class="nav-btn" on:click={() => goto('/teacher/reports')} type="button">
        Reports
      </button>
    </div>
  </div>

  {#if loading && !summary}
    <p class="muted">Loading timetable…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if summary}
    <!-- Hero Stats -->
    <div class="hero-card">
      <div class="hero-left">
        <h2 class="hero-stat">{summary.scheduledToday}</h2>
        <p class="hero-label">Classes Scheduled ({selectedDay})</p>
      </div>
      <div class="hero-right">
        <div class="stat-pill">
          <span class="dot green"></span>
          <span class="stat-text">{summary.completedToday} Marked</span>
        </div>
        <div class="stat-pill">
          <span class="dot amber"></span>
          <span class="stat-text">{summary.pendingToday} Pending</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Overview Stats -->
    <p class="micro-label">OVERVIEW</p>
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-value">{summary.totalStudents}</span>
        <span class="summary-key">Total Students</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{summary.classes.length}</span>
        <span class="summary-key">Slots ({selectedDay})</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">
          {summary.scheduledToday > 0 ? Math.round((summary.completedToday / summary.scheduledToday) * 100) : 0}%
        </span>
        <span class="summary-key">Marked Rate</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Day Selector -->
    <div class="section-header-row">
      <p class="micro-label">TIMETABLE & ATTENDANCE</p>
    </div>

    <div class="day-tabs">
      {#each DAYS as day}
        <button
          type="button"
          class="day-tab {selectedDay === day ? 'active' : ''}"
          on:click={() => handleSelectDay(day)}
        >
          {day}
        </button>
      {/each}
    </div>

    <!-- Timetable List -->
    {#if summary.classes.length === 0}
      <div class="empty-state">
        <p class="empty-title">No classes scheduled for {selectedDay}</p>
        <p class="empty-desc">Enjoy your free day or switch days to view your upcoming schedule.</p>
      </div>
    {:else}
      <div class="class-list">
        {#each summary.classes as item}
          <button
            class="class-card"
            type="button"
            on:click={() => goto(`/teacher/attendance/${item.class_id}`)}
          >
            <div class="class-card-header">
              <div class="class-info">
                <span class="subject-name">{item.subject_name}</span>
                {#if item.section}
                  <span class="section-badge">Sec {item.section}</span>
                {/if}
              </div>
              <StatusChip status={item.is_marked_today ? 'Marked' : 'Pending'} />
            </div>

            <div class="class-card-footer">
              <div class="meta-row">
                <span class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {formatTime(item.start_time)} – {formatTime(item.end_time)}
                </span>
                {#if item.room}
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                    Room {item.room}
                  </span>
                {/if}
              </div>

              <div class="card-actions">
                <button
                  class="smart-action-btn"
                  type="button"
                  on:click|stopPropagation={() => goto(`/teacher/smart/${item.class_id}`)}
                >
                  ⚡ Smart Station (QR/OTP)
                </button>
                <span class="action-hint">
                  {item.is_marked_today ? 'View / Edit' : 'Manual Mark'} →
                </span>
              </div>
            </div>
          </button>
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
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .greeting {
    font-size: 14px;
    color: rgba(25, 25, 25, 0.7);
    margin: 0 0 2px 0;
  }
  .screen-title {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 26px;
    font-weight: 400;
    margin: 0;
  }
  .header-actions {
    display: flex;
    gap: 8px;
  }
  .nav-btn {
    font-size: 13px;
    font-weight: 500;
    padding: 8px 14px;
    background: #f4f3f3;
    color: #191919;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition: background 200ms;
  }
  .nav-btn:hover {
    background: #eaeaea;
  }

  .hero-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f4f3f3;
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 20px;
  }
  .hero-stat {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 44px;
    font-weight: 400;
    margin: 0;
    line-height: 1;
  }
  .hero-label {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.7);
    margin: 6px 0 0 0;
  }
  .hero-right {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    padding: 6px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .dot.green {
    background: #16a34a;
  }
  .dot.amber {
    background: #f59e0b;
  }
  .stat-text {
    color: rgba(25, 25, 25, 0.8);
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
    margin: 0 0 12px 0;
  }
  .summary-grid {
    display: flex;
    gap: 28px;
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
    margin-top: 2px;
  }

  .day-tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
  .day-tab {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    background: transparent;
    color: rgba(25, 25, 25, 0.7);
    cursor: pointer;
    transition: all 200ms;
    white-space: nowrap;
  }
  .day-tab:hover {
    background: #f4f3f3;
  }
  .day-tab.active {
    background: #191919;
    color: #ffffff;
    border-color: #191919;
  }

  .class-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .class-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    background: #f4f3f3;
    border: none;
    border-radius: 14px;
    padding: 18px 20px;
    cursor: pointer;
    transition: background 200ms;
    text-align: left;
    font-family: 'Inter', sans-serif;
  }
  .class-card:hover {
    background: #eaeaea;
  }
  .class-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .class-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .subject-name {
    font-size: 16px;
    font-weight: 600;
    color: #191919;
  }
  .section-badge {
    font-size: 11px;
    font-weight: 500;
    background: rgba(25, 25, 25, 0.08);
    padding: 2px 8px;
    border-radius: 6px;
    color: rgba(25, 25, 25, 0.7);
  }
  .class-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: rgba(25, 25, 25, 0.7);
  }
  .meta-row {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .card-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .smart-action-btn {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    color: #191919;
    cursor: pointer;
    transition: all 150ms;
  }
  .smart-action-btn:hover {
    background: #191919;
    color: #ffffff;
    border-color: #191919;
  }
  .action-hint {
    font-size: 12px;
    font-weight: 500;
    color: #191919;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    background: #f9f9f9;
    border-radius: 14px;
    margin-top: 8px;
  }
  .empty-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 6px 0;
  }
  .empty-desc {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.6);
    margin: 0;
  }

  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>
