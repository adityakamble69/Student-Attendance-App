<!-- routes/teacher/smart/[classId]/+page.svelte — Phase 5: Teacher Smart Attendance Control Station -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getClass, type ClassItem } from '$lib/services/classes';
  import {
    startQrSession,
    rotateQrSession,
    generateOtpSession,
    getActiveOtpSession,
    getClassAttendance,
    type QrSessionData,
    type OtpSessionData,
    type ClassAttendanceData,
  } from '$lib/services/attendance';
  import StatusChip from '$lib/components/StatusChip.svelte';

  const classId = Number($page.params.classId);

  type Tab = 'qr' | 'otp' | 'gps';
  let activeTab: Tab = 'qr';

  let classData: ClassItem | null = null;
  let attendanceData: ClassAttendanceData | null = null;

  let qrSession: QrSessionData | null = null;
  let otpSession: OtpSessionData | null = null;

  let qrCountdown = 15;
  let otpCountdown = 90;
  let qrInterval: any = null;
  let otpInterval: any = null;
  let livePollInterval: any = null;

  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      classData = await getClass(classId);
      await refreshLiveAttendance();

      // Poll attendance every 5 seconds while station is open
      livePollInterval = setInterval(refreshLiveAttendance, 5000);
    } catch (e: any) {
      error = 'Could not load class details.';
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    clearInterval(qrInterval);
    clearInterval(otpInterval);
    clearInterval(livePollInterval);
  });

  async function refreshLiveAttendance() {
    try {
      attendanceData = await getClassAttendance(classId);
    } catch (e) {}
  }

  // QR Code flow
  async function handleStartQr() {
    error = '';
    try {
      qrSession = await startQrSession(classId);
      qrCountdown = 15;

      clearInterval(qrInterval);
      qrInterval = setInterval(async () => {
        qrCountdown--;
        if (qrCountdown <= 0) {
          qrCountdown = 15;
          try {
            qrSession = await rotateQrSession(classId);
          } catch (e) {}
        }
      }, 1000);
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not start QR session.';
    }
  }

  // OTP flow
  async function handleStartOtp() {
    error = '';
    try {
      otpSession = await generateOtpSession(classId);
      otpCountdown = 90;

      clearInterval(otpInterval);
      otpInterval = setInterval(() => {
        otpCountdown--;
        if (otpCountdown <= 0) {
          clearInterval(otpInterval);
        }
      }, 1000);
    } catch (e: any) {
      error = e.response?.data?.error || 'Could not generate OTP.';
    }
  }
</script>

