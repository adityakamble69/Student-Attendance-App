<!-- routes/teacher/attendance/[classId]/+page.svelte — Phase 3: Manual Attendance Marking Screen -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import {
    getClassAttendance,
    markAttendanceManual,
    type ClassAttendanceData,
    type AttendanceStatus,
    type AttendanceRecordInput,
  } from '$lib/services/attendance';
  import StatusChip from '$lib/components/StatusChip.svelte';

  const classId = Number($page.params.classId);

  let selectedDate = new Date().toISOString().slice(0, 10);
  let attendanceData: ClassAttendanceData | null = null;
  let studentStatuses: Map<number, AttendanceStatus> = new Map();

  let loading = true;
  let saving = false;
  let error = '';
  let successMsg = '';
  let searchQuery = '';

  onMount(async () => {
    await fetchAttendance();
  });

  async function fetchAttendance() {
    loading = true;
    error = '';
    successMsg = '';
    try {
      attendanceData = await getClassAttendance(classId, selectedDate);
      studentStatuses = new Map();
      attendanceData.students.forEach((s) => {
        if (s.status) {
          studentStatuses.set(s.student_id, s.status);
        }
      });
      studentStatuses = studentStatuses; // trigger reactivity
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load class attendance data.';
    } finally {
      loading = false;
    }
  }

  function handleDateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.value) {
      selectedDate = target.value;
      fetchAttendance();
    }
  }

  function setStudentStatus(studentId: number, status: AttendanceStatus) {
    studentStatuses.set(studentId, status);
    studentStatuses = studentStatuses;
  }

  function markAll(status: AttendanceStatus) {
    if (!attendanceData) return;
    attendanceData.students.forEach((s) => {
      studentStatuses.set(s.student_id, status);
    });
    studentStatuses = studentStatuses;
  }

  $: totalStudents = attendanceData?.students.length || 0;
  $: presentCount = Array.from(studentStatuses.values()).filter((s) => s === 'Present').length;
  $: absentCount = Array.from(studentStatuses.values()).filter((s) => s === 'Absent').length;
  $: lateCount = Array.from(studentStatuses.values()).filter((s) => s === 'Late').length;
  $: unmarkedCount = totalStudents - studentStatuses.size;

  $: filteredStudents = (attendanceData?.students || []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.roll_no.toLowerCase().includes(q);
  });

  async function handleSave() {
    if (!attendanceData || studentStatuses.size === 0) {
      error = 'Please mark attendance for at least one student before saving.';
      return;
    }

    saving = true;
    error = '';
    successMsg = '';

    const records: AttendanceRecordInput[] = [];
    studentStatuses.forEach((status, studentId) => {
      records.push({ studentId, status });
    });

    try {
      await markAttendanceManual(classId, selectedDate, records);
      successMsg = `Saved attendance for ${records.length} students on ${selectedDate}.`;
      await fetchAttendance();
    } catch (e: any) {
      error = e.response?.data?.error || 'Failed to save attendance.';
    } finally {
      saving = false;
    }
  }
</script>

