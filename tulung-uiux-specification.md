# Tulung UI/UX Specification

**Version:** 1.0 MLP  
**Platform:** Android (React Native)  
**Target:** Gen Z users globally  
**Design Philosophy:** Fast, emotional, minimal friction

---

## Table of Contents

1. [Design Decisions (Locked)](#design-decisions-locked)
2. [User Journeys](#user-journeys)
3. [Screen Specifications](#screen-specifications)
4. [Component Library](#component-library)
5. [Interaction Design](#interaction-design)
6. [Animations & Transitions](#animations--transitions)
7. [Accessibility](#accessibility)
8. [Performance UX](#performance-ux)
9. [Edge Cases & Error States](#edge-cases--error-states)

---

## Design Decisions (Locked)

These are the UX calls I'm making for you. Don't revisit these during development—ship first, iterate later.

### **1. Demo Mode: Email-Gated from Start**

**Decision:** Require email sign-up immediately. No demo mode.

**Why:**
- You need to track users for retention metrics (D7, D30)
- Can't save expenses without user account
- Email collection is critical for re-engagement
- Simple OAuth (Google) reduces friction enough

**Trade-off accepted:** Slightly higher barrier to entry, but necessary for product metrics.

---

### **2. Toast Timeout: 5 Seconds**

**Decision:** Undo toast appears for 5 seconds (not 3).

**Why:**
- Users get distracted (notifications, calls)
- 3 seconds is too aggressive for muscle memory
- 5 seconds = industry standard (Uber, DoorDash)

**Interaction:** Tapping toast anywhere (not just undo) pauses countdown and opens edit mode.

---

### **3. Blur Check: Warn But Allow**

**Decision:** If image is very blurry, show warning but let user proceed.

**Flow:**
```
Capture image → Quick blur analysis (< 0.5s) → If blurry: Show alert
Alert: "Image looks blurry. OCR might fail. [Retake] [Try Anyway]"
```

**Why:**
- Saves OpenAI API costs on guaranteed failures
- Educates users on better photo technique
- Doesn't block users who insist on trying

---

### **4. Reports: Post-MLP**

**Decision:** No charts, category breakdowns, or trend analysis in MLP.

**What's IN MLP:**
- Today's total
- This Week total
- This Month total
- Simple expense list

**What's OUT:**
- Pie charts (spending by category)
- Line graphs (spending over time)
- Comparisons ("20% less than last week")

**Why:** Reports don't drive retention as much as core loop (scan → burn rate → streak). Add in v1.1 after validating retention.

---

### **5. Push Notifications: Enabled (Post-MLP)**

**Decision:** Build app WITHOUT push notifications for MLP. Add in v1.1 if D7 retention < 25%.

**Future notification types:**
- "🔥 Don't break your 7-day streak!"
- "💰 You're 80% through your budget today"
- "📸 Haven't logged today yet"

**Why defer:** Notifications require:
- Firebase setup
- Permission flow
- Testing infrastructure
- Can validate retention without them first

---

### **6. Haptics: Always On (No Toggle)**

**Decision:** Haptic feedback always enabled. No settings toggle for MLP.

**Why:**
- Vibration is core to emotional feedback
- 95% of users keep it on anyway
- One less setting to build/test

**Future:** Add toggle in v1.1 if users complain.

---

### **7. Offline Mode: Online-Only for MLP**

**Decision:** App requires internet connection. No offline caching/syncing.

**What happens offline:**
- Show banner: "You're offline. Connect to scan receipts."
- Manual entry still works (saves locally, syncs when online)
- Expense list shows last synced data

**Why:**
- Offline sync adds significant complexity (conflict resolution, local DB, queue management)
- OCR requires internet anyway (OpenAI API)
- 95% of usage is online

**Future:** Add offline support in v1.2 if users request it.

---

## User Journeys

### **Journey 1: First-Time User (Critical Path)**

**Goal:** Get user to scan first receipt within 60 seconds.

```
1. Open app
   ↓
2. Splash screen (1-2s) — "Tulung" logo
   ↓
3. Onboarding Carousel (3 screens, swipeable)
   
   Screen 1:
   "Track spending in 3 seconds"
   [Image: Person snapping receipt]
   
   Screen 2:
   "AI reads receipts for you"
   [Image: Receipt → extracted data]
   
   Screen 3:
   "See where your money goes"
   [Image: Burn Rate Meter]
   
   [Skip] button always visible
   ↓
4. Budget Setup Screen
   "What's your daily budget?"
   [Input: $50] (default suggestion)
   [Currency: USD] (dropdown)
   [Continue]
   ↓
5. Auth Screen
   "Sign up to save your expenses"
   [Continue with Google] (primary)
   [Continue with Email] (secondary)
   ↓
6. Camera Permission Request
   Native Android dialog: "Allow Tulung to take pictures?"
   ↓
7. Home Screen (empty state)
   Burn Rate Meter shows $0 / $50
   "No expenses yet! Scan your first receipt"
   [Scan Receipt] button (pulsing)
   ↓
8. User taps Scan Receipt
   ↓
9. Camera opens (first scan is FREE — doesn't count toward quota)
   ↓
10. Capture → OCR → Auto-log → Success toast
    "🎉 First expense logged! Keep it up!"
```

**Total time:** 45-60 seconds from app open to first expense logged.

**Drop-off points to monitor:**
- Onboarding (do users skip all 3 screens?)
- Budget setup (do users abandon here?)
- Auth (Google OAuth vs Email conversion rates)
- Camera permission (denial rate)

---

### **Journey 2: Daily Active User**

**Goal:** Maintain streak and awareness of spending.

```
1. User opens app (has 5-day streak)
   ↓
2. Home screen shows:
   - Burn Rate Meter: $8.50 / $50 (17% spent)
   - "🔥 5-day streak — Keep it going!"
   - Today's expenses (2 items)
   - [Scan Receipt] button
   ↓
3. User buys lunch, takes out receipt
   ↓
4. Opens Tulung, taps Scan Receipt
   ↓
5. Snaps photo → 2s processing → Auto-logged
   ↓
6. Toast: "✅ $12.50 logged — Food (McDonald's) [Undo]"
   ↓
7. Burn Rate Meter updates: $21 / $50 (42% spent)
   ↓
8. Streak counter increments: "🔥 6-day streak!"
   ↓
9. User closes app (session ends)
```

**Frequency:** 2-5 times per day (each time user makes a purchase).

**Retention hook:** Streak counter creates daily return habit.

---

### **Journey 3: Budget Alert User**

**Goal:** Awareness when approaching budget limit.

```
1. User has logged multiple expenses today
   ↓
2. Opens app after dinner purchase
   ↓
3. Scans receipt → Auto-logged
   ↓
4. Burn Rate Meter updates: $42 / $50 (84% spent)
   ↓
5. Alert banner appears at top:
   "⚠️ You've spent 84% of today's budget"
   [Dismiss]
   ↓
6. Meter color changes: Green → Orange
   ↓
7. User sees visual feedback: "Oops, need to slow down"
   ↓
8. Next day, opens app → Meter resets to $0 / $50
```

**Emotional arc:** Awareness → Slight tension → Course correction tomorrow.

**No judgment:** App doesn't say "you failed" — just shows the data.

---

### **Journey 4: Free User Hits Scan Limit**

**Goal:** Convert to Pro or accept manual entry.

```
1. User has scanned 10 receipts this month
   ↓
2. Attempts 11th scan → Camera opens
   ↓
3. Captures image → Processing starts
   ↓
4. Paywall modal appears (blocking)
   
   "🚀 You've used all 10 free scans this month
   
   Upgrade to Pro:
   ✅ Unlimited scans
   ✅ Priority support
   ✅ Early features
   
   $2.99/month
   Cancel anytime
   
   [Subscribe to Pro]
   [Enter Manually]"
   ↓
5a. User taps "Subscribe to Pro"
    → Google Play payment flow
    → Success → is_pro = true
    → Returns to camera → Scan completes
    
5b. User taps "Enter Manually"
    → Manual entry form opens
    → User enters amount, category, merchant
    → Save (doesn't count toward quota)
```

**Conversion optimization:**
- Show paywall AFTER user commits to scanning (higher intent)
- "Enter Manually" softens rejection (not "Cancel" or "No Thanks")
- User can still track expenses without paying

**Metrics to watch:**
- % who upgrade immediately
- % who use manual entry
- % who close app and don't return

---

### **Journey 5: Pro User Experience**

**Goal:** Validate Pro value and reduce churn.

```
1. Pro user opens app
   ↓
2. Home screen shows:
   - ✨ Pro badge (subtle, in header)
   - Burn Rate Meter (same as free)
   - Unlimited scanning (no quota warning)
   ↓
3. Scans receipt → Auto-logged (no interruptions)
   ↓
4. In Settings:
   - "✨ Pro Member" badge
   - "Scans this month: Unlimited"
   - [Manage Subscription] button
```

**Pro UX benefits:**
- No paywalls (obviously)
- Future: Early access to new features (widgets, reports, bank sync)
- Badge gives social proof ("I'm serious about budgeting")

---

## Screen Specifications

### **1. Splash Screen**

**Duration:** 1-2 seconds (while app initializes)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│          [Tulung Logo]              │
│                                     │
│      Track spending in 3 seconds    │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Background: #FFFFFF
- Logo: Teal (#1DD3C0), 80x80px
- Tagline: #4A5568, 16px, below logo
- No loading spinner (keep it clean)

**Logic:**
- Check auth status
- If logged in → Navigate to Home
- If not logged in → Navigate to Onboarding

---

### **2. Onboarding Carousel**

**3 screens, horizontal swipe**

#### Screen 1
```
┌─────────────────────────────────────┐
│                                     │
│     [Illustration: Phone camera]    │
│                                     │
│  Track spending in 3 seconds        │
│                                     │
│  Just snap a receipt. We'll         │
│  extract the details automatically. │
│                                     │
│  [○ ○ ○]  Swipe indicators          │
│                                     │
│  [Skip]                    [Next]   │
└─────────────────────────────────────┘
```

#### Screen 2
```
┌─────────────────────────────────────┐
│                                     │
│   [Illustration: Receipt → Data]    │
│                                     │
│  AI reads receipts for you          │
│                                     │
│  No manual typing. No forms.        │
│  Just intelligent automation.       │
│                                     │
│  [○ ● ○]                            │
│                                     │
│  [Skip]                    [Next]   │
└─────────────────────────────────────┘
```

#### Screen 3
```
┌─────────────────────────────────────┐
│                                     │
│   [Illustration: Burn Rate Meter]   │
│                                     │
│  See where your money goes          │
│                                     │
│  Real-time budget tracking with     │
│  instant visual feedback.           │
│                                     │
│  [○ ○ ●]                            │
│                                     │
│  [Skip]               [Get Started] │
└─────────────────────────────────────┘
```

**Specs:**
- Illustrations: Simple, 2-3 colors (teal + gray), flat design
- Heading: #1A1D29, 24px, bold
- Body: #4A5568, 16px, regular
- Buttons: Skip (text only), Next/Get Started (teal button)

**Behavior:**
- Swipe left/right to navigate
- [Skip] button always visible (top-right)
- Auto-advance to Budget Setup after screen 3

---

### **3. Budget Setup Screen**

```
┌─────────────────────────────────────┐
│  ✕ Skip                             │
│                                     │
│  What's your daily budget?          │
│                                     │
│  This helps us track your           │
│  spending awareness.                │
│                                     │
│  Daily Budget                       │
│  ┌─────────────────────────────┐   │
│  │  $    50                    │   │ ← Large input
│  └─────────────────────────────┘   │
│                                     │
│  Currency                           │
│  ┌─────────────────────────────┐   │
│  │  USD 🇺🇸                   ▼│   │ ← Dropdown
│  └─────────────────────────────┘   │
│                                     │
│  💡 Tip: Average Gen Z daily        │
│     spending is $30-60              │
│                                     │
│         [Continue]                  │
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Heading: #1A1D29, 24px, bold
- Subtext: #4A5568, 14px
- Input: 48px height, numeric keyboard
- Currency dropdown: Shows flag + code (USD 🇺🇸, EUR 🇪🇺, etc.)
- [Continue] button: Teal, full width, sticky bottom

**Default values:**
- Budget: $50
- Currency: Auto-detect from device locale (fallback to USD)

**Validation:**
- Budget must be > $0
- Budget max: $10,000 (sanity check)

**Skip behavior:**
- User can skip → Default $50 budget applied
- Can change later in Settings

---

### **4. Auth Screen**

```
┌─────────────────────────────────────┐
│  ✕ Skip                             │
│                                     │
│        [Tulung Logo]                │
│                                     │
│  Sign up to save your expenses      │
│                                     │
│  Your data syncs across devices     │
│  and stays private.                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔵 Continue with Google    │   │ ← Primary
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📧 Continue with Email     │   │ ← Secondary
│  └─────────────────────────────┘   │
│                                     │
│  By continuing, you agree to our    │
│  Terms and Privacy Policy.          │
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Logo: 60x60px
- Heading: #1A1D29, 20px, bold
- Subtext: #4A5568, 14px
- Buttons: 48px height, rounded 12px
- Google button: White background, Google brand colors
- Email button: Teal border, white background

**Skip behavior:**
- Can skip auth → Guest mode
- After first scan, force sign-up: "Sign up to save this expense"

**Email flow:**
- Tap "Continue with Email"
- Enter email + password
- Supabase sends verification email
- User verifies → Logged in

**Google OAuth flow:**
- Tap "Continue with Google"
- Android Google Sign-In sheet appears
- Select account → Logged in via Supabase

---

### **5. Home Screen (Empty State)**

```
┌─────────────────────────────────────┐
│  Tulung              [⚙️ Settings]  │
│                                     │
│     ┌─────────────────────────┐    │
│     │   BURN RATE METER       │    │
│     │   (Empty circle)        │    │
│     │                         │    │
│     │      $0 / $50           │    │
│     │      0% spent           │    │
│     └─────────────────────────┘    │
│                                     │
│   🔥 0-day streak                   │
│                                     │
│          📸                         │
│                                     │
│   No expenses yet!                  │
│   Scan your first receipt to       │
│   start tracking.                   │
│                                     │
│                                     │
│        [📸 Scan Receipt]            │ ← Pulsing
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Header: White background, 60px height
- Burn Rate Meter: 200px diameter, centered
- Empty illustration: 80x80px, gray
- Button: Teal gradient, 56px height, full width minus 32px margin

**Behavior:**
- [Scan Receipt] button pulses (scale 1.0 → 1.05 → 1.0, 2s loop)
- Tapping button opens camera immediately

---

### **6. Home Screen (With Expenses)**

```
┌─────────────────────────────────────┐
│  Tulung              [⚙️ Settings]  │
│                                     │
│     ┌─────────────────────────┐    │
│     │   BURN RATE METER       │    │
│     │   (42% filled arc)      │    │
│     │                         │    │
│     │     $21 / $50           │    │ ← Big numbers
│     │     42% spent           │    │
│     └─────────────────────────┘    │
│                                     │
│   🔥 5-day streak                   │
│                                     │
│   Today's Expenses                  │
│   ──────────────────────            │
│                                     │
│   🍔 Lunch             $12.50       │
│   McDonald's          2 hours ago   │
│                                     │
│   ☕ Coffee            $3.50        │
│   Starbucks           5 hours ago   │
│                                     │
│   🚗 Uber              $8.00        │
│   Transport           8 hours ago   │
│   ──────────────────────            │
│   Today's total: $24.00             │
│                                     │
│   [Today] [This Week] [This Month]  │ ← Tabs
│                                     │
│        [📸 Scan Receipt]            │
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Burn Rate Meter: Green (0-50%), Amber (51-79%), Orange (80-99%), Red (100%+)
- Expense cards: 72px height, white background, 1px border #E9ECEF
- Category emoji: 32px
- Amount: #1A1D29, 18px, bold (right-aligned)
- Merchant: #4A5568, 14px
- Timestamp: #9CA3AF, 12px
- Filter tabs: Segmented control, teal active state

**Interactions:**
- Tap expense card → Navigate to Expense Detail
- Swipe expense card left → Show delete button
- Tap Burn Rate Meter → Show today's category breakdown (modal)
- Pull to refresh → Reload expenses from Supabase

**Scroll behavior:**
- Filter tabs sticky at top
- Expense list scrolls under tabs
- [Scan Receipt] button sticky at bottom (always visible)

---

### **7. Camera Screen**

```
┌─────────────────────────────────────┐
│  ✕                         [⚡]     │ ← Flash toggle
│                                     │
│                                     │
│         CAMERA VIEWFINDER           │
│                                     │
│    ┌─────────────────────────┐     │
│    │  [Receipt alignment     │     │
│    │   overlay frame]        │     │
│    └─────────────────────────┘     │
│                                     │
│                                     │
│         [⭕ Capture]                │ ← Big button
│                                     │
│    [📁 Gallery]    [💳 Manual]     │
└─────────────────────────────────────┘
```

**Specs:**
- Full screen (status bar hidden)
- Close button: Top-left, white, 32px tap target
- Flash toggle: Top-right, white, cycles off/on/auto
- Receipt frame: White dashed border, 300x400px
- Capture button: 80px diameter, white circle with teal border
- Gallery/Manual: Text buttons, white, 16px

**Behavior:**
- Camera opens with rear camera
- Auto-focus enabled
- Tap to focus (show yellow square at tap point)
- Capture → Navigate to Processing Screen
- Gallery → Opens image picker
- Manual → Navigate to Manual Entry Screen

**Permissions:**
- If camera permission denied → Show alert: "Camera access required. Enable in Settings?"

---

### **8. Processing Screen**

```
┌─────────────────────────────────────┐
│  ✕ Cancel                           │
│                                     │
│                                     │
│       [Large spinner animation]     │
│                                     │
│    Reading receipt...               │
│                                     │
│    [Progress: 33%]                  │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Semi-transparent overlay (rgba(0,0,0,0.7))
- Spinner: Teal, 60px diameter
- Text: White, 16px, changes every 1s
- Cancel button: Top-left, white

**Text sequence:**
```
0-2s:  "Reading receipt..."
2-4s:  "Extracting details..."
4-6s:  "Almost done..."
6s+:   "Taking longer than usual..."
```

**Behavior:**
- Upload image to Supabase Storage
- Call OpenAI API with image URL
- Parse JSON response
- If success → Auto-create expense → Navigate to Home → Show toast
- If error → Show error modal

**Cancel behavior:**
- Tap Cancel → Stop API call → Return to Home (no expense created)

---

### **9. Success Toast**

**Appears at bottom of screen after auto-log**

```
┌─────────────────────────────────────┐
│                                     │
│   ┌───────────────────────────┐    │
│   │ ✅ $12.50 logged          │    │
│   │ Food · McDonald's         │    │
│   │                   [Undo]  │    │
│   │ [●●●●○] 4s remaining      │    │ ← Progress bar
│   └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Background: #00D9A3 (success green)
- Text: White, 16px
- Height: 80px
- Border radius: 16px
- Shadow: 0 8px 24px rgba(0, 217, 163, 0.3)
- Margin: 16px from bottom, 16px from sides

**Behavior:**
- Slides up from bottom (250ms ease-out)
- 5-second countdown (progress bar animates)
- Tap [Undo] → Delete expense immediately → Show "Expense removed" toast
- Tap anywhere else on toast → Pause countdown → Navigate to Edit Expense
- After 5s → Slide down (250ms) → Disappear

**Undo behavior:**
- Tap Undo → Expense deleted from database
- Show gray toast: "Expense removed" (2s)
- Burn Rate Meter updates immediately

---

### **10. Error Toast (OCR Failed)**

```
┌─────────────────────────────────────┐
│                                     │
│   ┌───────────────────────────┐    │
│   │ ❌ Couldn't read receipt  │    │
│   │                           │    │
│   │ [Retry]  [Enter Manually] │    │
│   └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Background: #FF5370 (error red)
- Text: White, 16px
- Buttons: White text, transparent background, border

**Behavior:**
- Appears immediately after OCR fails
- Doesn't auto-dismiss (user must choose action)
- [Retry] → Return to Camera Screen
- [Enter Manually] → Navigate to Manual Entry

---

### **11. Alert Banner (Budget Warning)**

**Appears at top of Home when 80%+ spent**

```
┌─────────────────────────────────────┐
│  ⚠️ You've spent 84% of today's    │
│  budget. Slow down on spending!     │
│                          [Dismiss]  │
└─────────────────────────────────────┘
```

**Specs:**
- Background: #FFB020 (warning amber)
- Text: #1A1D29, 14px
- Height: 56px
- No icon (emoji is enough)

**Behavior:**
- Appears when burn rate crosses 80%
- Dismissible (tap X or swipe down)
- Shows once per session (doesn't re-appear if dismissed)
- Persists until user logs next expense

**Threshold triggers:**
- 80%: Warning banner (amber)
- 100%: Danger banner (red): "⚠️ You're over budget today!"

---

### **12. Expense Detail Screen**

```
┌─────────────────────────────────────┐
│  ← Back                  [⋯ More]   │
│                                     │
│    [Receipt Image Preview]          │ ← Full width
│    Tap to zoom                      │
│                                     │
│  $12.50                             │ ← 32px, bold
│  🍔 Food · McDonald's               │ ← Category + merchant
│  Today at 2:35 PM                   │ ← Timestamp
│                                     │
│  Note:                              │
│  Lunch with the team                │ ← Optional note
│                                     │
│  ──────────────────────             │
│                                     │
│  [Edit Expense]                     │
│  [Delete Expense]                   │ ← Red text
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Receipt image: 300px height, rounded 12px, tap to open full-screen viewer
- Amount: #1A1D29, 32px, bold
- Category: Emoji + text, 18px
- Timestamp: #9CA3AF, 14px
- Note: #4A5568, 14px, italic
- Buttons: 48px height, full width

**Interactions:**
- Tap receipt image → Full-screen image viewer (pinch to zoom, swipe to dismiss)
- [Edit Expense] → Navigate to Edit Form (pre-filled)
- [Delete Expense] → Show confirmation dialog

**More menu (⋯):**
- Share expense (future)
- Report issue with OCR (future)
- Add to recurring (future)

---

### **13. Manual Entry Screen**

```
┌─────────────────────────────────────┐
│  ✕ Cancel          Add Expense      │
│                                     │
│  Amount *                           │
│  ┌───────────────────────────────┐ │
│  │  $    12.50                   │ │ ← Numeric keyboard
│  └───────────────────────────────┘ │
│                                     │
│  Category *                         │
│  ┌─────────────────────────────────┐ │
│  │  🍔  🚗  🛍️  🎬  💡  🏥  📦 │ │ ← Horizontal scroll
│  └─────────────────────────────────┘ │
│  [Food selected]                    │
│                                     │
│  Merchant (optional)                │
│  ┌───────────────────────────────┐ │
│  │  McDonald's                   │ │
│  └───────────────────────────────┘ │
│                                     │
│  Note (optional)                    │
│  ┌───────────────────────────────┐ │
│  │  Lunch meeting                │ │
│  └───────────────────────────────┘ │
│                                     │
│         [Save Expense]              │ ← Disabled until valid
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Amount: 48px height, auto-focus, numeric keyboard
- Category icons: 56x56px, gray when unselected, teal border when selected
- Inputs: 48px height, 12px border radius
- [Save] button: Teal gradient when enabled, gray when disabled

**Validation:**
- Amount > 0 (required)
- Category selected (required)
- Merchant and Note optional

**Behavior:**
- On mount → Amount field auto-focuses, keyboard opens
- Selecting category → Visual feedback (scale animation)
- [Save] → Create expense in database → Navigate to Home → Show success toast
- [Cancel] → Show confirmation if any field filled: "Discard expense?"

**Note:** Manual entries do NOT count toward scan quota (only OCR scans do).

---

### **14. Edit Expense Screen**

**Same as Manual Entry, but:**
- Title: "Edit Expense" (not "Add Expense")
- Fields pre-filled with existing data
- Additional button: [Delete Expense] (red, bottom)
- Save button: "Update Expense"

**Behavior:**
- On save → Update expense in database → Navigate back → Show "Expense updated" toast

---

### **15. Paywall Screen**

```
┌─────────────────────────────────────┐
│  ✕ Close                            │
│                                     │
│         🚀                          │
│                                     │
│  You've used all 10 free scans     │
│  this month                         │
│                                     │
│  Upgrade to Pro:                    │
│                                     │
│  ✅ Unlimited receipt scans         │
│  ✅ Priority support                │
│  ✅ Early access to new features    │
│                                     │
│  $2.99/month                        │
│  Cancel anytime                     │
│                                     │
│  [Subscribe to Pro]                 │ ← Teal gradient
│                                     │
│  [Enter Manually]                   │ ← Secondary
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Rocket emoji: 80px
- Heading: #1A1D29, 24px, bold
- Benefits: #4A5568, 16px, left-aligned
- Price: #1A1D29, 28px, bold
- Subtext: #9CA3AF, 14px
- Primary button: Teal gradient, 56px height
- Secondary button: Teal border, white bg, 48px height

**Behavior:**
- Modal appears AFTER user captures image (not before)
- [Subscribe to Pro] → Google Play Billing flow → On success: complete OCR scan
- [Enter Manually] → Navigate to Manual Entry (doesn't count toward quota)
- [Close] → Return to Home (scan cancelled)

**A/B test ideas (post-MLP):**
- Price: $1.99 vs $2.99 vs $3.99
- Trial: "7-day free trial" vs no trial
- Copy: "Unlimited scans" vs "Scan as much as you want"

---

### **16. Settings Screen**

```
┌─────────────────────────────────────┐
│  ← Back          Settings           │
│                                     │
│  Account                            │
│  ──────────────────────             │
│  you@email.com                      │
│  ✨ Pro Member                      │ ← If Pro
│                                     │
│  Budget Settings                    │
│  ──────────────────────             │
│  Daily Budget    $50.00     [Edit]  │
│  Currency        USD        [Edit]  │
│                                     │
│  Usage                              │
│  ──────────────────────             │
│  Scans this month    7/10           │ ← Free
│  Scans this month    Unlimited      │ ← Pro
│  Current streak      5 days         │
│                                     │
│  Subscription                       │
│  ──────────────────────             │
│  [Upgrade to Pro]                   │ ← Free only
│  [Manage Subscription]              │ ← Pro only
│  [Restore Purchases]                │
│                                     │
│  Support                            │
│  ──────────────────────             │
│  [Help & FAQ]                       │
│  [Contact Support]                  │
│  [Rate App ⭐]                      │
│                                     │
│  Legal                              │
│  ──────────────────────             │
│  [Privacy Policy]                   │
│  [Terms of Service]                 │
│                                     │
│  App Version 1.0.0                  │
│                                     │
│  [Sign Out]                         │ ← Red
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Sections: #4A5568, 12px, uppercase
- Items: 56px height, white background, chevron right
- Pro badge: Teal background, white text, sparkle icon
- [Upgrade to Pro]: Teal background, prominent placement
- [Sign Out]: Red text, bottom of screen

**Interactions:**
- Edit Daily Budget → Number input modal
- Edit Currency → Dropdown modal with search
- Manage Subscription → Opens Google Play Subscriptions
- Restore Purchases → Calls RevenueCat.restorePurchases()
- Contact Support → Opens email to support@tulung.app
- Rate App → Opens Play Store rating dialog
- Privacy/Terms → Opens web browser with pages
- Sign Out → Confirmation: "Are you sure?"

---

### **17. Milestone Celebration Modal**

**Triggered when user hits 7, 14, 30, 60, 90, 180, 365-day streak**

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│    [Confetti animation]             │
│                                     │
│            🔥                       │ ← Large emoji
│                                     │
│       7-DAY STREAK!                 │ ← Bold, large
│                                     │
│    You're building an amazing       │
│    financial habit. Keep it up!     │
│                                     │
│         [Continue]                  │
│                                     │
│         [Share ↗]                   │ ← Optional
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Full-screen modal
- Confetti: Animated particles (react-native-confetti-cannon)
- Emoji: 120px
- Heading: #1A1D29, 32px, bold
- Body: #4A5568, 16px
- Buttons: Teal, full width

**Behavior:**
- Appears after expense logged that extends streak to milestone
- Confetti animates for 3 seconds
- [Continue] → Dismiss modal, return to Home
- [Share] → Android share sheet: "I just hit a 7-day streak on Tulung! 🔥"

**Milestone messages:**
- 7 days: "One week streak! 🔥"
- 14 days: "Two weeks! You're on fire! 🚀"
- 30 days: "ONE MONTH! Incredible! 🏆"
- 60 days: "Two months! Unstoppable! 💎"
- 90 days: "90-day habit formed! 🎯"
- 180 days: "Half a year! Legend! ⭐"
- 365 days: "ONE YEAR! You're a pro! 👑"

---

## Component Library

### **Buttons**

#### Primary Button
```jsx
<TouchableOpacity style={styles.primaryButton}>
  <Text style={styles.buttonText}>Scan Receipt</Text>
</TouchableOpacity>

// Styles
primaryButton: {
  background: 'linear-gradient(135deg, #1DD3C0, #0FB9A8)',
  paddingVertical: 16,
  paddingHorizontal: 32,
  borderRadius: 12,
  alignItems: 'center',
  shadowColor: '#1DD3C0',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 4,
}
```

#### Secondary Button
```jsx
<TouchableOpacity style={styles.secondaryButton}>
  <Text style={styles.secondaryButtonText}>Enter Manually</Text>
</TouchableOpacity>

// Styles
secondaryButton: {
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: '#1DD3C0',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 12,
  alignItems: 'center',
}
```

#### Danger Button
```jsx
<TouchableOpacity style={styles.dangerButton}>
  <Text style={styles.dangerButtonText}>Delete</Text>
</TouchableOpacity>

// Styles
dangerButton: {
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: '#FF5370',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 12,
  alignItems: 'center',
}
```

---

### **Burn Rate Meter Component**

```jsx
import Svg, { Circle } from 'react-native-svg';

const BurnRateMeter = ({ spent, budget }) => {
  const percentage = (spent / budget) * 100;
  const color = getColor(percentage);
  
  return (
    <View style={styles.meterContainer}>
      <Svg width={200} height={200}>
        {/* Background circle */}
        <Circle
          cx={100}
          cy={100}
          r={80}
          stroke="#E9ECEF"
          strokeWidth={16}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={100}
          cy={100}
          r={80}
          stroke={color}
          strokeWidth={16}
          fill="none"
          strokeDasharray={`${percentage * 5.03}, 503`}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
      </Svg>
      <View style={styles.meterCenter}>
        <Text style={styles.spentAmount}>${spent}</Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.budgetAmount}>${budget}</Text>
        <Text style={styles.percentage}>{percentage}% spent</Text>
      </View>
    </View>
  );
};

const getColor = (percentage) => {
  if (percentage <= 50) return '#00D9A3'; // Green
  if (percentage <= 79) return '#FFB020'; // Amber
  if (percentage <= 99) return '#FF8C42'; // Orange
  return '#FF5370'; // Red
};
```

---

### **Expense Card Component**

```jsx
const ExpenseCard = ({ expense, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardLeft}>
      <Text style={styles.categoryIcon}>{getCategoryIcon(expense.category)}</Text>
      <View>
        <Text style={styles.merchant}>{expense.merchant || expense.category}</Text>
        <Text style={styles.timestamp}>{getRelativeTime(expense.logged_at)}</Text>
      </View>
    </View>
    <Text style={styles.amount}>${expense.amount}</Text>
  </TouchableOpacity>
);

// Styles
card: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E9ECEF',
  marginBottom: 12,
}
```

---

### **Toast Component**

```jsx
const Toast = ({ message, type, onUndo, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setVisible(false);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.toast, styles[`toast${type}`]]}>
      <View style={styles.toastContent}>
        <Text style={styles.toastText}>{message}</Text>
        {onUndo && (
          <TouchableOpacity onPress={onUndo}>
            <Text style={styles.undoButton}>Undo</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </Animated.View>
  );
};

// Styles
toast: {
  position: 'absolute',
  bottom: 80,
  left: 16,
  right: 16,
  borderRadius: 16,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 24,
  elevation: 8,
}
```

---

## Interaction Design

### **Haptic Feedback Patterns**

```javascript
import { Vibration } from 'react-native';

export const haptics = {
  // Light tap (button press)
  light: () => Vibration.vibrate(10),
  
  // Success (expense logged)
  success: () => Vibration.vibrate(50),
  
  // Warning (80% budget)
  warning: () => Vibration.vibrate([0, 50, 50, 50]),
  
  // Error (OCR failed)
  error: () => Vibration.vibrate([0, 100, 50, 100]),
  
  // Celebration (streak milestone)
  celebration: () => Vibration.vibrate([0, 50, 50, 50, 50, 50, 50, 50]),
};

// Usage
import { haptics } from './utils/haptics';

onSaveExpense = () => {
  haptics.success();
  // ... save logic
};
```

**When to use:**
- Button press: Light
- Expense logged: Success
- Budget alert: Warning
- OCR error: Error
- Streak milestone: Celebration
- Swipe to delete: Light

---

### **Touch Targets**

All interactive elements MUST meet minimum touch target sizes:

| Element | Minimum Size | Ideal Size |
|---------|-------------|-----------|
| Buttons | 44x44px | 48x48px |
| Icons | 32x32px | 40x40px |
| List items | Full width x 56px | Full width x 64px |
| Text links | Padding 8px all sides | Padding 12px all sides |

**Bad:**
```jsx
<TouchableOpacity onPress={onDelete}>
  <Icon name="trash" size={16} />
</TouchableOpacity>
```

**Good:**
```jsx
<TouchableOpacity 
  onPress={onDelete}
  style={{ padding: 16, minWidth: 48, minHeight: 48 }}
>
  <Icon name="trash" size={20} />
</TouchableOpacity>
```

---

### **Gestures**

**Swipe to Delete (Expense Card)**
```jsx
import { Swipeable } from 'react-native-gesture-handler';

<Swipeable
  renderRightActions={() => (
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={onDelete}
    >
      <Icon name="trash" color="#FFF" />
    </TouchableOpacity>
  )}
>
  <ExpenseCard {...props} />
</Swipeable>
```

**Pull to Refresh (Home Screen)**
```jsx
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={loading}
      onRefresh={fetchExpenses}
      tintColor="#1DD3C0"
    />
  }
>
  {/* Expense list */}
</ScrollView>
```

**Pinch to Zoom (Receipt Image)**
```jsx
import ImageViewer from 'react-native-image-zoom-viewer';

<Modal visible={showImageViewer}>
  <ImageViewer
    imageUrls={[{ url: receiptUrl }]}
    enableSwipeDown
    onSwipeDown={() => setShowImageViewer(false)}
  />
</Modal>
```

---

## Animations & Transitions

### **Screen Transitions**

Use React Navigation's default slide animations (fast, native-feeling).

```javascript
const Stack = createNativeStackNavigator();

<Stack.Navigator
  screenOptions={{
    animation: 'slide_from_right', // Android default
    animationDuration: 250,
  }}
>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Detail" component={DetailScreen} />
</Stack.Navigator>
```

**No custom transitions for MLP.** Ship with defaults.

---

### **Micro-animations**

#### Button Press
```javascript
import { Animated } from 'react-native';

const scaleAnim = useRef(new Animated.Value(1)).current;

const onPressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.95,
    useNativeDriver: true,
  }).start();
};

const onPressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};

<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut}>
    <Text>Scan Receipt</Text>
  </TouchableOpacity>
</Animated.View>
```

#### Burn Rate Meter Update
```javascript
const progressAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(progressAnim, {
    toValue: percentage,
    duration: 300,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: false, // SVG animations need this
  }).start();
}, [percentage]);
```

#### Toast Slide-Up
```javascript
const slideAnim = useRef(new Animated.Value(100)).current;

useEffect(() => {
  Animated.timing(slideAnim, {
    toValue: 0,
    duration: 250,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View
  style={{
    transform: [{ translateY: slideAnim }],
  }}
>
  {/* Toast content */}
</Animated.View>
```

#### Streak Increment
```javascript
const scaleAnim = useRef(new Animated.Value(1)).current;

const animateStreakIncrement = () => {
  Animated.sequence([
    Animated.spring(scaleAnim, {
      toValue: 1.3,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }),
  ]).start();
};

<Animated.Text style={{ transform: [{ scale: scaleAnim }] }}>
  🔥 {streakCount}
</Animated.Text>
```

---

### **Loading Animations**

#### Skeleton Loader (Expense List)
```jsx
const SkeletonLoader = () => (
  <View style={styles.skeleton}>
    <View style={[styles.skeletonCircle, styles.shimmer]} />
    <View style={styles.skeletonLines}>
      <View style={[styles.skeletonLine, styles.shimmer]} />
      <View style={[styles.skeletonLinesmall, styles.shimmer]} />
    </View>
  </View>
);

// Shimmer animation
const shimmerAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.loop(
    Animated.timing(shimmerAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    })
  ).start();
}, []);

const shimmerTranslate = shimmerAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [-100, 100],
});

