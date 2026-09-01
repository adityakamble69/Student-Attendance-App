<!--
  lib/components/StatusChip.svelte
  design.md §5 "Status Chip" — small pill: dot (8px, status color) + label text,
  bg #F4F3F3, text #191919/70, text-xs.
  Used for Present/Absent/Late and Marked/Pending states.
-->
<script lang="ts">
  export let status: 'Present' | 'Absent' | 'Late' | 'Marked' | 'Pending' | 'Approved' | 'Rejected' | string;
  export let label: string = status;

  $: dotColor = getDotColor(status);

  function getDotColor(val: string): string {
    switch (val.toLowerCase()) {
      case 'present':
      case 'marked':
      case 'approved':
        return '#16A34A'; // green
      case 'absent':
      case 'rejected':
        return '#DC2626'; // red
      case 'late':
      case 'pending':
        return '#F59E0B'; // amber
      default:
        return '#9CA3AF'; // gray
    }
  }
</script>

<div class="chip">
  <span class="dot" style="background-color: {dotColor};"></span>
  <span class="label">{label}</span>
</div>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f4f3f3;
    padding: 4px 10px;
    border-radius: 9999px;
    font-family: 'Inter', sans-serif;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.8);
    text-transform: capitalize;
  }
</style>
