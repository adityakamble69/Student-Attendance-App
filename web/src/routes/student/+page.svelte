<!-- routes/student/+page.svelte — Phase 4: Student Dashboard -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/stores/auth';
  import {
    getMyStats,
    getMyTimetable,
    type StudentStatsResult,
    type StudentTimetableSlot,
  } from '$lib/services/student';
  import StatusChip from '$lib/components/StatusChip.svelte';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let stats: StudentStatsResult | null = null;
  let todayClasses: StudentTimetableSlot[] = [];
  let currentDay = 'Mon';
  let loading = true;
  let error = '';

  onMount(async () => {
    const todayIndex = new Date().getDay();
    currentDay = todayIndex === 0 ? 'Mon' : dayNames[todayIndex];

    try {
      const [statsRes, timetableRes] = await Promise.all([
        getMyStats(),
        getMyTimetable(currentDay),
      ]);
      stats = statsRes;
      todayClasses = timetableRes.timetable;
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load student dashboard.';
    } finally {
      loading = false;
    }
  });

  function formatTime(t: string): string {
    return t ? t.slice(0, 5) : '';
  }
</script>

<div class="screen">
  <div class="header-row">
    <div>
      <p class="greeting">Welcome back, {$authUser?.name || 'Student'}</p>
      <h1 class="screen-title">Attendance Overview</h1>
    </div>
    <div class="header-actions">
      <button class="primary-btn" on:click={() => goto('/student/scan')} type="button">
        ⚡ Mark Attendance
      </button>
    </div>
  </div>

  {#if loading}
    <p class="muted">Loading dashboard…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if stats}
    <!-- Hero Attendance Metric -->
    <div class="hero-card">
      <div class="hero-left">
        <h2 class="hero-stat">{stats.overallPercentage}%</h2>
        <p class="hero-label">Overall Attendance</p>
      </div>
      <div class="hero-right">
        <div class="stat-pill">
          <span class="dot green"></span>
          <span class="stat-text">{stats.presentCount} Days Present</span>
        </div>
        <div class="stat-pill">
          <span class="dot red"></span>
          <span class="stat-text">{stats.absentCount} Days Absent</span>
        </div>
        <div class="stat-pill">
          <span class="dot amber"></span>
          <span class="stat-text">{stats.lateCount} Days Late</span>
        </div>
      </div>
    </div>

    <!-- Quick Navigation Bar -->
    <div class="quick-links">
      <button class="quick-card" on:click={() => goto('/student/scan')} type="button">
        <div class="quick-icon">⚡</div>
        <div>
          <span class="quick-title">Smart Mark</span>
          <span class="quick-sub">Scan QR / Enter OTP / GPS</span>
        </div>
      </button>
      <button class="quick-card" on:click={() => goto('/student/leave')} type="button">
        <div class="quick-icon">📝</div>
        <div>
          <span class="quick-title">Apply Leave</span>
          <span class="quick-sub">Submit & track requests</span>
        </div>
      </button>
    </div>

    <div class="divider"></div>

    <!-- Today's Schedule -->
    <div class="section-header-row">
      <p class="micro-label">TODAY'S CLASSES ({currentDay})</p>
      <button class="view-all-link" on:click={() => goto('/student/timetable')} type="button">
        Full Timetable →
      </button>
    </div>

    {#if todayClasses.length === 0}
      <div class="empty-state">
        <p class="empty-title">No classes scheduled today</p>
        <p class="empty-desc">Check your weekly schedule to see upcoming slots.</p>
      </div>
    {:else}
      <div class="class-list">
        {#each todayClasses as item}
          <div class="class-row">
            <div class="class-details">
              <span class="subject-title">{item.subject_name}</span>
              <span class="teacher-meta">{item.teacher_name} • Room {item.room || 'N/A'}</span>
            </div>
            <div class="class-time">
              <span class="time-text">{formatTime(item.start_time)} – {formatTime(item.end_time)}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="divider"></div>

    <!-- Subject-Wise Attendance Breakdown -->
    <div class="section-header-row">
      <p class="micro-label">SUBJECT-WISE ATTENDANCE</p>
      <button class="view-all-link" on:click={() => goto('/student/history')} type="button">
        View History →
      </button>
    </div>

    {#if stats.subjectBreakdown.length === 0}
      <div class="empty-state">
        <p class="empty-title">No subject attendance records yet</p>
        <p class="empty-desc">Your attendance logs will appear here once teachers start marking sessions.</p>
      </div>
    {:else}
      <div class="subject-grid">
        {#each stats.subjectBreakdown as item}
          <div class="subject-card">
            <div class="subject-top">
              <span class="sub-name">{item.subject_name}</span>
              <span class="sub-pct {item.percentage < 75 ? 'low' : ''}">{item.percentage}%</span>
            </div>

            <!-- Progress Bar -->
            <div class="progress-track">
              <div
                class="progress-fill {item.percentage < 75 ? 'low' : ''}"
                style="width: {Math.min(100, item.percentage)}%;"
              ></div>
            </div>

            <div class="sub-bottom">
              <span class="sub-meta">{item.present_count}/{item.total_sessions} attended</span>
              {#if item.percentage < 75}
                <span class="alert-tag">Low (&lt;75%)</span>
              {/if}
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
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
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
  .primary-btn {
    padding: 10px 20px;
    background: #191919;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 150ms;
    white-space: nowrap;
  }
  .primary-btn:hover {
    opacity: 0.9;
  }

  .hero-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f4f3f3;
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 16px;
  }
  .hero-stat {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 48px;
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
    padding: 5px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
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
  .stat-text {
    color: rgba(25, 25, 25, 0.8);
  }

  .quick-links {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  .quick-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f4f3f3;
    padding: 14px 16px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 150ms;
  }
  .quick-card:hover {
    background: #eaeaea;
  }
  .quick-icon {
    font-size: 20px;
  }
  .quick-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #191919;
  }
  .quick-sub {
    display: block;
    font-size: 11px;
    color: rgba(25, 25, 25, 0.6);
  }

  .divider {
    height: 1px;
    background: #e5e7eb;
    margin: 24px 0;
  }

  .section-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .micro-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(25, 25, 25, 0.5);
    margin: 0;
  }
  .view-all-link {
    font-size: 12px;
    font-weight: 500;
    color: #191919;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .view-all-link:hover {
    text-decoration: underline;
  }

  .class-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .class-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f4f3f3;
    padding: 14px 18px;
    border-radius: 12px;
  }
  .class-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .subject-title {
    font-size: 14px;
    font-weight: 600;
  }
  .teacher-meta {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.6);
  }
  .time-text {
    font-size: 12px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.8);
  }

  .subject-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .subject-card {
    background: #f4f3f3;
    padding: 16px 18px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .subject-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sub-name {
    font-size: 14px;
    font-weight: 600;
  }
  .sub-pct {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 18px;
    font-weight: 600;
    color: #16a34a;
  }
  .sub-pct.low {
    color: #dc2626;
  }
  .progress-track {
    width: 100%;
    height: 6px;
    background: #e5e7eb;
    border-radius: 9999px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #16a34a;
    border-radius: 9999px;
    transition: width 300ms ease;
  }
  .progress-fill.low {
    background: #dc2626;
  }
  .sub-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: rgba(25, 25, 25, 0.6);
  }
  .alert-tag {
    color: #dc2626;
    font-weight: 600;
  }

  .empty-state {
    text-align: center;
    padding: 32px 20px;
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