<div class="screen">
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/teacher')} type="button">
      ← Timetable
    </button>
    <button class="manual-link" on:click={() => goto(`/teacher/attendance/${classId}`)} type="button">
      Manual Attendance Screen →
    </button>
  </div>

  {#if loading}
    <p class="muted">Loading station…</p>
  {:else if error && !classData}
    <p class="error">{error}</p>
  {:else if classData}
    <div class="station-header">
      <div>
        <h1 class="screen-title">{classData.subject_name}</h1>
        <p class="screen-subtitle">
          {classData.day} • {classData.start_time.slice(0, 5)}–{classData.end_time.slice(0, 5)}
          {#if classData.room}• Room {classData.room}{/if}
          {#if classData.section}• Section {classData.section}{/if}
        </p>
      </div>
      <div class="live-counter">
        <span class="live-pulse"></span>
        <span class="live-txt">
          {attendanceData?.presentCount || 0}/{attendanceData?.totalStudents || 0} Present
        </span>
      </div>
    </div>

    <!-- Mode Selector -->
    <div class="mode-tabs">
      <button
        type="button"
        class="mode-tab {activeTab === 'qr' ? 'active' : ''}"
        on:click={() => (activeTab = 'qr')}
      >
        📱 Rotating QR Code
      </button>
      <button
        type="button"
        class="mode-tab {activeTab === 'otp' ? 'active' : ''}"
        on:click={() => (activeTab = 'otp')}
      >
        🔢 90s Countdown OTP
      </button>
      <button
        type="button"
        class="mode-tab {activeTab === 'gps' ? 'active' : ''}"
        on:click={() => (activeTab = 'gps')}
      >
        📍 Campus Geofence
      </button>
    </div>

    <!-- Tab 1: Rotating QR Station -->
    {#if activeTab === 'qr'}
      <div class="station-card">
        {#if !qrSession}
          <div class="start-box">
            <p class="box-desc">
              Generate a dynamic anti-proxy QR code that automatically rotates every 15 seconds.
            </p>
            <button class="primary-btn" type="button" on:click={handleStartQr}>
              Start QR Attendance Session
            </button>
          </div>
        {:else}
          <div class="active-qr-box">
            <div class="qr-code-placeholder">
              <div class="mock-qr">
                <div class="qr-corner top-left"></div>
                <div class="qr-corner top-right"></div>
                <div class="qr-corner bottom-left"></div>
                <div class="qr-center-text">SESSION ACTIVE</div>
              </div>
            </div>

            <div class="token-display">
              <span class="token-label">CURRENT SCAN TOKEN (ROTATES IN {qrCountdown}s)</span>
              <code class="token-code">{qrSession.token.slice(0, 16)}…{qrSession.token.slice(-8)}</code>
            </div>

            <div class="progress-bar">
              <div class="progress-fill" style="width: {(qrCountdown / 15) * 100}%;"></div>
            </div>

            <button class="secondary-btn" type="button" on:click={handleStartQr}>
              Restart / Force Rotate
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Tab 2: OTP Station -->
    {#if activeTab === 'otp'}
      <div class="station-card">
        {#if !otpSession || otpCountdown <= 0}
          <div class="start-box">
            <p class="box-desc">
              Generate a 6-digit numeric OTP code for students to enter in-app with a 90-second countdown.
            </p>
            <button class="primary-btn" type="button" on:click={handleStartOtp}>
              Generate 6-Digit OTP
            </button>
          </div>
        {:else}
          <div class="active-otp-box">
            <p class="otp-sub">READ OR DISPLAY THIS CODE TO YOUR CLASS</p>
            <div class="otp-large">{otpSession.code}</div>
            <div class="countdown-pill">
              ⏱ Expires in {otpCountdown} seconds
            </div>
            <button class="secondary-btn" type="button" on:click={handleStartOtp}>
              Regenerate Code
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Tab 3: GPS Geofence Station -->
    {#if activeTab === 'gps'}
      <div class="station-card">
        <div class="start-box">
          <div class="geo-icon">📍</div>
          <h3 class="geo-title">Campus Geofence Active (300m)</h3>
          <p class="box-desc">
            Students can verify their attendance by opening their student dashboard inside the classroom.
            The server strictly verifies coordinates using the Haversine formula against the campus boundary.
          </p>
        </div>
      </div>
    {/if}

    <div class="divider"></div>

    <!-- Live Present Students Feed -->
    <div class="live-feed">
      <p class="micro-label">LIVE VERIFIED STUDENTS ({attendanceData?.presentCount || 0})</p>
      {#if !attendanceData || attendanceData.students.filter((s) => s.status === 'Present').length === 0}
        <div class="empty-feed">
          <p>Waiting for students to verify attendance…</p>
        </div>
      {:else}
        <div class="feed-grid">
          {#each attendanceData.students.filter((s) => s.status === 'Present') as s}
            <div class="feed-card">
              <div class="feed-left">
                <span class="feed-name">{s.name}</span>
                <span class="feed-roll">{s.roll_no}</span>
              </div>
              <span class="feed-method">{s.method}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .screen {
    max-width: 680px;
    margin: 0 auto;
    padding: 32px 20px;
    font-family: 'Inter', sans-serif;
    color: #191919;
  }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .back-link,
  .manual-link {
    font-size: 13px;
    font-weight: 500;
    color: rgba(25, 25, 25, 0.7);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .back-link:hover,
  .manual-link:hover {
    color: #191919;
  }

  .station-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
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
  .live-counter {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #dcfce7;
    padding: 6px 14px;
    border-radius: 9999px;
  }
  .live-pulse {
    width: 8px;
    height: 8px;
    background: #16a34a;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.3); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }
  .live-txt {
    font-size: 12px;
    font-weight: 600;
    color: #166534;
  }

  .mode-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
  }
  .mode-tab {
    padding: 10px 8px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #f9f9f9;
    color: rgba(25, 25, 25, 0.7);
    cursor: pointer;
    transition: all 150ms;
    text-align: center;
  }
  .mode-tab:hover {
    background: #f4f3f3;
  }
  .mode-tab.active {
    background: #191919;
    color: #ffffff;
    border-color: #191919;
  }

  .station-card {
    background: #f4f3f3;
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
  }
  .start-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .box-desc {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.6);
    max-width: 400px;
    margin: 0;
    line-height: 1.5;
  }

  .primary-btn {
    padding: 12px 24px;
    background: #191919;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  .secondary-btn {
    padding: 8px 18px;
    background: #ffffff;
    color: #191919;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }

  .active-qr-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .qr-code-placeholder {
    width: 180px;
    height: 180px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .mock-qr {
    width: 140px;
    height: 140px;
    border: 2px dashed #191919;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .qr-corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border: 3px solid #191919;
  }
  .qr-corner.top-left { top: 6px; left: 6px; border-right: none; border-bottom: none; }
  .qr-corner.top-right { top: 6px; right: 6px; border-left: none; border-bottom: none; }
  .qr-corner.bottom-left { bottom: 6px; left: 6px; border-right: none; border-top: none; }
  .qr-center-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #16a34a;
  }

  .token-display {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .token-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: rgba(25, 25, 25, 0.5);
  }
  .token-code {
    font-size: 13px;
    background: #ffffff;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }

  .progress-bar {
    width: 220px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 9999px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #191919;
    transition: width 1s linear;
  }

  .active-otp-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .otp-sub {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: rgba(25, 25, 25, 0.5);
    margin: 0;
  }
  .otp-large {
    font-family: monospace;
    font-size: 56px;
    font-weight: 700;
    letter-spacing: 0.25em;
    color: #191919;
    background: #ffffff;
    padding: 12px 32px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
  }
  .countdown-pill {
    font-size: 12px;
    font-weight: 500;
    color: #d97706;
    background: #fef3c7;
    padding: 4px 12px;
    border-radius: 9999px;
  }

  .geo-icon {
    font-size: 32px;
  }
  .geo-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
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

  .empty-feed {
    text-align: center;
    padding: 24px;
    background: #f9f9f9;
    border-radius: 12px;
    font-size: 13px;
    color: rgba(25, 25, 25, 0.5);
  }
  .feed-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
  }
  .feed-card {
    background: #f4f3f3;
    padding: 10px 14px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .feed-left {
    display: flex;
    flex-direction: column;
  }
  .feed-name {
    font-size: 13px;
    font-weight: 600;
  }
  .feed-roll {
    font-size: 11px;
    color: rgba(25, 25, 25, 0.5);
  }
  .feed-method {
    font-size: 10px;
    font-weight: 600;
    background: #ffffff;
    padding: 2px 6px;
    border-radius: 4px;
    color: rgba(25, 25, 25, 0.7);
  }

  .muted {
    color: rgba(25, 25, 25, 0.5);
  }
  .error {
    color: #dc2626;
  }
</style>
