<!-- routes/student/scan/+page.svelte — Phase 5: Student Smart Attendance Hub (QR, OTP, GPS) -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getMyTimetable, type StudentTimetableSlot } from '$lib/services/student';
  import {
    scanQrAttendance,
    submitOtpAttendance,
    markGpsAttendance,
  } from '$lib/services/attendance';

  type Mode = 'qr' | 'otp' | 'gps';

  let mode: Mode = 'qr';
  let classes: StudentTimetableSlot[] = [];
  let selectedClassId: number | null = null;

  let qrTokenInput = '';
  let otpCodeInput = '';

  let loading = true;
  let submitting = false;
  let error = '';
  let successMsg = '';
  let geoStatus = '';
  let clientCoords: { lat: number; lng: number } | null = null;

  onMount(async () => {
    try {
      const res = await getMyTimetable();
      classes = res.timetable;
      if (classes.length > 0) {
        selectedClassId = classes[0].class_id;
      }
    } catch (e: any) {
      error = 'Could not load your classes for attendance.';
    } finally {
      loading = false;
    }

    // Attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clientCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          geoStatus = `GPS Ready: ±${Math.round(pos.coords.accuracy)}m accuracy`;
        },
        (err) => {
          geoStatus = 'GPS unavailable (permission denied or timeout)';
        }
      );
    }
  });

  async function handleQrSubmit() {
    if (!selectedClassId) {
      error = 'Please select a class.';
      return;
    }
    if (!qrTokenInput.trim()) {
      error = 'Please enter or scan the QR token.';
      return;
    }

    submitting = true;
    error = '';
    successMsg = '';

    try {
      const res = await scanQrAttendance({
        classId: selectedClassId,
        token: qrTokenInput.trim(),
        lat: clientCoords?.lat,
        lng: clientCoords?.lng,
      });
      successMsg = res.message || 'Attendance marked successfully via QR!';
      qrTokenInput = '';
    } catch (e: any) {
      error = e.response?.data?.error || 'Failed to verify QR code.';
    } finally {
      submitting = false;
    }
  }

  async function handleOtpSubmit() {
    if (!selectedClassId) {
      error = 'Please select a class.';
      return;
    }
    if (!otpCodeInput.trim() || otpCodeInput.trim().length < 4) {
      error = 'Please enter a valid 6-digit OTP.';
      return;
    }

    submitting = true;
    error = '';
    successMsg = '';

    try {
      const res = await submitOtpAttendance({
        classId: selectedClassId,
        code: otpCodeInput.trim(),
        lat: clientCoords?.lat,
        lng: clientCoords?.lng,
      });
      successMsg = res.message || 'Attendance marked successfully via OTP!';
      otpCodeInput = '';
    } catch (e: any) {
      error = e.response?.data?.error || 'Failed to verify OTP.';
    } finally {
      submitting = false;
    }
  }

  async function handleGpsSubmit() {
    if (!selectedClassId) {
      error = 'Please select a class.';
      return;
    }

    submitting = true;
    error = '';
    successMsg = '';

    if (!navigator.geolocation) {
      error = 'Geolocation is not supported by your browser.';
      submitting = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await markGpsAttendance({
            classId: Number(selectedClassId),
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          successMsg = res.message || `Location verified! Distance: ${res.distanceMeters}m`;
        } catch (e: any) {
          error = e.response?.data?.error || 'GPS attendance verification failed.';
        } finally {
          submitting = false;
        }
      },
      (err) => {
        error = `Location error: ${err.message}. Please allow location permission in your browser.`;
        submitting = false;
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }
</script>

<div class="screen">
  <div class="top-bar">
    <button class="back-link" on:click={() => goto('/student')} type="button">
      ← Dashboard
    </button>
  </div>

  <h1 class="screen-title">Mark Attendance</h1>
  <p class="screen-subtitle">Anti-proxy smart verification: QR Scan, 6-digit OTP, or GPS Geofence.</p>

  {#if loading}
    <p class="muted">Loading classes…</p>
  {:else if classes.length === 0}
    <div class="empty-state">
      <p class="empty-title">No active classes today</p>
      <p class="empty-desc">You do not have any scheduled classes available to mark right now.</p>
    </div>
  {:else}
    <!-- Class Selector -->
    <div class="class-select-card">
      <label for="class-drop" class="select-label">SELECT LECTURE / CLASS</label>
      <select id="class-drop" class="select-input" bind:value={selectedClassId}>
        {#each classes as c}
          <option value={c.class_id}>
            {c.subject_name} • {c.teacher_name} ({c.start_time.slice(0, 5)}–{c.end_time.slice(0, 5)})
          </option>
        {/each}
      </select>
    </div>

    <!-- Mode Switcher Tabs -->
    <div class="mode-tabs">
      <button
        type="button"
        class="mode-tab {mode === 'qr' ? 'active' : ''}"
        on:click={() => { mode = 'qr'; error = ''; successMsg = ''; }}
      >
        📱 QR Code
      </button>
      <button
        type="button"
        class="mode-tab {mode === 'otp' ? 'active' : ''}"
        on:click={() => { mode = 'otp'; error = ''; successMsg = ''; }}
      >
        🔢 Numeric OTP
      </button>
      <button
        type="button"
        class="mode-tab {mode === 'gps' ? 'active' : ''}"
        on:click={() => { mode = 'gps'; error = ''; successMsg = ''; }}
      >
        📍 Campus GPS
      </button>
    </div>

    <!-- Feedback Message Banners -->
    {#if successMsg}
      <div class="feedback-banner success">
        <span class="banner-icon">✓</span>
        <span>{successMsg}</span>
      </div>
    {/if}
    {#if error}
      <div class="feedback-banner error">
        <span class="banner-icon">✕</span>
        <span>{error}</span>
      </div>
    {/if}

    <!-- Mode 1: QR Code Mode -->
    {#if mode === 'qr'}
      <div class="mode-card">
        <div class="mode-icon-circle">📱</div>
        <h2 class="mode-heading">Scan Session QR Code</h2>
        <p class="mode-sub">
          Point your camera at the teacher's screen or enter the rotating session token below.
        </p>

        <div class="input-group">
          <input
            type="text"
            placeholder="Paste or enter QR session token…"
            bind:value={qrTokenInput}
            class="code-input"
          />
        </div>

        <button
          class="submit-btn"
          type="button"
          disabled={submitting || !qrTokenInput.trim()}
          on:click={handleQrSubmit}
        >
          {submitting ? 'Verifying Token…' : 'Submit QR Attendance'}
        </button>
      </div>
    {/if}

    <!-- Mode 2: OTP Code Mode -->
    {#if mode === 'otp'}
      <div class="mode-card">
        <div class="mode-icon-circle">🔢</div>
        <h2 class="mode-heading">Enter 6-Digit OTP</h2>
        <p class="mode-sub">
          Enter the code displayed by your instructor before the timer expires.
        </p>

        <div class="input-group">
          <input
            type="text"
            maxlength="6"
            placeholder="• • • • • •"
            bind:value={otpCodeInput}
            class="otp-input"
          />
        </div>

        <button
          class="submit-btn"
          type="button"
          disabled={submitting || otpCodeInput.trim().length < 4}
          on:click={handleOtpSubmit}
        >
          {submitting ? 'Verifying OTP…' : 'Submit OTP Attendance'}
        </button>
      </div>
    {/if}

    <!-- Mode 3: GPS Geofence Mode -->
    {#if mode === 'gps'}
      <div class="mode-card">
        <div class="mode-icon-circle">📍</div>
        <h2 class="mode-heading">Campus Geofence Verification</h2>
        <p class="mode-sub">
          One-tap location check confirms you are physically inside the campus radius (300m).
        </p>

        {#if geoStatus}
          <div class="geo-badge">{geoStatus}</div>
        {/if}

        <button
          class="submit-btn gps-btn"
          type="button"
          disabled={submitting}
          on:click={handleGpsSubmit}
        >
          {submitting ? 'Detecting Location & Verifying…' : '📍 Verify Location & Mark Present'}
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .screen {
    max-width: 600px;
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

  .class-select-card {
    background: #f4f3f3;
    padding: 14px 16px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 20px;
  }
  .select-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: rgba(25, 25, 25, 0.5);
  }
  .select-input {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    outline: none;
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

  .feedback-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 16px;
  }
  .feedback-banner.success {
    background: #dcfce7;
    color: #166534;
  }
  .feedback-banner.error {
    background: #fee2e2;
    color: #991b1b;
  }
  .banner-icon {
    font-weight: 700;
  }

  .mode-card {
    background: #f4f3f3;
    padding: 32px 24px;
    border-radius: 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .mode-icon-circle {
    width: 56px;
    height: 56px;
    background: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 14px;
  }
  .mode-heading {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 6px 0;
  }
  .mode-sub {
    font-size: 13px;
    color: rgba(25, 25, 25, 0.6);
    max-width: 360px;
    margin: 0 0 20px 0;
  }

  .input-group {
    width: 100%;
    max-width: 320px;
    margin-bottom: 20px;
  }
  .code-input {
    width: 100%;
    font-family: monospace;
    font-size: 13px;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    box-sizing: border-box;
    outline: none;
    text-align: center;
  }
  .otp-input {
    width: 100%;
    font-family: monospace;
    font-size: 24px;
    letter-spacing: 0.3em;
    font-weight: 700;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    box-sizing: border-box;
    outline: none;
    text-align: center;
  }

  .geo-badge {
    font-size: 11px;
    font-weight: 500;
    background: #ffffff;
    padding: 4px 12px;
    border-radius: 9999px;
    color: rgba(25, 25, 25, 0.7);
    margin-bottom: 20px;
  }

  .submit-btn {
    width: 100%;
    max-width: 320px;
    padding: 14px 20px;
    background: #191919;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 9999px;
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
</style>
