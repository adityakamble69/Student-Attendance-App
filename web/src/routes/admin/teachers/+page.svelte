<!-- routes/admin/teachers/+page.svelte — Phase 2: Teacher management -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { listTeachers, createTeacher, deleteTeacher, type Teacher } from '$lib/services/teacher';

  let teachers: Teacher[] = [];
  let loading = true;
  let error = '';
  let showAddForm = false;

  let name = '';
  let email = '';
  let password = '';
  let department = '';
  let submitting = false;
  let formError = '';

  async function load() {
    loading = true;
    error = '';
    try {
      const result = await listTeachers(1, 50);
      teachers = result.teachers;
    } catch (e) {
      error = 'Could not load teachers.';
    } finally {
      loading = false;
    }
  }

  onMount(load);

  function resetForm() {
    name = '';
    email = '';
    password = '';
    department = '';
    formError = '';
  }

  async function handleAdd() {
    formError = '';
    if (!name || !email || password.length < 8) {
      formError = 'Name, email, and an 8+ character password are required.';
      return;
    }
    submitting = true;
    try {
      await createTeacher({ name, email, password, department: department || undefined });
      resetForm();
      showAddForm = false;
      await load();
    } catch (e: any) {
      formError = e?.response?.data?.error || 'Could not add teacher.';
    } finally {
      submitting = false;
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this teacher?')) return;
    try {
      await deleteTeacher(id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Could not delete teacher.');
    }
  }
</script>

<div class="screen">
  <div class="header-row">
    <h1 class="title">Teachers</h1>
    <button class="btn-primary" on:click={() => (showAddForm = !showAddForm)}>
      {showAddForm ? 'Cancel' : '+ Add Teacher'}
    </button>
  </div>

  {#if showAddForm}
    <div class="form-card">
      {#if formError}<p class="form-error">{formError}</p>{/if}
      <input class="input" placeholder="Full name" bind:value={name} />
      <input class="input" placeholder="Email" type="email" bind:value={email} />
      <input class="input" placeholder="Password (min 8 chars)" type="password" bind:value={password} />
      <input class="input" placeholder="Department (optional)" bind:value={department} />
      <button class="btn-primary full-width" on:click={handleAdd} disabled={submitting}>
        {submitting ? 'Adding…' : 'Add Teacher'}
      </button>
    </div>
  {/if}

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if teachers.length === 0}
    <p class="muted">No teachers yet — add the first one above.</p>
  {:else}
    {#each teachers as teacher (teacher.teacher_id)}
      <div class="row">
        <div class="row-main">
          <span class="row-label">{teacher.name}</span>
          <span class="row-meta">{teacher.email} · {teacher.department || 'No dept.'}</span>
        </div>
        <button class="row-delete" on:click={() => handleDelete(teacher.teacher_id)}>Remove</button>
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
  .input {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
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
  }
  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>