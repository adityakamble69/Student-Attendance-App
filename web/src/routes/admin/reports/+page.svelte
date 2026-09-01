<!-- routes/admin/reports/+page.svelte — Phase 6: Admin Institute Attendance Reports & CSV Export -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getInstituteReport, downloadInstituteCsv, type InstituteSummaryItem } from '$lib/services/report';

  let summaryList: InstituteSummaryItem[] = [];
  let loading = true;
  let exporting = false;
  let error = '';

  onMount(async () => {
    await loadSummary();
  });

  async function loadSummary() {
    loading = true;
    error = '';
    try {
      const res = await getInstituteReport();
      summaryList = res.summary;
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load institute reports.';
    } finally {
      loading = false;
    }
  }

  async function handleDownloadCsv() {
    exporting = true;
    try {
      const csv = await downloadInstituteCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'institute_attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      error = 'Failed to download CSV export.';
    } finally {
      exporting = false;
    }
  }
</script>

<div class="screen">
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/admin')} type="button">
      ← Dashboard
    </button>
  </div>

  <div class="header-row">
    <div>
      <h1 class="screen-title">Institute Attendance Reports</h1>
      <p class="screen-subtitle">Aggregate attendance summary across all subjects and departments.</p>
    </div>
    {#if summaryList.length > 0}
      <button class="export-btn" type="button" disabled={exporting} on:click={handleDownloadCsv}>
        {exporting ? 'Generating CSV…' : '📥 Download CSV Report'}
      </button>
    {/if}
  </div>

  {#if loading}
    <p class="muted">Loading reports…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if summaryList.length === 0}
    <div class="empty-state">
      <p class="empty-title">No attendance sessions recorded yet</p>
      <p class="empty-desc">Once teachers start taking attendance, full institute statistics will appear here.</p>
    </div>
  {:else}
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Instructor</th>
            <th>Section</th>
            <th>Sessions</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {#each summaryList as item}
            <tr>
              <td class="sub-cell">{item.subject_name}</td>
              <td>{item.teacher_name}</td>
              <td class="sec-cell">{item.section || '—'}</td>
              <td>{item.total_sessions}</td>
              <td class="pres-cell">{item.total_present || 0}</td>
              <td class="abs-cell">{item.total_absent || 0}</td>
              <td>
                <span class="pct-pill {Number(item.attendance_percentage || 0) < 75 ? 'low' : ''}">
                  {item.attendance_percentage || 0}%
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .screen {
    max-width: 880px;
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

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
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
    margin: 0;
  }
  .export-btn {
    padding: 10px 20px;
    background: #191919;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 150ms;
  }
  .export-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  .export-btn:disabled {
    opacity: 0.5;
  }

  .table-container {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 13px;
  }
  .data-table th {
    background: #f9f9f9;
    padding: 12px 16px;
    font-weight: 600;
    color: rgba(25, 25, 25, 0.7);
    border-bottom: 1px solid #e5e7eb;
  }
  .data-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f4f3f3;
  }
  .sub-cell {
    font-weight: 600;
  }
  .sec-cell {
    color: rgba(25, 25, 25, 0.6);
  }
  .pres-cell {
    color: #16a34a;
    font-weight: 500;
  }
  .abs-cell {
    color: #dc2626;
    font-weight: 500;
  }
  .pct-pill {
    display: inline-block;
    padding: 3px 8px;
    background: #dcfce7;
    color: #166534;
    font-weight: 600;
    border-radius: 6px;
    font-size: 12px;
  }
  .pct-pill.low {
    background: #fee2e2;
    color: #991b1b;
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