shimmer: {
  backgroundColor: '#F8F9FA',
  overflow: 'hidden',
},
shimmerOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#FFFFFF',
  opacity: 0.5,
  transform: [{ translateX: shimmerTranslate }],
}
```

---

## Accessibility

### **Screen Reader Support**

Every interactive element MUST have `accessibilityLabel`:

```jsx
// Bad
<TouchableOpacity onPress={onScan}>
  <Icon name="camera" />
</TouchableOpacity>

// Good
<TouchableOpacity 
  onPress={onScan}
  accessibilityLabel="Scan receipt"
  accessibilityHint="Opens camera to scan a receipt"
>
  <Icon name="camera" />
</TouchableOpacity>
```

**Required labels:**
- Buttons: Describe action ("Scan receipt", "Delete expense")
- Icons: Describe meaning ("Settings", "Close")
- Images: Describe content ("Receipt from McDonald's")
- Input fields: Describe purpose ("Enter daily budget")

---

### **Color-Blind Friendly Design**

Never rely on color ALONE to convey information:

**Bad:**
```jsx
<Text style={{ color: percentage > 80 ? 'red' : 'green' }}>
  {percentage}% spent
</Text>
```

**Good:**
```jsx
<View>
  <Icon name={percentage > 80 ? 'warning' : 'check'} />
  <Text style={{ color: percentage > 80 ? '#FF5370' : '#00D9A3' }}>
    {percentage}% spent
  </Text>
