<!-- routes/student/timetable/+page.svelte — Phase 4: Student Weekly Timetable -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getMyTimetable, type StudentTimetableSlot } from '$lib/services/student';

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let selectedDay = 'Mon';
  let timetable: StudentTimetableSlot[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    const todayIndex = new Date().getDay();
    selectedDay = todayIndex === 0 ? 'Mon' : dayNames[todayIndex];
    await loadTimetable(selectedDay);
  });

  async function loadTimetable(day: string) {
    loading = true;
    error = '';
    try {
      const res = await getMyTimetable(day);
      timetable = res.timetable;
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load timetable.';
    } finally {
      loading = false;
    }
  }

  function handleSelectDay(day: string) {
    selectedDay = day;
    loadTimetable(day);
  }

  function formatTime(t: string): string {
    return t ? t.slice(0, 5) : '';
  }
</script>

<div class="screen">
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/student')} type="button">
      ← Dashboard
    </button>
  </div>

  <h1 class="screen-title">Weekly Schedule</h1>
  <p class="screen-subtitle">Your lecture timings and classroom assignments.</p>

  <!-- Day Selector -->
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

  {#if loading}
    <p class="muted">Loading timetable…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if timetable.length === 0}
    <div class="empty-state">
      <p class="empty-title">No classes on {selectedDay}</p>
      <p class="empty-desc">Enjoy your day off or switch to other days to see schedule.</p>
    </div>
  {:else}
    <div class="timetable-list">
      {#each timetable as slot}
        <div class="slot-card">
          <div class="slot-left">
            <span class="slot-time">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
            {#if slot.room}
              <span class="slot-room">Room {slot.room}</span>
            {/if}
          </div>
          <div class="slot-right">
            <h3 class="slot-subject">{slot.subject_name}</h3>
            <p class="slot-teacher">Instructor: {slot.teacher_name}</p>
            {#if slot.section}
              <span class="slot-sec">Section {slot.section}</span>
            {/if}
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

  .day-tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-bottom: 20px;
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
    transition: all 150ms;
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

  .timetable-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .slot-card {
    display: flex;
    background: #f4f3f3;
    border-radius: 14px;
    padding: 16px 20px;
    gap: 20px;
    align-items: center;
  }
  .slot-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 110px;
    border-right: 1px solid #e5e7eb;
    padding-right: 16px;
  }
  .slot-time {
    font-size: 13px;
    font-weight: 600;
    color: #191919;
  }
  .slot-room {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.6);
  }
  .slot-right {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .slot-subject {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
  }
  .slot-teacher {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.7);
    margin: 0;
  }
  .slot-sec {
    font-size: 10px;
    font-weight: 600;
    color: rgba(25, 25, 25, 0.5);
    text-transform: uppercase;
    margin-top: 2px;
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
