<!-- routes/teacher/classes/+page.svelte — Phase 3: Teacher's My Classes & Student Rosters -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getMyClasses, getClassStudents, type ClassItem, type ClassStudentItem } from '$lib/services/classes';

  let classes: ClassItem[] = [];
  let selectedClass: ClassItem | null = null;
  let rosterStudents: ClassStudentItem[] = [];
  let loading = true;
  let loadingRoster = false;
  let error = '';
  let searchQuery = '';

  onMount(async () => {
    await loadClasses();
  });

  async function loadClasses() {
    loading = true;
    error = '';
    try {
      classes = await getMyClasses();
      if (classes.length > 0) {
        await selectClass(classes[0]);
      }
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load your classes.';
    } finally {
      loading = false;
    }
  }

  async function selectClass(c: ClassItem) {
    selectedClass = c;
    loadingRoster = true;
    try {
      const res = await getClassStudents(c.class_id);
      rosterStudents = res.students;
    } catch (e: any) {
      rosterStudents = [];
    } finally {
      loadingRoster = false;
    }
  }

  $: filteredRoster = rosterStudents.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.roll_no.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });
</script>

<div class="screen">
  <!-- Top Navigation -->
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/teacher')} type="button">
      ← Timetable
    </button>
  </div>

  <h1 class="screen-title">My Classes & Rosters</h1>
  <p class="screen-subtitle">View enrolled students and class schedules assigned to you.</p>

  {#if loading}
    <p class="muted">Loading classes…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if classes.length === 0}
    <div class="empty-state">
      <p class="empty-title">No classes assigned</p>
      <p class="empty-desc">Contact your administrator to have subjects and classes assigned to you.</p>
    </div>
  {:else}
    <!-- Class Selector Tabs / List -->
    <p class="micro-label">ASSIGNED CLASSES</p>
    <div class="class-chips">
      {#each classes as c}
        <button
          type="button"
          class="class-chip {selectedClass?.class_id === c.class_id ? 'active' : ''}"
          on:click={() => selectClass(c)}
        >
          <span class="chip-title">{c.subject_name}</span>
          <span class="chip-sub">{c.day} • {c.start_time.slice(0, 5)} {c.section ? `(Sec ${c.section})` : ''}</span>
        </button>
      {/each}
    </div>

    <!-- Selected Class Detail Card -->
    {#if selectedClass}
      <div class="class-detail-card">
        <div class="detail-left">
          <h2 class="class-name">{selectedClass.subject_name}</h2>
          <p class="class-meta">
            {selectedClass.day}s at {selectedClass.start_time.slice(0, 5)}–{selectedClass.end_time.slice(0, 5)}
            {#if selectedClass.room}
              • Room {selectedClass.room}
            {/if}
            {#if selectedClass.section}
              • Section {selectedClass.section}
            {/if}
          </p>
        </div>
        <div class="detail-actions">
          <button
            class="action-pill"
            type="button"
            on:click={() => goto(`/teacher/attendance/${selectedClass?.class_id}`)}
          >
            Mark Attendance →
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Roster Header -->
      <div class="roster-header">
        <div>
          <p class="micro-label">ENROLLED STUDENTS ({rosterStudents.length})</p>
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

      {#if loadingRoster}
        <p class="muted">Loading roster…</p>
      {:else if filteredRoster.length === 0}
        <div class="empty-state">
          <p class="empty-title">No students found</p>
          <p class="empty-desc">No students match your search or have been enrolled for this class section yet.</p>
        </div>
      {:else}
        <div class="roster-list">
          {#each filteredRoster as student, idx}
            <div class="roster-row">
              <span class="roster-idx">{String(idx + 1).padStart(2, '0')}</span>
              <div class="student-info">
                <div class="name-row">
                  <span class="student-name">{student.name}</span>
                  <span class="roll-badge">{student.roll_no}</span>
                </div>
                <div class="sub-info">
                  {#if student.email}
                    <span>{student.email}</span>
                  {/if}
                  {#if student.department}
                    <span>• {student.department}</span>
                  {/if}
                  {#if student.section}
                    <span>• Sec {student.section}</span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
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

  .micro-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(25, 25, 25, 0.5);
    margin: 0 0 10px 0;
  }

  .class-chips {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-bottom: 20px;
  }
  .class-chip {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 16px;
    background: #f4f3f3;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 150ms;
    white-space: nowrap;
    text-align: left;
  }
  .class-chip:hover {
    background: #eaeaea;
  }
  .class-chip.active {
    background: #191919;
    color: #ffffff;
    border-color: #191919;
  }
  .chip-title {
    font-size: 13px;
    font-weight: 600;
  }
  .chip-sub {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.6);
  }
  .class-chip.active .chip-sub {
    color: rgba(255, 255, 255, 0.7);
  }

  .class-detail-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f4f3f3;
    padding: 20px;
    border-radius: 14px;
  }
  .class-name {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }
  .class-meta {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.7);
    margin: 0;
  }
  .action-pill {
    padding: 9px 18px;
    background: #191919;
    color: #ffffff;
    font-size: 13px;
    font-weight: 500;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition: opacity 150ms;
  }
  .action-pill:hover {
    opacity: 0.9;
  }

  .divider {
    height: 1px;
    background: #e5e7eb;
    margin: 24px 0;
  }

  .roster-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .search-box {
    min-width: 200px;
  }
  .search-input {
    width: 100%;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 6px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    outline: none;
    box-sizing: border-box;
  }
  .search-input:focus {
    border-color: #191919;
  }

  .roster-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .roster-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #f4f3f3;
    padding: 12px 16px;
    border-radius: 12px;
    transition: background 150ms;
  }
  .roster-row:hover {
    background: #eaeaea;
  }
  .roster-idx {
    font-size: 12px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.4);
    font-variant-numeric: tabular-nums;
  }
  .student-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .name-row {
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
  .sub-info {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.5);
    display: flex;
    gap: 4px;
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
    margin: 0;
  }

  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>
