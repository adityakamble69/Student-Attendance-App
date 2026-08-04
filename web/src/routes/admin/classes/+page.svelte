<!--
  routes/admin/classes/+page.svelte — Phase 2: Classes & Divisions management.
  This screen is also "Assign Teachers to Subjects": picking a subject +
  teacher + day/time/room/section here creates the class row that IS the
  assignment (see lib/services/classes.ts for why there's no separate table).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { listClasses, createClass, deleteClass, type ClassItem, type Day } from '$lib/services/classes';
  import { listSubjects } from '$lib/services/subject';
  import { listTeachers } from '$lib/services/teacher';

  const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  let classes: ClassItem[] = [];
  let subjectOptions: { id: number; name: string }[] = [];
  let teacherOptions: { id: number; name: string }[] = [];

  let loading = true;
  let error = '';
  let showAddForm = false;

  let subjectId = '';
  let teacherId = '';
  let room = '';
  let day: Day = 'Mon';
  let startTime = '';
  let endTime = '';
  let section = '';
  let submitting = false;
  let formError = '';

  async function load() {
    loading = true;
    error = '';
    try {
      const [classResult, subjectResult, teacherResult] = await Promise.all([
        listClasses(1, 100),
        listSubjects(1, 200),
        listTeachers(1, 200),
      ]);
      classes = classResult.classes;
      subjectOptions = subjectResult.subjects.map((s) => ({ id: s.subject_id, name: s.subject_name }));
      teacherOptions = teacherResult.teachers.map((t) => ({ id: t.teacher_id, name: t.name }));
    } catch (e) {
      error = 'Could not load classes.';
    } finally {
      loading = false;
    }
  }

  onMount(load);

  function resetForm() {
    subjectId = '';
    teacherId = '';
    room = '';
    day = 'Mon';
    startTime = '';
    endTime = '';
    section = '';
    formError = '';
  }

  async function handleAdd() {
    formError = '';
    if (!subjectId || !teacherId || !startTime || !endTime) {
      formError = 'Subject, teacher, start time, and end time are required.';
      return;
    }
    submitting = true;
    try {
      await createClass({
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        room: room || undefined,
        day,
        startTime,
        endTime,
        section: section || undefined,
      });
      resetForm();
      showAddForm = false;
      await load();
    } catch (e: any) {
      formError = e?.response?.data?.error || 'Could not create class.';
    } finally {
      submitting = false;
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this class?')) return;
    try {
      await deleteClass(id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Could not delete class.');
    }
  }
</script>

<div class="screen">
  <div class="header-row">
    <h1 class="title">Classes</h1>
    <button class="btn-primary" on:click={() => (showAddForm = !showAddForm)}>
      {showAddForm ? 'Cancel' : '+ Add Class'}
    </button>
  </div>
  <p class="hint">Creating a class here assigns a teacher to a subject for that slot.</p>

  {#if showAddForm}
    <div class="form-card">
      {#if formError}<p class="form-error">{formError}</p>{/if}

      <select class="input" bind:value={subjectId}>
        <option value="" disabled>Select subject</option>
        {#each subjectOptions as s}
          <option value={s.id}>{s.name}</option>
        {/each}
      </select>

      <select class="input" bind:value={teacherId}>
        <option value="" disabled>Select teacher</option>
        {#each teacherOptions as t}
          <option value={t.id}>{t.name}</option>
        {/each}
      </select>

      <div class="input-row">
        <select class="input" bind:value={day}>
          {#each DAYS as d}
            <option value={d}>{d}</option>
          {/each}
        </select>
        <input class="input" placeholder="Start (HH:MM)" bind:value={startTime} />
        <input class="input" placeholder="End (HH:MM)" bind:value={endTime} />
      </div>

      <div class="input-row">
        <input class="input" placeholder="Room (optional)" bind:value={room} />
        <input class="input" placeholder="Section (optional)" bind:value={section} />
      </div>

      <button class="btn-primary full-width" on:click={handleAdd} disabled={submitting}>
        {submitting ? 'Creating…' : 'Create Class'}
      </button>
    </div>
  {/if}

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if classes.length === 0}
    <p class="muted">No classes yet — add the first one above.</p>
  {:else}
    {#each classes as c (c.class_id)}
      <div class="row">
        <div class="row-main">
          <span class="row-label">{c.subject_name} <span class="dot">·</span> {c.teacher_name}</span>
          <span class="row-meta">
            {c.day} {c.start_time}–{c.end_time}
            {#if c.room}· Room {c.room}{/if}
            {#if c.section}· Sec {c.section}{/if}
          </span>
        </div>
        <button class="row-delete" on:click={() => handleDelete(c.class_id)}>Remove</button>
      </div>
    {/each}
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
    align-items: center;
    margin-bottom: 8px;
  }
  .title {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 24px;
    font-weight: 400;
    margin: 0;
  }
  .hint {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.5);
    margin-bottom: 24px;
  }
  .btn-primary {
    background: #191919;
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 10px 20px;
    font-size: 14px;
    cursor: pointer;
    transition: background 200ms;
  }
  .btn-primary:hover {
    background: rgba(25, 25, 25, 0.9);
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .full-width {
    width: 100%;
    margin-top: 8px;
  }
  .form-card {
    background: #f4f3f3;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .input-row {
    display: flex;
    gap: 8px;
  }
  .input {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    flex: 1;
    min-width: 0;
    background: #fff;
  }
  .form-error {
    color: #dc2626;
    font-size: 12px;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f4f3f3;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 8px;
    transition: background 200ms;
  }
  .row:hover {
    background: #eaeaea;
  }
  .row-label {
    font-size: 14px;
    font-weight: 500;
    display: block;
  }
  .dot {
    color: rgba(25, 25, 25, 0.4);
  }
  .row-meta {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.7);
  }
  .row-delete {
    background: transparent;
    border: none;
    color: #dc2626;
    font-size: 12px;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 12px;
  }
  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>