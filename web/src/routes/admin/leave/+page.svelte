<!-- routes/admin/leave/+page.svelte — Phase 7: Admin Institute Leave Management -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { listAllLeaves, reviewLeave, type LeaveItem, type LeaveStatus } from '$lib/services/leave';
  import StatusChip from '$lib/components/StatusChip.svelte';

  let leaves: LeaveItem[] = [];
  let currentFilter: LeaveStatus | 'All' = 'Pending';
  let loading = true;
  let error = '';
  let actionLoadingId: number | null = null;

  onMount(async () => {
    await loadLeaves();
  });

  async function loadLeaves() {
    loading = true;
    error = '';
    try {
      const res = await listAllLeaves(currentFilter === 'All' ? undefined : currentFilter);
      leaves = res.leaves;
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load leave requests.';
    } finally {
      loading = false;
    }
  }

  function handleFilterChange(f: LeaveStatus | 'All') {
    currentFilter = f;
    loadLeaves();
  }

  async function handleReview(leaveId: number, status: 'Approved' | 'Rejected') {
    actionLoadingId = leaveId;
    try {
      await reviewLeave(leaveId, status);
      await loadLeaves();
    } catch (e: any) {
      error = e.response?.data?.error || `Failed to ${status.toLowerCase()} leave request.`;
    } finally {
      actionLoadingId = null;
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
    <button class="back-link" on:click={() => goto('/admin')} type="button">
      ← Dashboard
    </button>
  </div>

  <h1 class="screen-title">Leave Request Management</h1>
  <p class="screen-subtitle">Oversee all student leave requests across departments.</p>

  <!-- Filter Tabs -->
  <div class="filter-tabs">
    <button
      type="button"
      class="filter-tab {currentFilter === 'Pending' ? 'active' : ''}"
      on:click={() => handleFilterChange('Pending')}
    >
      Pending
    </button>
    <button
      type="button"
      class="filter-tab {currentFilter === 'Approved' ? 'active' : ''}"
      on:click={() => handleFilterChange('Approved')}
    >
      Approved
    </button>
    <button
      type="button"
      class="filter-tab {currentFilter === 'Rejected' ? 'active' : ''}"
      on:click={() => handleFilterChange('Rejected')}
    >
      Rejected
    </button>
    <button
      type="button"
      class="filter-tab {currentFilter === 'All' ? 'active' : ''}"
      on:click={() => handleFilterChange('All')}
    >
      All
    </button>
  </div>

  {#if loading}
    <p class="muted">Loading requests…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if leaves.length === 0}
    <div class="empty-state">
      <p class="empty-title">No {currentFilter.toLowerCase()} leave requests</p>
      <p class="empty-desc">All leave applications have been reviewed.</p>
    </div>
  {:else}
    <div class="leaves-list">
      {#each leaves as item}
        <div class="leave-card">
          <div class="leave-header">
            <div class="student-meta">
              <span class="student-name">{item.student_name}</span>
              <span class="roll-badge">{item.roll_no}</span>
              {#if item.department}
                <span class="dept-badge">{item.department}</span>
              {/if}
              {#if item.section}
                <span class="sec-badge">Sec {item.section}</span>
              {/if}
            </div>
            <StatusChip status={item.status} />
          </div>

          <div class="leave-dates">
            📅 {formatDate(item.from_date)} – {formatDate(item.to_date)}
          </div>

          <p class="leave-reason">"{item.reason}"</p>

          <div class="leave-footer">
            <span class="meta-date">Applied on {formatDate(item.created_at)}</span>

            {#if item.status === 'Pending'}
              <div class="action-buttons">
                <button
                  class="btn reject-btn"
                  type="button"
                  disabled={actionLoadingId === item.leave_id}
                  on:click={() => handleReview(item.leave_id, 'Rejected')}
                >
                  Reject
                </button>
                <button
                  class="btn approve-btn"
                  type="button"
                  disabled={actionLoadingId === item.leave_id}
                  on:click={() => handleReview(item.leave_id, 'Approved')}
                >
                  Approve
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .screen {
    max-width: 720px;
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

  .filter-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }
  .filter-tab {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 9999px;
    border: 1px solid #e5e7eb;
    background: transparent;
    color: rgba(25, 25, 25, 0.7);
    cursor: pointer;
    transition: all 150ms;
  }
  .filter-tab:hover {
    background: #f4f3f3;
  }
  .filter-tab.active {
    background: #191919;
    color: #ffffff;
    border-color: #191919;
  }

  .leaves-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .leave-card {
    background: #f4f3f3;
    padding: 18px 20px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .leave-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .student-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .student-name {
    font-size: 15px;
    font-weight: 600;
  }
  .roll-badge,
  .dept-badge,
  .sec-badge {
    font-size: 11px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.6);
    background: #ffffff;
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }
  .leave-dates {
    font-size: 13px;
    font-weight: 500;
    color: #191919;
  }
  .leave-reason {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.8);
    margin: 0;
    line-height: 1.4;
  }
  .leave-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e5e7eb;
    padding-top: 10px;
  }
  .meta-date {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.5);
  }
  .action-buttons {
    display: flex;
    gap: 8px;
  }
  .btn {
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 150ms;
  }
  .approve-btn {
    background: #16a34a;
    color: #ffffff;
    border: 1px solid #16a34a;
  }
  .approve-btn:hover {
    background: #15803d;
  }
  .reject-btn {
    background: #ffffff;
    color: #dc2626;
    border: 1px solid #dc2626;
  }
  .reject-btn:hover {
    background: #fee2e2;
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