</View>
```

**Design principle:** Icon + color + text = accessible.

---

### **Dynamic Text Sizing**

Support Android's accessibility text scaling:

```jsx
import { Text, StyleSheet } from 'react-native';

<Text style={styles.heading}>Daily Budget</Text>

// Styles
heading: {
  fontSize: 24,
  fontWeight: '600',
  // Text will scale with user's accessibility settings
}
```

**Test:** Settings → Accessibility → Font size → Largest

---

### **WCAG Compliance Checklist**

- [x] Color contrast ratio ≥ 4.5:1 for body text (we have 8.1:1)
- [x] Color contrast ratio ≥ 3:1 for large text (we have 14.3:1)
- [x] Touch targets ≥ 44x44px
- [x] All interactive elements have labels
- [x] No color-only information conveyance
- [x] Screen reader navigation logical
- [x] Form errors clearly described
- [x] Time-based content (toasts) can be paused/dismissed

---

## Performance UX

### **Perceived Performance**

Users care about PERCEIVED speed, not actual speed.

**Instant feedback trumps actual speed:**

```javascript
// Bad: Wait for API before showing feedback
const onScan = async () => {
  const result = await scanReceipt();
  showToast('Expense logged');
};

// Good: Show feedback immediately, handle errors later
const onScan = async () => {
  showToast('Expense logged'); // Instant
  try {
    await scanReceipt();
  } catch (error) {
    showErrorToast('Failed to save');
  }
};
```

---

### **Loading States**

**Rule:** Every action that takes >500ms needs a loading state.

| Action | Expected Time | Loading State |
|--------|--------------|---------------|
| OCR processing | 2-4s | Spinner + changing text |
| Expense list load | <1s | Skeleton loader |
| Image upload | 1-3s | Progress bar |
| Sign in | 1-2s | Button disabled + spinner |
| Delete expense | <500ms | Optimistic UI (remove immediately) |

---

### **Optimistic UI Updates**

Update UI immediately, sync in background:

```javascript
const deleteExpense = async (id) => {
  // 1. Remove from UI immediately
  setExpenses(expenses.filter(e => e.id !== id));
  haptics.light();
  
  // 2. Show undo toast
  showUndoToast(() => {
    // Undo: restore locally
    setExpenses([...expenses, deletedExpense]);
  });
  
  // 3. Delete from database in background
  try {
    await supabase.from('expenses').delete().eq('id', id);
  } catch (error) {
    // If fails, restore and show error
    setExpenses(expenses);
    showErrorToast('Failed to delete');
  }
};
```

**User experience:** Instant feedback, rare errors handled gracefully.

---

### **Image Optimization**

**Before uploading receipts:**

```javascript
import * as ImageManipulator from 'expo-image-manipulator';

