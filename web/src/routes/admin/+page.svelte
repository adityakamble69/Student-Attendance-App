<!-- routes/admin/+page.svelte — Phase 2 + Phase 6: Full Admin Analytics Dashboard -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getDashboardCounts, type AdminDashboardData } from '$lib/services/admin';
  import ListRow from '$lib/components/ListRow.svelte';

  let data: AdminDashboardData | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      data = await getDashboardCounts();
    } catch (e) {
      error = 'Could not load dashboard stats.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="screen">
  <div class="header-row">
    <div>
      <p class="greeting">Welcome back, Admin</p>
      <h1 class="screen-title">Institute Analytics</h1>
    </div>
    <div class="header-actions">
      <button class="action-pill" on:click={() => goto('/admin/notifications')} type="button">
        📢 Broadcast Message
      </button>
    </div>
  </div>

  {#if loading}
    <p class="muted">Loading analytics…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if data}
    <!-- Hero Stats Grid -->
    <div class="hero-grid">
      <div class="hero-card">
        <h2 class="hero-stat">{data.totalStudents}</h2>
        <p class="hero-label">Total Students</p>
      </div>
      <div class="hero-card">
        <h2 class="hero-stat">{data.todayStats.attendancePercentage}%</h2>
        <p class="hero-label">Today's Attendance ({data.todayStats.presentCount}/{data.todayStats.totalMarked})</p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Institute Summary Metrics -->
    <p class="micro-label">INSTITUTE OVERVIEW</p>
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-value">{data.totalTeachers}</span>
        <span class="summary-key">Teachers</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{data.totalSubjects}</span>
        <span class="summary-key">Subjects</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{data.totalClasses}</span>
        <span class="summary-key">Classes</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{data.pendingLeaves}</span>
        <span class="summary-key">Pending Leaves</span>
      </div>
    </div>

    <!-- Department Distribution -->
    {#if data.departments.length > 0}
      <div class="divider"></div>
      <p class="micro-label">DEPARTMENT BREAKDOWN</p>
      <div class="dept-list">
        {#each data.departments as dept}
          <div class="dept-row">
            <div class="dept-info">
              <span class="dept-name">{dept.department}</span>
              <span class="dept-count">{dept.student_count} students</span>
            </div>
            <div class="dept-bar-track">
              <div
                class="dept-bar-fill"
                style="width: {(dept.student_count / (data.totalStudents || 1)) * 100}%;"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Low Attendance Alert List -->
    {#if data.lowAttendanceAlerts.length > 0}
      <div class="divider"></div>
      <p class="micro-label alert-header">⚠️ LOW ATTENDANCE ALERTS (&lt;75%)</p>
      <div class="alert-list">
        {#each data.lowAttendanceAlerts as s}
          <div class="alert-card">
            <div class="alert-left">
              <span class="student-name">{s.name}</span>
              <span class="student-meta">{s.roll_no} • {s.department || 'N/A'} {s.section ? `(Sec ${s.section})` : ''}</span>
            </div>
            <div class="alert-right">
              <span class="alert-pct">{s.percentage}%</span>
              <span class="alert-meta">{s.present_count}/{s.total_records} attended</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="divider"></div>

    <!-- Management Hub -->
    <p class="micro-label">MANAGE INSTITUTE</p>
    <ListRow label="Teachers" meta={String(data.totalTeachers)} onClick={() => goto('/admin/teachers')} />
    <ListRow label="Students" meta={String(data.totalStudents)} onClick={() => goto('/admin/students')} />
    <ListRow label="Subjects" meta={String(data.totalSubjects)} onClick={() => goto('/admin/subjects')} />
    <ListRow label="Classes & Timetables" meta={String(data.totalClasses)} onClick={() => goto('/admin/classes')} />
    <ListRow label="Attendance Reports & CSV" meta="Analytics" onClick={() => goto('/admin/reports')} />
    <ListRow label="Leave Requests" meta={`${data.pendingLeaves} pending`} onClick={() => goto('/admin/leave')} />
    <ListRow label="Broadcast Notifications" meta="Announcements" onClick={() => goto('/admin/notifications')} />
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
  .action-pill {
    font-size: 12px;
    font-weight: 500;
    padding: 8px 16px;
    background: #191919;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
  .hero-card {
    background: #f4f3f3;
    padding: 20px 24px;
    border-radius: 16px;
  }
  .hero-stat {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 42px;
    font-weight: 400;
    margin: 0;
    line-height: 1;
  }
  .hero-label {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.7);
    margin: 6px 0 0 0;
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
  .alert-header {
    color: #dc2626;
  }

  .summary-grid {
    display: flex;
    gap: 28px;
    flex-wrap: wrap;
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

  .dept-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .dept-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: #f4f3f3;
    padding: 10px 14px;
    border-radius: 10px;
  }
  .dept-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 500;
  }
  .dept-count {
    color: rgba(25, 25, 25, 0.6);
    font-size: 12px;
  }
  .dept-bar-track {
    width: 100%;
    height: 4px;
    background: #e5e7eb;
    border-radius: 9999px;
    overflow: hidden;
  }
  .dept-bar-fill {
    height: 100%;
    background: #191919;
    border-radius: 9999px;
  }

  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .alert-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fee2e2;
    padding: 12px 16px;
    border-radius: 12px;
  }
  .alert-left {
    display: flex;
    flex-direction: column;
  }
  .student-name {
    font-size: 13px;
    font-weight: 600;
    color: #991b1b;
  }
  .student-meta {
    font-size: 11px;
    color: #b91c1c;
  }
  .alert-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .alert-pct {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 16px;
    font-weight: 700;
    color: #991b1b;
  }
  .alert-meta {
    font-size: 10px;
    color: #b91c1c;
  }

  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>