<!-- routes/admin/subjects/+page.svelte — Phase 2: Subject management -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { listSubjects, createSubject, deleteSubject, type Subject } from '$lib/services/subject';

  let subjects: Subject[] = [];
  let loading = true;
  let error = '';
  let showAddForm = false;

  let subjectName = '';
  let semester = '';
  let department = '';
  let submitting = false;
  let formError = '';

  async function load() {
    loading = true;
    error = '';
    try {
      const result = await listSubjects(1, 50);
      subjects = result.subjects;
    } catch (e) {
      error = 'Could not load subjects.';
    } finally {
      loading = false;
    }
  }

  onMount(load);

  function resetForm() {
    subjectName = '';
    semester = '';
    department = '';
    formError = '';
  }

  async function handleAdd() {
    formError = '';
    if (!subjectName) {
      formError = 'Subject name is required.';
      return;
    }
    submitting = true;
    try {
      await createSubject({
        subjectName,
        semester: semester ? Number(semester) : undefined,
        department: department || undefined,
      });
      resetForm();
      showAddForm = false;
      await load();
    } catch (e: any) {
      formError = e?.response?.data?.error || 'Could not add subject.';
    } finally {
      submitting = false;
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this subject?')) return;
    try {
      await deleteSubject(id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Could not delete subject.');
    }
  }
</script>

<div class="screen">
  <div class="header-row">
    <h1 class="title">Subjects</h1>
    <button class="btn-primary" on:click={() => (showAddForm = !showAddForm)}>
      {showAddForm ? 'Cancel' : '+ Add Subject'}
    </button>
  </div>

  {#if showAddForm}
    <div class="form-card">
      {#if formError}<p class="form-error">{formError}</p>{/if}
      <input class="input" placeholder="Subject name" bind:value={subjectName} />
      <div class="input-row">
        <input class="input" placeholder="Semester" type="number" bind:value={semester} />
        <input class="input" placeholder="Department" bind:value={department} />
      </div>
      <button class="btn-primary full-width" on:click={handleAdd} disabled={submitting}>
        {submitting ? 'Adding…' : 'Add Subject'}
      </button>
    </div>
  {/if}

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if subjects.length === 0}
    <p class="muted">No subjects yet — add the first one above.</p>
  {:else}
    {#each subjects as subject (subject.subject_id)}
      <div class="row">
        <div class="row-main">
          <span class="row-label">{subject.subject_name}</span>
          <span class="row-meta">
            {subject.department || 'No dept.'}
            {#if subject.semester}· Sem {subject.semester}{/if}
          </span>
        </div>
        <button class="row-delete" on:click={() => handleDelete(subject.subject_id)}>Remove</button>
      </div>
    {/each}
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
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .title {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 24px;
    font-weight: 400;
    margin: 0;
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