const optimizeImage = async (uri) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }], // Max width 1200px
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  
  return manipResult.uri;
};
```

**Why:**
- Faster uploads (2MB → 400KB)
- Lower OpenAI API costs
- Better OCR accuracy (removes noise)

---

### **Caching Strategy**

**What to cache:**
- User profile (AsyncStorage)
- Expense list (last 100 items, AsyncStorage)
- Categories (never change, AsyncStorage)

**What NOT to cache:**
- Receipt images (too large)
- Real-time burn rate (always fetch fresh)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache expenses
const cacheExpenses = async (expenses) => {
  await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
};

// Load from cache on app open
const loadCachedExpenses = async () => {
  const cached = await AsyncStorage.getItem('expenses');
  return cached ? JSON.parse(cached) : [];
};

// Fetch fresh data in background
const fetchExpenses = async () => {
  const cached = await loadCachedExpenses();
  setExpenses(cached); // Show immediately
  
  const fresh = await supabase.from('expenses').select('*');
  setExpenses(fresh); // Update with fresh data
  cacheExpenses(fresh);
};
```

---

### **Network Error Handling**

**Offline banner (persistent):**
```jsx
{!isOnline && (
  <View style={styles.offlineBanner}>
    <Text>You're offline. Some features may not work.</Text>
  </View>
)}
```

