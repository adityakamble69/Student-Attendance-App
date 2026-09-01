<!-- routes/teacher/reports/+page.svelte — Phase 6: Teacher Class Reports & CSV Exporter -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getMyClasses, type ClassItem } from '$lib/services/classes';
  import { getClassReport, downloadClassCsv, type ClassReportData } from '$lib/services/report';
  import StatusChip from '$lib/components/StatusChip.svelte';

  let classes: ClassItem[] = [];
  let selectedClassId: number | null = null;
  let reportData: ClassReportData | null = null;

  let fromDate = '';
  let toDate = '';
  let loading = true;
  let loadingReport = false;
  let exporting = false;
  let error = '';

  onMount(async () => {
    try {
      classes = await getMyClasses();
      if (classes.length > 0) {
        selectedClassId = classes[0].class_id;
        await loadReport();
      }
    } catch (e: any) {
      error = 'Could not load your classes.';
    } finally {
      loading = false;
    }
  });

  async function loadReport() {
    if (!selectedClassId) return;
    loadingReport = true;
    error = '';
    try {
      reportData = await getClassReport(selectedClassId, {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not load class report.';
    } finally {
      loadingReport = false;
    }
  }

  async function handleDownloadCsv() {
    if (!selectedClassId) return;
    exporting = true;
    try {
      const csv = await downloadClassCsv(selectedClassId, {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `class_${selectedClassId}_attendance_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      error = 'Failed to download CSV report.';
    } finally {
      exporting = false;
    }
  }
</script>

<div class="screen">
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/teacher')} type="button">
      ← Timetable
    </button>
  </div>

  <div class="header-row">
    <div>
      <h1 class="screen-title">Class Attendance Reports</h1>
      <p class="screen-subtitle">Generate detailed attendance logs and export to CSV/Excel.</p>
    </div>
    {#if reportData && reportData.records.length > 0}
      <button class="export-btn" type="button" disabled={exporting} on:click={handleDownloadCsv}>
        {exporting ? 'Generating CSV…' : '📥 Download CSV'}
      </button>
    {/if}
  </div>

  {#if loading}
    <p class="muted">Loading classes…</p>
  {:else if error && classes.length === 0}
    <p class="error">{error}</p>
  {:else if classes.length === 0}
    <div class="empty-state">
      <p class="empty-title">No classes assigned</p>
      <p class="empty-desc">You do not have any classes to generate reports for.</p>
    </div>
  {:else}
    <!-- Controls -->
    <div class="controls-card">
      <div class="control-group">
        <label for="class-s" class="control-label">CLASS</label>
        <select id="class-s" class="select-input" bind:value={selectedClassId} on:change={loadReport}>
          {#each classes as c}
            <option value={c.class_id}>
              {c.subject_name} {c.section ? `(Sec ${c.section})` : ''} • {c.day}
            </option>
          {/each}
        </select>
      </div>
      <div class="dates-row">
        <div class="control-group">
          <label for="from-d" class="control-label">FROM</label>
          <input id="from-d" type="date" class="date-input" bind:value={fromDate} on:change={loadReport} />
        </div>
        <div class="control-group">
          <label for="to-d" class="control-label">TO</label>
          <input id="to-d" type="date" class="date-input" bind:value={toDate} on:change={loadReport} />
        </div>
      </div>
    </div>

    {#if loadingReport}
      <p class="muted">Loading report records…</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else if !reportData || reportData.records.length === 0}
      <div class="empty-state">
        <p class="empty-title">No attendance records found</p>
        <p class="empty-desc">No attendance data exists for this date range.</p>
      </div>
    {:else}
      <!-- Records Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {#each reportData.records as r}
              <tr>
                <td class="date-cell">{r.date.slice(0, 10)}</td>
                <td class="roll-cell">{r.roll_no}</td>
                <td class="name-cell">{r.name}</td>
                <td><StatusChip status={r.status} /></td>
                <td class="method-cell">{r.method}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>

<style>
  .screen {
    max-width: 800px;
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

  .controls-card {
    display: flex;
    gap: 14px;
    background: #f4f3f3;
    padding: 16px 18px;
    border-radius: 14px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .control-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 160px;
  }
  .control-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: rgba(25, 25, 25, 0.5);
  }
  .select-input,
  .date-input {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    outline: none;
  }
  .dates-row {
    display: flex;
    gap: 12px;
    flex: 1;
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
  .date-cell {
    font-family: monospace;
    font-size: 12px;
    color: rgba(25, 25, 25, 0.7);
  }
  .roll-cell {
    font-weight: 600;
  }
  .name-cell {
    font-weight: 500;
  }
  .method-cell {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.6);
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