<div class="screen">
  <!-- Top Bar -->
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/teacher')} type="button">
      ← Timetable
    </button>
    <button class="history-link" on:click={() => goto(`/teacher/history?classId=${classId}`)} type="button">
      View History
    </button>
  </div>

  {#if loading && !attendanceData}
    <p class="muted">Loading class attendance…</p>
  {:else if error && !attendanceData}
    <p class="error">{error}</p>
  {:else if attendanceData}
    <!-- Class Header -->
    <div class="class-header">
      <div>
        <div class="title-row">
          <h1 class="class-title">{attendanceData.class.subject_name}</h1>
          {#if attendanceData.class.section}
            <span class="section-tag">Section {attendanceData.class.section}</span>
          {/if}
        </div>
        <p class="class-subtitle">
          {attendanceData.class.day} • {attendanceData.class.start_time?.slice(0, 5)}–{attendanceData.class.end_time?.slice(0, 5)}
          {#if attendanceData.class.room}
            • Room {attendanceData.class.room}
          {/if}
        </p>
      </div>

      <!-- Date Selector -->
      <div class="date-selector">
        <label for="att-date" class="date-label">DATE</label>
        <input
          id="att-date"
          type="date"
          class="date-input"
          value={selectedDate}
          on:change={handleDateChange}
        />
      </div>
    </div>

    <!-- Live Stats Bar -->
    <div class="stats-card">
      <div class="stat-pill">
        <span class="stat-num">{totalStudents}</span>
        <span class="stat-lbl">Total</span>
      </div>
      <div class="stat-pill">
        <span class="dot green"></span>
        <span class="stat-num">{presentCount}</span>
        <span class="stat-lbl">Present</span>
      </div>
      <div class="stat-pill">
        <span class="dot red"></span>
        <span class="stat-num">{absentCount}</span>
        <span class="stat-lbl">Absent</span>
      </div>
      <div class="stat-pill">
        <span class="dot amber"></span>
        <span class="stat-num">{lateCount}</span>
        <span class="stat-lbl">Late</span>
      </div>
      {#if unmarkedCount > 0}
        <div class="stat-pill">
          <span class="dot gray"></span>
          <span class="stat-num">{unmarkedCount}</span>
          <span class="stat-lbl">Unmarked</span>
        </div>
      {/if}
    </div>

    <!-- Quick Batch Actions & Search -->
    <div class="controls-row">
      <div class="batch-actions">
        <button class="batch-btn" type="button" on:click={() => markAll('Present')}>
          Mark All Present
        </button>
        <button class="batch-btn" type="button" on:click={() => markAll('Absent')}>
          Mark All Absent
        </button>
      </div>
      <div class="search-box">
        <input
          type="text"
          placeholder="Search student or roll no…"
          bind:value={searchQuery}
          class="search-input"
        />
      </div>
    </div>

    <!-- Messages -->
    {#if successMsg}
      <div class="feedback-banner success">{successMsg}</div>
    {/if}
    {#if error}
      <div class="feedback-banner error">{error}</div>
    {/if}

    <!-- Student Roster List -->
    {#if filteredStudents.length === 0}
      <div class="empty-state">
        <p>No students found for this class.</p>
      </div>
    {:else}
      <div class="student-list">
        {#each filteredStudents as student, idx}
          {@const currentStatus = studentStatuses.get(student.student_id)}
          <div class="student-row">
            <div class="student-left">
              <span class="student-index">{String(idx + 1).padStart(2, '0')}</span>
              <div class="student-details">
                <div class="student-name-row">
                  <span class="student-name">{student.name}</span>
                  <span class="roll-badge">{student.roll_no}</span>
                </div>
                {#if student.email}
                  <span class="student-email">{student.email}</span>
                {/if}
              </div>
            </div>

            <!-- 3-Way Status Toggle Buttons -->
            <div class="toggle-group">
              <button
                type="button"
                class="toggle-btn p-btn {currentStatus === 'Present' ? 'active' : ''}"
                on:click={() => setStudentStatus(student.student_id, 'Present')}
                title="Mark Present"
              >
                P
              </button>
              <button
                type="button"
                class="toggle-btn a-btn {currentStatus === 'Absent' ? 'active' : ''}"
                on:click={() => setStudentStatus(student.student_id, 'Absent')}
                title="Mark Absent"
              >
                A
              </button>
              <button
                type="button"
                class="toggle-btn l-btn {currentStatus === 'Late' ? 'active' : ''}"
                on:click={() => setStudentStatus(student.student_id, 'Late')}
                title="Mark Late"
              >
                L
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Save Attendance Bar -->
    <div class="save-bar">
      <button
        class="save-btn"
        type="button"
        disabled={saving || studentStatuses.size === 0}
        on:click={handleSave}
      >
        {saving ? 'Saving Attendance…' : `Save Attendance (${studentStatuses.size}/${totalStudents})`}
      </button>
    </div>
  {/if}
</div>

<style>
  .screen {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 20px 80px 20px;
    font-family: 'Inter', sans-serif;
    color: #191919;
  }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .back-link,
  .history-link {
    font-size: 13px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.7);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 150ms;
  }
  .back-link:hover,
  .history-link:hover {
    color: #191919;
  }

  .class-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }
  .title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .class-title {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 26px;
    font-weight: 400;
    margin: 0;
  }
  .section-tag {
    font-size: 12px;
    font-weight: 500;
    background: #f4f3f3;
    padding: 3px 10px;
    border-radius: 9999px;
  }
  .class-subtitle {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.7);
    margin: 6px 0 0 0;
  }

  .date-selector {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .date-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: rgba(25, 25, 25, 0.5);
    margin-bottom: 4px;
  }
  .date-input {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 6px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    color: #191919;
    outline: none;
  }

  .stats-card {
    display: flex;
    gap: 12px;
    background: #f4f3f3;
    padding: 14px 18px;
    border-radius: 12px;
    margin-bottom: 20px;
    overflow-x: auto;
  }
  .stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stat-num {
    font-size: 15px;
    font-weight: 600;
  }
  .stat-lbl {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.6);
  }
  .dot {
    width: 8px;
    height: 8px;
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
  .dot.gray {
    background: #9ca3af;
  }

  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .batch-actions {
    display: flex;
    gap: 8px;
  }
  .batch-btn {
    font-size: 12px;
    font-weight: 500;
    padding: 7px 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 150ms;
  }
  .batch-btn:hover {
    background: #f4f3f3;
    border-color: #d1d5db;
  }

  .search-box {
    flex: 1;
    min-width: 180px;
    max-width: 260px;
  }
  .search-input {
    width: 100%;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 7px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    outline: none;
    box-sizing: border-box;
  }
  .search-input:focus {
    border-color: #191919;
  }

  .feedback-banner {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 16px;
  }
  .feedback-banner.success {
    background: #dcfce7;
    color: #166534;
  }
  .feedback-banner.error {
    background: #fee2e2;
    color: #991b1b;
  }

  .student-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .student-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f4f3f3;
    padding: 12px 16px;
    border-radius: 12px;
    transition: background 150ms;
  }
  .student-row:hover {
    background: #eaeaea;
  }
  .student-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .student-index {
    font-size: 12px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.4);
    font-variant-numeric: tabular-nums;
  }
  .student-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .student-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .student-name {
    font-size: 14px;
    font-weight: 500;
  }
  .roll-badge {
    font-size: 11px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.7);
    background: #ffffff;
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }
  .student-email {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.5);
  }

  .toggle-group {
    display: flex;
    gap: 4px;
    background: #ffffff;
    padding: 3px;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
  }
  .toggle-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    color: rgba(25, 25, 25, 0.5);
    transition: all 150ms;
  }
  .toggle-btn:hover {
    color: #191919;
  }

  .p-btn.active {
    background: #16a34a;
    color: #ffffff;
  }
  .a-btn.active {
    background: #dc2626;
    color: #ffffff;
  }
  .l-btn.active {
    background: #f59e0b;
    color: #ffffff;
  }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: rgba(25, 25, 25, 0.5);
    font-size: 14px;
  }

  .save-bar {
    position: sticky;
    bottom: 20px;
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
  .save-btn {
    width: 100%;
    max-width: 380px;
    padding: 14px 28px;
    background: #191919;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transition: all 200ms;
  }
  .save-btn:hover:not(:disabled) {
    background: rgba(25, 25, 25, 0.9);
    transform: translateY(-1px);
  }
  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>