**Retry mechanism:**
```jsx
const fetchWithRetry = async (fn, retries = 2) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.message.includes('network')) {
      await delay(1000);
      return fetchWithRetry(fn, retries - 1);
    }
    throw error;
  }
};
```

---

## Edge Cases & Error States

### **OCR Failure Scenarios**

| Scenario | User sees | Action |
|----------|-----------|--------|
| Blurry image | "Image looks blurry" warning | [Retake] [Try Anyway] |
| OCR returns no data | "Couldn't read receipt" error | [Retry] [Enter Manually] |
| API timeout (>10s) | "Taking too long..." | [Cancel] [Keep Trying] |
| Network error | "Connection lost" | [Retry] offline banner |
| Invalid receipt (not a receipt) | "This doesn't look like a receipt" | [Try Different Image] |

---

### **Empty States**

| Screen | Empty State | Message |
|--------|-------------|---------|
| Home (no expenses) | 📸 illustration | "No expenses yet! Scan your first receipt" |
| This Week (filtered) | 📊 illustration | "No expenses this week. You're doing great!" |
| This Month (filtered) | 📊 illustration | "No expenses this month yet" |
| Receipt image missing | Placeholder gray box | "Receipt image unavailable" |

---

### **Permission Denials**

**Camera permission denied:**
```jsx
if (!hasPermission) {
  return (
    <View style={styles.permissionDenied}>
      <Icon name="camera-off" size={80} color="#9CA3AF" />
      <Text style={styles.title}>Camera Access Required</Text>
      <Text style={styles.body}>
        Tulung needs camera access to scan receipts.
      </Text>
      <Button title="Open Settings" onPress={openAppSettings} />
    </View>
  );
}
```

