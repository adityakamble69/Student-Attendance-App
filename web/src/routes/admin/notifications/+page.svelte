<!-- routes/admin/notifications/+page.svelte — Phase 8: Admin Broadcast Notifications -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getMyNotifications, sendBroadcast, type NotificationItem } from '$lib/services/notification';

  let title = '';
  let message = '';
  let targetRole = 'all';
  let broadcasts: NotificationItem[] = [];

  let loading = true;
  let sending = false;
  let error = '';
  let successMsg = '';

  onMount(async () => {
    await loadBroadcasts();
  });

  async function loadBroadcasts() {
    loading = true;
    error = '';
    try {
      broadcasts = await getMyNotifications();
    } catch (e: any) {
      error = 'Could not load notifications.';
    } finally {
      loading = false;
    }
  }

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      error = 'Title and message are required.';
      return;
    }

    sending = true;
    error = '';
    successMsg = '';

    try {
      await sendBroadcast({
        title: title.trim(),
        message: message.trim(),
        targetRole,
      });
      successMsg = 'Broadcast notification sent successfully!';
      title = '';
      message = '';
      await loadBroadcasts();
    } catch (e: any) {
      error = e.response?.data?.error || 'Failed to send broadcast.';
    } finally {
      sending = false;
    }
  }

  function formatTime(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<div class="screen">
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/admin')} type="button">
      ← Dashboard
    </button>
  </div>

  <h1 class="screen-title">Broadcast Center</h1>
  <p class="screen-subtitle">Send official announcements and alerts to students and staff.</p>

  <!-- Composer Card -->
  <div class="composer-card">
    <h2 class="composer-title">Compose New Announcement</h2>

    {#if successMsg}
      <div class="banner success">{successMsg}</div>
    {/if}
    {#if error}
      <div class="banner error">{error}</div>
    {/if}

    <div class="field-group">
      <label for="notif-t" class="field-label">TITLE</label>
      <input
        id="notif-t"
        type="text"
        placeholder="E.g., Campus Holiday Notice / Smart Attendance Maintenance"
        class="input"
        bind:value={title}
      />
    </div>

    <div class="field-group">
      <label for="target-r" class="field-label">TARGET AUDIENCE</label>
      <select id="target-r" class="input" bind:value={targetRole}>
        <option value="all">Everyone (All Roles)</option>
        <option value="student">Students Only</option>
        <option value="teacher">Teachers Only</option>
        <option value="admin">Administrators Only</option>
      </select>
    </div>

    <div class="field-group">
      <label for="notif-m" class="field-label">MESSAGE</label>
      <textarea
        id="notif-m"
        class="textarea"
        rows="3"
        placeholder="Enter your announcement message here…"
        bind:value={message}
      ></textarea>
    </div>

    <button
      class="send-btn"
      type="button"
      disabled={sending || !title.trim() || !message.trim()}
      on:click={handleSend}
    >
      {sending ? 'Sending Broadcast…' : '📢 Send Broadcast Notification'}
    </button>
  </div>

  <div class="divider"></div>

  <!-- Broadcast History -->
  <p class="micro-label">RECENT ANNOUNCEMENTS ({broadcasts.length})</p>

  {#if loading}
    <p class="muted">Loading announcements…</p>
  {:else if broadcasts.length === 0}
    <div class="empty-state">
      <p class="empty-title">No broadcasts sent yet</p>
      <p class="empty-desc">Send your first announcement using the form above.</p>
    </div>
  {:else}
    <div class="broadcasts-list">
      {#each broadcasts as b}
        <div class="broadcast-card">
          <div class="broadcast-top">
            <span class="broadcast-title">{b.title}</span>
            <span class="target-tag">{b.target_role.toUpperCase()}</span>
          </div>
          <p class="broadcast-msg">{b.message}</p>
          <div class="broadcast-bottom">
            <span>By {b.sender_role} • {formatTime(b.created_at)}</span>
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

  .composer-card {
    background: #f4f3f3;
    padding: 20px 24px;
    border-radius: 16px;
    margin-bottom: 24px;
  }
  .composer-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
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

  .send-btn {
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
  .send-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  .send-btn:disabled {
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

  .broadcasts-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .broadcast-card {
    background: #f4f3f3;
    padding: 16px 18px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .broadcast-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .broadcast-title {
    font-size: 14px;
    font-weight: 600;
  }
  .target-tag {
    font-size: 10px;
    font-weight: 600;
    background: #ffffff;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    color: rgba(25, 25, 25, 0.7);
  }
  .broadcast-msg {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.8);
    margin: 0;
    line-height: 1.4;
  }
  .broadcast-bottom {
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
