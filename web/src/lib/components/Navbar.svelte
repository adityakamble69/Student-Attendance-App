<!-- lib/components/Navbar.svelte — Universal top navigation header for all roles -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authUser } from '$lib/stores/auth';
  import { getMyNotifications, markNotificationRead, type NotificationItem } from '$lib/services/notification';

  let notifications: NotificationItem[] = [];
  let showNotifications = false;
  let showMobileMenu = false;

  $: currentRole = $authUser?.role || '';
  $: unreadCount = notifications.filter((n) => !n.is_read).length;

  onMount(async () => {
    if ($authUser) {
      await loadNotifications();
    }
  });

  async function loadNotifications() {
    try {
      notifications = await getMyNotifications();
    } catch (e) {
      // quiet fail
    }
  }

  async function handleNotificationClick(n: NotificationItem) {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.notification_id);
        n.is_read = true;
        notifications = [...notifications];
      } catch (e) {}
    }
  }

  async function handleLogout() {
    await authUser.logout();
    goto('/login');
  }

  function isActive(path: string): boolean {
    return $page.url.pathname === path;
  }
</script>

{#if $authUser}
  <header class="navbar">
    <div class="nav-container">
      <!-- Left: Logo & Role Badge -->
      <div class="nav-left">
        <button class="logo-btn" on:click={() => goto(`/${currentRole}`)} type="button">
          <span class="logo-mark">SA</span>
          <span class="logo-text">Attendance</span>
        </button>
        <span class="role-badge {currentRole}">{currentRole}</span>
      </div>

      <!-- Center: Desktop Nav Links -->
      <nav class="nav-links">
        {#if currentRole === 'admin'}
          <button class="nav-link {isActive('/admin') ? 'active' : ''}" on:click={() => goto('/admin')} type="button">Dashboard</button>
          <button class="nav-link {isActive('/admin/teachers') ? 'active' : ''}" on:click={() => goto('/admin/teachers')} type="button">Teachers</button>
          <button class="nav-link {isActive('/admin/students') ? 'active' : ''}" on:click={() => goto('/admin/students')} type="button">Students</button>
          <button class="nav-link {isActive('/admin/classes') ? 'active' : ''}" on:click={() => goto('/admin/classes')} type="button">Classes</button>
          <button class="nav-link {isActive('/admin/reports') ? 'active' : ''}" on:click={() => goto('/admin/reports')} type="button">Reports</button>
          <button class="nav-link {isActive('/admin/leave') ? 'active' : ''}" on:click={() => goto('/admin/leave')} type="button">Leave</button>
          <button class="nav-link {isActive('/admin/notifications') ? 'active' : ''}" on:click={() => goto('/admin/notifications')} type="button">Broadcast</button>
        {:else if currentRole === 'teacher'}
          <button class="nav-link {isActive('/teacher') ? 'active' : ''}" on:click={() => goto('/teacher')} type="button">Timetable</button>
          <button class="nav-link {isActive('/teacher/classes') ? 'active' : ''}" on:click={() => goto('/teacher/classes')} type="button">My Classes</button>
          <button class="nav-link {isActive('/teacher/history') ? 'active' : ''}" on:click={() => goto('/teacher/history')} type="button">History</button>
          <button class="nav-link {isActive('/teacher/leave') ? 'active' : ''}" on:click={() => goto('/teacher/leave')} type="button">Leave</button>
          <button class="nav-link {isActive('/teacher/reports') ? 'active' : ''}" on:click={() => goto('/teacher/reports')} type="button">Reports</button>
        {:else if currentRole === 'student'}
          <button class="nav-link {isActive('/student') ? 'active' : ''}" on:click={() => goto('/student')} type="button">Overview</button>
          <button class="nav-link {isActive('/student/scan') ? 'active' : ''}" on:click={() => goto('/student/scan')} type="button">Mark Attendance</button>
          <button class="nav-link {isActive('/student/timetable') ? 'active' : ''}" on:click={() => goto('/student/timetable')} type="button">Timetable</button>
          <button class="nav-link {isActive('/student/history') ? 'active' : ''}" on:click={() => goto('/student/history')} type="button">History</button>
          <button class="nav-link {isActive('/student/leave') ? 'active' : ''}" on:click={() => goto('/student/leave')} type="button">Leave</button>
        {/if}
      </nav>

      <!-- Right: Notifications & Logout -->
      <div class="nav-right">
        <!-- Notification Button -->
        <div class="notif-wrapper">
          <button
            class="icon-btn"
            type="button"
            on:click={() => (showNotifications = !showNotifications)}
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {#if unreadCount > 0}
              <span class="badge-count">{unreadCount}</span>
            {/if}
          </button>

          {#if showNotifications}
            <div class="notif-dropdown">
              <div class="notif-header">
                <span class="notif-title">Notifications</span>
                <span class="notif-sub">{notifications.length} total</span>
              </div>
              <div class="notif-list">
                {#if notifications.length === 0}
                  <p class="notif-empty">No notifications yet.</p>
                {:else}
                  {#each notifications as n}
                    <button
                      class="notif-item {n.is_read ? 'read' : 'unread'}"
                      type="button"
                      on:click={() => handleNotificationClick(n)}
                    >
                      <div class="notif-top">
                        <span class="item-title">{n.title}</span>
                        {#if !n.is_read}
                          <span class="unread-dot"></span>
                        {/if}
                      </div>
                      <p class="item-msg">{n.message}</p>
                      <span class="item-time">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </button>
                  {/each}
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- User Name & Logout -->
        <span class="user-name">{$authUser?.name || 'User'}</span>
        <button class="logout-btn" on:click={handleLogout} type="button" title="Log out">
          Sign Out
        </button>
      </div>
    </div>
  </header>
{/if}

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #e5e7eb;
    font-family: 'Inter', sans-serif;
  }
  .nav-container {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 20px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .nav-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .logo-mark {
    background: #191919;
    color: #ffffff;
    font-weight: 700;
    font-size: 11px;
    padding: 3px 6px;
    border-radius: 6px;
    letter-spacing: 0.05em;
  }
  .logo-text {
    font-family: 'PT Serif', Georgia, serif;
    font-size: 16px;
    font-weight: 700;
    color: #191919;
  }
  .role-badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 9999px;
    background: #f4f3f3;
    color: rgba(25, 25, 25, 0.7);
  }
  .role-badge.admin {
    background: #e0e7ff;
    color: #3730a3;
  }
  .role-badge.teacher {
    background: #fef3c7;
    color: #92400e;
  }
  .role-badge.student {
    background: #dcfce7;
    color: #166534;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
  }
  .nav-link {
    font-size: 13px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.7);
    background: none;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 150ms;
    white-space: nowrap;
  }
  .nav-link:hover {
    color: #191919;
    background: #f4f3f3;
  }
  .nav-link.active {
    color: #191919;
    background: #f4f3f3;
    font-weight: 600;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .user-name {
    font-size: 13px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.8);
    display: none;
  }
  @media (min-width: 768px) {
    .user-name {
      display: inline-block;
    }
  }

  .notif-wrapper {
    position: relative;
  }
  .icon-btn {
    position: relative;
    background: #f4f3f3;
    border: none;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #191919;
    transition: background 150ms;
  }
  .icon-btn:hover {
    background: #eaeaea;
  }
  .badge-count {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #dc2626;
    color: #ffffff;
    font-size: 9px;
    font-weight: 700;
    min-width: 15px;
    height: 15px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notif-dropdown {
    position: absolute;
    top: 44px;
    right: 0;
    width: 300px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    z-index: 100;
  }
  .notif-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9f9f9;
  }
  .notif-title {
    font-size: 13px;
    font-weight: 600;
  }
  .notif-sub {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.5);
  }
  .notif-list {
    max-height: 280px;
    overflow-y: auto;
  }
  .notif-empty {
    padding: 24px 16px;
    text-align: center;
    font-size: 12px;
    color: rgba(25, 25, 25, 0.5);
    margin: 0;
  }
  .notif-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
    padding: 10px 14px;
    border: none;
    border-bottom: 1px solid #f4f3f3;
    background: #ffffff;
    cursor: pointer;
    transition: background 150ms;
  }
  .notif-item:hover {
    background: #f9f9f9;
  }
  .notif-item.unread {
    background: #fdfaf6;
  }
  .notif-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .item-title {
    font-size: 12px;
    font-weight: 600;
    color: #191919;
  }
  .unread-dot {
    width: 6px;
    height: 6px;
    background: #dc2626;
    border-radius: 50%;
  }
  .item-msg {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.7);
    margin: 2px 0 4px 0;
    line-height: 1.4;
  }
  .item-time {
    font-size: 10px;
    color: rgba(25, 25, 25, 0.4);
  }

  .logout-btn {
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    background: #f4f3f3;
    color: #191919;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 150ms;
    white-space: nowrap;
  }
  .logout-btn:hover {
    background: #191919;
    color: #ffffff;
    border-color: #191919;
  }
</style>