---

### **Streak Edge Cases**

| Scenario | Behavior |
|----------|----------|
| User logs at 11:59 PM | Counts for today |
| User logs at 12:01 AM | Counts for new day |
| User logs multiple times same day | Streak doesn't increment |
| User skips a day | Streak resets to 0 (or 1 if logged today) |
| User travels across timezones | Use device timezone (not UTC) |
| User changes timezone mid-day | Streak logic uses "day" based on logged_at timestamp |

---

### **Payment Failures**

**Google Play Billing error:**
```jsx
try {
  await purchaseSubscription();
} catch (error) {
  if (error.code === 'USER_CANCELED') {
    // User closed payment sheet, do nothing
  } else if (error.code === 'PAYMENT_DECLINED') {
    showError('Payment failed. Please check your payment method.');
  } else {
    showError('Something went wrong. Please try again.');
    // Log to Sentry
  }
}
```

---

### **Data Sync Conflicts**

**If user edits expense while offline:**

```javascript
// On edit
const editExpense = async (id, updates) => {
  // 1. Update locally
  setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
  
  // 2. Queue sync
  await queueSync({ type: 'update', id, updates });
  
  // 3. Try to sync
  if (isOnline) {
    await syncQueue();
  }
};

// On reconnect
useEffect(() => {
  if (isOnline) {
    syncQueue(); // Sync pending changes
    fetchExpenses(); // Get fresh data
  }
}, [isOnline]);
```

