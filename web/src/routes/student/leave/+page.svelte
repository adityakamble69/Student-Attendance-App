<!-- routes/student/leave/+page.svelte — Phase 7: Student Leave Applications -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { applyLeave, getMyLeaves, type LeaveItem } from '$lib/services/leave';
  import StatusChip from '$lib/components/StatusChip.svelte';

  let leaves: LeaveItem[] = [];
  let fromDate = new Date().toISOString().slice(0, 10);
  let toDate = new Date().toISOString().slice(0, 10);
  let reason = '';

  let loading = true;
  let submitting = false;
  let error = '';
  let successMsg = '';

  onMount(async () => {
    await loadLeaves();
  });

  async function loadLeaves() {
    loading = true;
    error = '';
    try {
      leaves = await getMyLeaves();
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load your leave applications.';
    } finally {
      loading = false;
    }
  }

  async function handleApply() {
    if (!reason.trim()) {
      error = 'Please provide a reason for leave.';
      return;
    }

    submitting = true;
    error = '';
    successMsg = '';

    try {
      await applyLeave({
        reason: reason.trim(),
        fromDate,
        toDate,
      });
      successMsg = 'Leave application submitted successfully.';
      reason = '';
      await loadLeaves();
    } catch (e: any) {
      error = e.response?.data?.error || 'Failed to submit leave application.';
    } finally {
      submitting = false;
    }
  }

  function formatDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
</script>

<div class="screen">
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/student')} type="button">
      ← Dashboard
    </button>
  </div>

  <h1 class="screen-title">Leave Management</h1>
  <p class="screen-subtitle">Apply for official leave and track approval status.</p>

  <!-- Apply Form Card -->
  <div class="form-card">
    <h2 class="form-title">Apply for Leave</h2>

    {#if successMsg}
      <div class="banner success">{successMsg}</div>
    {/if}
    {#if error}
      <div class="banner error">{error}</div>
    {/if}

    <div class="dates-row">
      <div class="field-group">
        <label for="from-d" class="field-label">FROM DATE</label>
        <input id="from-d" type="date" class="input" bind:value={fromDate} />
      </div>
      <div class="field-group">
        <label for="to-d" class="field-label">TO DATE</label>
        <input id="to-d" type="date" class="input" bind:value={toDate} />
      </div>
    </div>

    <div class="field-group">
      <label for="reason-txt" class="field-label">REASON FOR LEAVE</label>
      <textarea
        id="reason-txt"
        class="textarea"
        rows="3"
        placeholder="E.g., Medical leave, Family emergency, Competition participation…"
        bind:value={reason}
      ></textarea>
    </div>

    <button
      class="submit-btn"
      type="button"
      disabled={submitting || !reason.trim()}
      on:click={handleApply}
    >
      {submitting ? 'Submitting…' : 'Submit Leave Application'}
    </button>
  </div>

  <div class="divider"></div>

  <!-- Leave History -->
  <p class="micro-label">MY APPLICATIONS ({leaves.length})</p>

  {#if loading}
    <p class="muted">Loading applications…</p>
  {:else if leaves.length === 0}
    <div class="empty-state">
      <p class="empty-title">No leave applications</p>
      <p class="empty-desc">You haven't submitted any leave requests yet.</p>
    </div>
  {:else}
    <div class="leaves-list">
      {#each leaves as item}
        <div class="leave-card">
          <div class="leave-top">
            <span class="leave-dates">
              {formatDate(item.from_date)} – {formatDate(item.to_date)}
            </span>
            <StatusChip status={item.status} />
          </div>
          <p class="leave-reason">{item.reason}</p>
          <div class="leave-bottom">
            <span class="meta-time">Submitted on {formatDate(item.created_at)}</span>
          </div>
        </div>
      {/each}
    </div>
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
    margin: 0 0 24px 0;
  }

  .form-card {
    background: #f4f3f3;
    padding: 20px 24px;
    border-radius: 16px;
    margin-bottom: 24px;
  }
  .form-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  .dates-row {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
  }
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
    margin-bottom: 14px;
  }
  .field-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: rgba(25, 25, 25, 0.5);
  }
  .input,
  .textarea {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 9px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    outline: none;
    box-sizing: border-box;
    width: 100%;
  }
  .input:focus,
  .textarea:focus {
    border-color: #191919;
  }
  .textarea {
    resize: vertical;
  }

  .submit-btn {
    width: 100%;
    padding: 12px;
    background: #191919;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 150ms;
  }
  .submit-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .banner {
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 12px;
    margin-bottom: 14px;
  }
  .banner.success {
    background: #dcfce7;
    color: #166534;
  }
  .banner.error {
    background: #fee2e2;
    color: #991b1b;
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

  .leaves-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .leave-card {
    background: #f4f3f3;
    padding: 16px 18px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .leave-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .leave-dates {
    font-size: 14px;
    font-weight: 600;
  }
  .leave-reason {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.8);
    margin: 0;
    line-height: 1.4;
  }
  .leave-bottom {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: rgba(25, 25, 25, 0.4);
    border-top: 1px solid #e5e7eb;
    padding-top: 6px;
    margin-top: 2px;
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
</style>
