# design.md — Design System

> Direction locked from a reference (a "Boomerang" fintech landing page). That reference is a **web marketing page** with video hero + boomerang animation — this app is a **data-dense web utility app** used daily by admins/teachers/students. So we're porting the *design language* (palette, type pairing, restraint, motion rules, row-interaction pattern) — not the literal video-hero layout, which doesn't fit a role-based web app.

## 1. Design Direction
Same principle as the reference: **quiet, confident, monochrome-first UI with one accent used sparingly.** No purple, no gradients, no decorative cards, no busy dashboards. Every screen = clear hierarchy + generous whitespace + one primary action.

Feel: closer to a premium fintech app than a typical "school app." Attendance data should feel calm and trustworthy, not noisy with red/green everywhere.

## 2. Color Palette

| Role | Hex | Usage |
|---|---|---|
| Ink (primary text/chrome) | `#191919` | headlines, primary buttons, icons |
| Ink / 70% | `#191919B3` | body text |
| Ink / 50% | `#19191980` | micro-labels, muted meta |
| Ink / 40% | `#19191966` | disabled, index numbers |
| Background | `#FFFFFF` | pure white base |
| Surface Muted | `#F4F3F3` | row backgrounds, chips, secondary cards |
| Surface Muted Hover/Press | `#EAEAEA` | pressed state on rows |
| Border Hairline | `#E5E7EB` (gray-200) | dividers, card outlines |

### Status accents (only place color beyond ink is used)
| Status | Hex | Usage |
|---|---|---|
| Present | `#16A34A` | small dot/chip only, never full-bg blocks |
| Late | `#F59E0B` | small dot/chip only |
| Absent | `#DC2626` | small dot/chip only |

Rule: status color shows as a small dot + label, never as a full-width colored banner. Keeps the "calm monochrome" feel even on attendance-heavy screens.

## 3. Typography

Pair a **serif display face** (for big numbers / section headers — the "human, premium" touch) with **Inter** for all UI text (the "functional, dense" workhorse) — same split logic as the reference.

- **Display / serif:** a Georgia-style serif (e.g. `PT Serif` or system serif) — used ONLY for:
  - Dashboard hero numbers (e.g. attendance %)
  - Section headers on Home/Dashboard screens
  - NOT used for buttons, labels, table data, or forms
- **UI / sans:** Inter — weights 300/400/500/600, used for everything else: nav, lists, forms, buttons, table data.

### Scale
- Dashboard stat (serif): 40–48px / Regular
- Screen title (serif): 24px / Regular
- Section header (sans): 18px / SemiBold
- Body: 14px / Regular
- Micro-label: 11px / Medium / uppercase / `tracking-[0.15em]` / Ink-50%
- Caption/meta: 12px / Regular / Ink-70%

## 4. Spacing & Shape
- Base unit 4px (4/8/12/16/24/32).
- Screen horizontal padding: 20px.
- Card radius: 12px. Buttons: pill / fully-rounded (`rounded-full` style), matching the reference's black pill CTA.
- No shadows by default — use hairline borders (`#E5E7EB`) to separate surfaces, like the reference's border-based cards. Shadow only on floating elements (modals, FAB).

## 5. Components

**Primary Button** — black pill: `bg-[#191919] text-white`, rounded-full, `px-6 py-3`, press → `bg-[#191919]/90`. Used for: Book/Submit, Mark Attendance, Apply Leave.

**Secondary Button** — outline: `border border-[#191919]/20 text-[#191919]`, rounded-full, transparent bg.

**Micro-label** — uppercase, 11px, tracking-wide, Ink-50%. Use above section headers (e.g. "TODAY'S CLASSES", "ATTENDANCE SUMMARY") — directly from the reference's "WHAT DO WE DO?" pattern.

**Interactive Row** (list items — students, subjects, classes, leave requests):
- Default bg `#F4F3F3`, press/hover bg `#EAEAEA`, `transition-all 200ms`
- Layout: label left, meta/status center, chevron/arrow right
- Arrow icon (Lucide `ArrowRight` or `ChevronRight`) `text-gray-400` default → `text-gray-700` + slight `translateX` on press
- This is the direct port of the reference's "01 / Conversational →" row pattern, reused for every tappable list row in the app (student list, subject list, class list, leave list).

**Divider** — 1px hairline `#E5E7EB`, full width, between major sections (matches reference's hairline divider between the two panel rows).

**Status Chip** — small pill: dot (8px, status color) + label text, `bg-[#F4F3F3]`, `text-[#191919]/70`, `text-xs`. Used for Present/Absent/Late and leave status (Pending/Approved/Rejected).

## 6. Motion Rules (intentionally minimal — same restraint as reference)
Only these motions are allowed anywhere in the app:
1. Row press → bg shift + arrow nudge, 200ms (the core interaction pattern)
2. Button press → opacity/bg shift, 200ms
3. Screen transitions → native stack default (no custom animations)
4. Chart entrance → simple fade/scale-in on dashboard load only

No parallax, no looping background animation, no confetti/celebratory motion, no skeleton shimmer beyond a simple pulse. The reference's boomerang-video motion doesn't translate here — a utility app should feel instantly responsive, not cinematic.

## 7. Iconography
- Single icon set throughout — Lucide icons (via `lucide-react-native`), matching the reference's icon choice (`ArrowRight` used for row affordance).
- Keep icons functional and outline-style, 16–20px in lists, 24px in nav/tab bar.

## 8. Screen-Level Pattern (adapted from reference's hero + bottom panel idea)
Applied to Home/Dashboard screens for each role:
- **Top block:** greeting + big serif stat (e.g. "87%" attendance) — mirrors the reference's serif H1 treatment.
- **Below:** micro-label + 2-col summary (mirrors "WHAT DO WE DO?" row: label left, description/stat right).
- **Hairline divider.**
- **List of interactive rows** (today's classes / pending items / recent activity) — mirrors the reference's numbered feature rows exactly, just repurposed for real data.

## 9. Accessibility
- Contrast ratio ≥ 4.5:1 for all text against its background.
- Status never conveyed by color alone — always dot + text label.
- Minimum tap target 44x44px on all rows/buttons.

---
### Rationale note
The original reference is a single-page marketing site (video hero, no forms/tables/lists of real data). This app is the opposite: multi-screen, data-heavy, role-gated. What carried over: the **restrained monochrome palette + single accent discipline, serif/sans pairing, hairline-divider structure, uppercase micro-labels, and the row-hover interaction pattern.** What didn't: the video hero, boomerang canvas animation, and single-viewport layout — none of which fit a web attendance app.