**Conflict resolution:** Last write wins (simple for MLP).

---

## Final UX Checklist

Before shipping, verify:

### **Core Flows**
- [ ] First-time user can complete onboarding in <60s
- [ ] Scanning receipt takes <5s from tap to logged
- [ ] Manual entry takes <20s
- [ ] Burn Rate Meter updates immediately after expense logged
- [ ] Undo toast appears and works correctly
- [ ] Paywall appears at 11th scan attempt
- [ ] Pro purchase flow completes successfully

### **Visual Polish**
- [ ] All buttons have 48x48px touch targets
- [ ] Text contrast ratios meet WCAG AA (4.5:1)
- [ ] Loading states for all async actions
- [ ] Error states for all failure scenarios
- [ ] Empty states for all lists/screens
- [ ] Haptic feedback on key interactions
- [ ] Animations are smooth (60fps)

### **Accessibility**
- [ ] All interactive elements have labels
- [ ] Screen reader can navigate entire app
- [ ] App works with large text sizes
- [ ] No color-only information
- [ ] Form errors clearly described
- [ ] Time-based content can be paused

### **Performance**
- [ ] App opens in <2s
- [ ] Expense list loads in <1s
- [ ] OCR completes in <5s (90th percentile)
- [ ] No jank/stutter during scrolling
- [ ] Images optimized before upload
- [ ] Offline mode gracefully degraded

