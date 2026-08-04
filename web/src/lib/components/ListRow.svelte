<!--
  lib/components/ListRow.svelte
  design.md §5 "Interactive Row" — direct port of the reference's
  "01 / Conversational →" row pattern. Reused for every tappable list row
  in the app (student list, subject list, class list, leave list, etc.)
-->
<script lang="ts">
  export let label: string;
  export let meta: string = '';
  export let onClick: () => void = () => {};
</script>

<button class="row" on:click={onClick} type="button">
  <span class="label">{label}</span>
  <span class="meta">{meta}</span>
  <svg
    class="arrow"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
</button>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 44px; /* design.md §9 — min tap target */
    background: #f4f3f3;
    border: none;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: background 200ms;
    text-align: left;
    font-family: 'Inter', sans-serif;
  }
  .row:hover,
  .row:active {
    background: #eaeaea;
  }
  .row:hover .arrow,
  .row:active .arrow {
    color: #374151;
    transform: translateX(2px);
  }
  .label {
    font-size: 14px;
    color: #191919;
    font-weight: 500;
  }
  .meta {
    font-size: 12px;
    color: rgba(25, 25, 25, 0.7);
    margin-left: 12px;
    margin-right: auto;
  }
  .arrow {
    color: #9ca3af;
    transition:
      transform 200ms,
      color 200ms;
    flex-shrink: 0;
  }
</style>