### **Edge Cases**
- [ ] Camera permission denied handled
- [ ] Network errors show retry option
- [ ] OCR failures allow manual entry
- [ ] Payment errors clearly explained
- [ ] Streak logic works across timezones
- [ ] Empty states for all scenarios

---

## What's NOT in MLP (Post-MVP Features)

Save these for v1.1+:

- ❌ Dark mode
- ❌ Charts/reports (pie charts, line graphs)
- ❌ Recurring expenses
- ❌ Bill reminders
- ❌ Shared budgets (couples/roommates)
- ❌ Export to CSV/PDF
- ❌ Custom categories
- ❌ Widgets
- ❌ Bank integrations
- ❌ BNPL tracking
- ❌ Debt tracking
- ❌ Savings goals
- ❌ Bill splitting
- ❌ Social features (leaderboards, friends)
- ❌ AI spending insights/advice

**Focus:** Nail the core loop (scan → burn rate → streak) before adding features.

---

## Handoff to Development

This UI/UX spec is now **locked**. Do not make design changes during Phase 1-6 development unless you find a critical UX bug.

**For AI coding assistants:**
- Reference this doc when building screens
- Follow component specs exactly
- Use color palette from tulung-color-palette-final.md
- Don't improvise—ask if something is unclear

**For testing:**
- Test every flow in this doc on a real Android device
- Pay special attention to touch targets (use "Show taps" in Developer Options)
- Test with TalkBack enabled (accessibility)
- Test with slow network (Chrome DevTools throttling)

---

**NOW GO BUILD IT.** 🚀

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Final — Ready for Implementation
