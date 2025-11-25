# Product Requirements Document (PRD)

## Tulung — AI-Powered Expense Tracker for Gen Z

**Version:** 1.0 (MLP - Minimum Lovable Product)  
**Last Updated:** November 2024  
**Status:** Ready to Build  
**Target Platform:** Android (React Native)  
**Timeline:** 6 weeks to ship

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Audience](#3-target-audience)
4. [Product Vision](#4-product-vision)
5. [Success Metrics](#5-success-metrics)
6. [MLP Feature Scope](#6-mlp-feature-scope)
7. [Feature Specifications](#7-feature-specifications)
8. [Technical Architecture](#8-technical-architecture)
9. [Database Schema](#9-database-schema)
10. [Monetization Strategy](#10-monetization-strategy)
11. [UI/UX Guidelines](#11-uiux-guidelines)
12. [Release Plan](#12-release-plan)
13. [Cost Breakdown](#13-cost-breakdown)
14. [Risk Assessment](#14-risk-assessment)
15. [Post-MLP Roadmap](#15-post-mlp-roadmap)

---

## 1. Executive Summary

### 1.1 Product Overview

Tulung is a mobile-first expense tracking app that uses AI-powered receipt scanning to make expense tracking effortless. Designed for Gen Z users globally who want to understand their spending without manual data entry.

### 1.2 Core Value Proposition

**"Track your spending in 3 seconds. Just snap and done."**

No forms. No fields. No friction. Just take a photo of your receipt and Tulung automatically logs the expense.

### 1.3 Key Differentiators

| Differentiator | Description |
|----------------|-------------|
| Speed | Sub-5-second expense logging via AI |
| Fully Automatic | No confirmation required — auto-logs with smart undo |
| Burn Rate Meter | Visual daily budget drain that creates emotional feedback |
| Gen Z Aesthetic | Modern, clean UI designed for younger users |
| Global-First | Multi-currency support, not region-locked |

### 1.4 MLP Philosophy

This MLP is ruthlessly focused on validating THREE core assumptions:

1. **Does AI receipt scanning work well enough to feel magical?**
2. **Does the Burn Rate Meter create enough emotional feedback to drive daily opens?**
3. **Will users pay $2.99/month for unlimited scans?**

Everything else is noise until these are proven.

---

## 2. Problem Statement

### 2.1 The Core Problem

Gen Z users globally struggle to track their daily spending. Existing solutions are:

- **Too complex** — Traditional finance apps require extensive manual input
- **Too boring** — Spreadsheets work but provide no motivation
- **Too disconnected** — Bank apps show transactions but no actionable insights
- **Region-locked** — Many good apps only work in US/UK with bank integrations

### 2.2 Current User Behavior

| Behavior | Pain Point |
|----------|------------|
| Using Notes app | No structure, no insights, easy to forget |
| Ignoring expenses | "Vibing" until money runs out |
| Spreadsheets | High friction, rarely updated |
| Bank apps | Passive, no context, delayed |

### 2.3 The Opportunity

No expense tracker combines:
- Effortless AI-powered input
- Instant visual feedback
- Gen Z-friendly aesthetics
- Global multi-currency support

---

## 3. Target Audience

### 3.1 Primary Persona

**Name:** Alex, 24  
**Occupation:** Junior software developer / designer / marketer  
**Income:** $2,500-4,000/month  
**Location:** Any major city globally (Manila, Bangkok, Kuala Lumpur, Jakarta, Mumbai, Mexico City, São Paulo, etc.)

**Characteristics:**
- First job, learning to manage money independently
- Uses BNPL services (Klarna, Affirm, Atome, Grab PayLater) frequently
- Spends impulsively on food delivery, coffee, online shopping
- Wants to save but lacks visibility into spending patterns
- Tech-savvy, mobile-first mindset
- Values speed and aesthetics over feature depth

**Goals:**
- Know where money goes each month
- Reduce impulse spending
- Build better financial habits without it feeling like work

**Frustrations:**
- "I don't know where my money went"
- "Tracking expenses is boring and tedious"
- "I always forget to log things"

### 3.2 User Segments (MLP Focus)

| Segment | Priority | Characteristics |
|---------|----------|-----------------|
| Young professionals (22-28) | P0 | Regular income, want to build habits |
| University students (18-22) | P1 | Variable income, budget-conscious |
| Gig workers (20-30) | P2 | Irregular income, need flexibility |

---

## 4. Product Vision

### 4.1 Vision Statement

**"Make personal finance feel like something you actually want to do."**

### 4.2 Product Principles

1. **Speed over completeness** — A fast, partial log beats a perfect log that never happens
2. **Visual over numerical** — Show spending as feelings (drain, colors) not just numbers
3. **Awareness over judgment** — Help users see patterns, don't shame them
4. **Simple over powerful** — Do one thing exceptionally well
5. **Global over local** — Build for everyone, not just one market

### 4.3 Jobs To Be Done

| Job | Context | Outcome |
|-----|---------|---------|
| Log an expense | Just paid for something | Know it's recorded without effort |
| Check remaining budget | Throughout the day | Visual confirmation of spending status |
| Understand spending patterns | End of week | See where money went |
| Build tracking habit | Daily | Feel motivated to continue streak |

---

## 5. Success Metrics

### 5.1 North Star Metric

**Weekly Active Users (WAU) who log ≥3 expenses**

This captures both retention (weekly return) and engagement (meaningful usage).

### 5.2 Primary Metrics

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| DAU/MAU ratio | 20% | 30% |
| D7 retention | 25% | 35% |
| D30 retention | 10% | 20% |
| Avg. scans per user per day | 2 | 4 |
| Pro conversion rate | 1% | 3% |

### 5.3 Secondary Metrics

| Metric | Target |
|--------|--------|
| Avg. time to log expense | < 5 seconds |
| OCR accuracy rate | > 70% (80%+ ideal) |
| Snap Streak length (median) | 5 days |
| App rating (Play Store) | 4.0+ |
| Crash-free sessions | 99.5% |

### 5.4 Counter Metrics (Red Flags)

| Metric | Red Flag Threshold |
|--------|-------------------|
| D1 uninstall rate | > 30% |
| OCR failure rate | > 30% |
| Pro conversion | < 0.5% |

---

## 6. MLP Feature Scope

### 6.1 What's IN (P0 - Must Ship)

| Feature | Why It's Critical |
|---------|------------------|
| Receipt scan + AI extraction | Core value prop — without this, we're just another manual tracker |
| Auto-log with undo toast | Reduces friction — users don't need to confirm every scan |
| Burn Rate Meter | Emotional feedback — makes spending feel real |
| Manual expense entry | Fallback when OCR fails or user has no receipt |
| Expense list view | Users need to see what they logged |
| Edit/delete expense | Users need control over their data |
| Daily budget setting | Foundation for Burn Rate Meter |
| Snap Streak | ONLY gamification — drives daily habit |
| 10 scans/month free tier | Forces monetization decision early |
| Pro subscription ($2.99/month) | Revenue — proves willingness to pay |

### 6.2 What's OUT (Post-MLP)

| Feature | Why It's Cut |
|---------|-------------|
| Daily Spending Rank | Social comparison isn't validated — adds complexity |
| Impulse tagging | Doesn't directly drive retention or conversion |
| Achievements | Generic gamification — doesn't fit our core loop |
| Leaderboards | Social features require critical mass — premature |
| Weekly/monthly reports | Build after we know users come back |
| Ads | Focus on paid conversion first — ads complicate everything |
| Export to CSV | Power user feature — not MLP |
| Custom categories | Predefined categories are good enough for MLP |
| Recurring expenses | Add when users request it |
| Bill reminders | Out of scope for expense tracking |

---

## 7. Feature Specifications

### 7.1 Receipt Scanning + AI Extraction

**Description:** Users snap a photo of a receipt or import from gallery. AI extracts amount, merchant name, and suggests a category.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| RS-01 | User can capture receipt photo via in-app camera | P0 |
| RS-02 | User can import image from device gallery | P0 |
| RS-03 | System extracts total amount from receipt image | P0 |
| RS-04 | System detects currency from receipt (multi-currency) | P0 |
| RS-05 | System extracts merchant name from receipt image | P0 |
| RS-06 | System suggests category based on merchant/content | P0 |
| RS-07 | System handles multi-language receipts (EN, ES, FR, DE, ZH, JA, etc.) | P0 |
| RS-08 | Processing completes in < 5 seconds | P0 |
| RS-09 | System stores receipt image in cloud storage | P0 |
| RS-10 | Manual entry fallback when OCR fails | P0 |

**Non-Functional Requirements:**

| ID | Requirement |
|----|-------------|
| RS-NF-01 | OCR accuracy > 70% (amount extraction) |
| RS-NF-02 | Supports JPEG, PNG, HEIC formats |
| RS-NF-03 | Max image size: 10MB |
| RS-NF-04 | Graceful degradation when API fails |

**Technical Implementation:**
- Use **GPT-4o mini (vision)** via OpenAI API
- Call directly from React Native app (no backend proxy for MLP)
- API key obfuscated in environment variables
- Prompt: "Extract the total amount, merchant name, and suggest a category from this receipt. Return JSON: {amount, currency, merchant, category}"

**Failure Handling:**
- If OCR confidence < 50% → Show "Couldn't read receipt" modal with manual entry option
- If API timeout (>10s) → Show error, allow retry
- Store failed images for later debugging

---

### 7.2 Auto-Log with Undo Toast

**Description:** After successful OCR, expense is automatically logged. User sees a 3-second toast notification with undo option.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| AL-01 | Expense auto-logs immediately after OCR success | P0 |
| AL-02 | Toast notification appears for 3 seconds | P0 |
| AL-03 | User can tap "Undo" to cancel the log | P0 |
| AL-04 | Toast shows: amount, category, merchant | P0 |
| AL-05 | After 3s, toast disappears and log is permanent | P0 |
| AL-06 | User can tap toast to edit details before timeout | P1 |

**User Flow:**
1. User snaps receipt
2. Loading indicator (1-3s)
3. OCR extracts data
4. Expense auto-logged
5. Toast appears: "✅ $12.50 logged — Food (Starbucks) [Undo]"
6. After 3s → Toast fades, log confirmed
7. Burn Rate Meter updates

---

### 7.3 Burn Rate Meter

**Description:** Visual representation of daily budget consumption. Shows how much of today's budget has been spent.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| BRM-01 | Display daily budget as a circular progress meter | P0 |
| BRM-02 | Update in real-time after each expense log | P0 |
| BRM-03 | Show % spent and amount remaining | P0 |
| BRM-04 | Color-coded: Green (0-50%), Yellow (50-80%), Red (80-100%), Dark Red (>100%) | P0 |
| BRM-05 | Display on home screen (always visible) | P0 |
| BRM-06 | Tap meter to see today's expenses breakdown | P1 |

**Visual Design:**
- Circular progress bar (like Apple Watch activity rings)
- Center shows: "$12 / $50" and "24% spent"
- Color transitions smoothly as % increases
- Subtle animation when new expense logged

**Formula:**
```
Daily Budget = Monthly Budget / Days in Month
Burn Rate % = (Today's Total Expenses / Daily Budget) × 100
```

---

### 7.4 Manual Expense Entry

**Description:** Fallback method for logging expenses when no receipt is available or OCR fails.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| ME-01 | User can tap "+ Add Expense" button | P0 |
| ME-02 | Form fields: Amount, Category, Merchant (optional), Note (optional) | P0 |
| ME-03 | Amount input supports decimals and multi-currency | P0 |
| ME-04 | Category selection from predefined list | P0 |
| ME-05 | User can save without filling all optional fields | P0 |
| ME-06 | Manual entries count toward daily scan quota (if free user) | P0 |

**UI:**
- Bottom sheet modal
- Large numeric keypad for amount
- Quick category icons (tap to select)
- Save button always visible

---

### 7.5 Expense List View

**Description:** Chronological list of all logged expenses with filtering by time period.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| EL-01 | Display expenses grouped by day | P0 |
| EL-02 | Show: amount, merchant, category icon, timestamp | P0 |
| EL-03 | Tap expense to view details (receipt image, edit option) | P0 |
| EL-04 | Swipe left to delete | P0 |
| EL-05 | Filter: Today, This Week, This Month | P0 |
| EL-06 | Show daily totals for each date group | P0 |
| EL-07 | Pull to refresh | P1 |

**Design:**
- Card-based layout
- Receipt thumbnail (if available)
- Category color coding
- Date headers with daily totals

---

### 7.6 Snap Streak

**Description:** Visual indicator of consecutive days user has logged at least one expense.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| SS-01 | Track consecutive days with ≥1 expense logged | P0 |
| SS-02 | Display streak count on home screen | P0 |
| SS-03 | Streak resets to 0 if user skips a day | P0 |
| SS-04 | Show "🔥 5-day streak" badge | P0 |
| SS-05 | Celebrate milestones (7, 14, 30 days) with modal | P1 |

**Logic:**
- Check `users.last_snap_date` when new expense logged
- If `last_snap_date` = yesterday → Increment `streak_count`
- If `last_snap_date` = today → No change
- If `last_snap_date` < yesterday → Reset `streak_count = 1`

**Visual:**
- Fire emoji + number
- Prominent placement near Burn Rate Meter
- Subtle animation on streak increment

---

### 7.7 Daily Budget Setting

**Description:** Onboarding flow where user sets their daily spending budget.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| DB-01 | Shown during first-time onboarding | P0 |
| DB-02 | User can enter monthly budget → app calculates daily | P0 |
| DB-03 | Support multi-currency selection | P0 |
| DB-04 | User can edit budget anytime in settings | P0 |
| DB-05 | Default suggestion based on global averages | P1 |

**Flow:**
1. "What's your monthly spending budget?"
2. User enters: "$1,500"
3. App calculates: "That's ~$50/day"
4. Confirm → Saved to `users.daily_budget`

---

### 7.8 Pro Subscription

**Description:** Paid tier that removes scan quota and unlocks future premium features.

**Functional Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| PRO-01 | Free users limited to 10 scans/month | P0 |
| PRO-02 | Pro users get unlimited scans | P0 |
| PRO-03 | Pro costs $2.99/month (via Google Play Billing) | P0 |
| PRO-04 | Paywall shown when free user hits scan limit | P0 |
| PRO-05 | "Upgrade to Pro" CTA visible in settings | P0 |
| PRO-06 | Pro status synced to `users.is_pro` in database | P0 |

**Free Tier Enforcement:**
- Track scans in `scan_quota` table
- Reset count on 1st of each month
- When user hits 10 scans → Show paywall modal
- Allow manual entry even if scan quota exhausted (for UX)

**Paywall Copy:**
```
🚀 You've used all 10 free scans this month

Upgrade to Pro for:
✅ Unlimited receipt scans
✅ Priority support
✅ Future features first

$2.99/month — Cancel anytime
```

---

## 8. Technical Architecture

### 8.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile | React Native (Expo) | Cross-platform, fast iteration, built-in camera |
| Backend | Supabase (PostgreSQL + Auth + Storage) | Free tier generous, scales well, real-time DB |
| AI/ML | OpenAI GPT-4o mini (vision) | Best OCR accuracy, multi-language support |
| Payments | RevenueCat + Google Play Billing | Simplifies subscription management |
| Analytics | PostHog (self-hosted or cloud) | Open-source, privacy-friendly |
| State | Zustand | Lightweight, simpler than Redux |

### 8.2 System Architecture

```
┌─────────────────┐
│  React Native   │
│   (Android)     │
│                 │
│  - Camera       │
│  - UI/UX        │
│  - State (Zustand)│
└────────┬────────┘
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐
│   Supabase      │      │   OpenAI API    │
│                 │      │                 │
│  - Auth         │      │  - GPT-4o mini  │
│  - PostgreSQL   │      │  - Vision OCR   │
│  - Storage      │      └─────────────────┘
│  - RLS          │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  RevenueCat     │
│  (Subscription) │
└─────────────────┘
```

### 8.3 Key Design Decisions

#### Why No Backend API for MLP?
- **Simplicity:** Direct API calls from app = less code, faster shipping
- **Cost:** No server hosting costs
- **Security:** Obfuscated API keys + rate limiting on OpenAI side
- **Post-MLP:** Add proxy when scale requires it (>1000 DAU)

#### Why Expo over Bare React Native?
- **Built-in camera/gallery access** via `expo-camera` and `expo-image-picker`
- **Faster dev setup** — no Xcode/Android Studio config hell
- **OTA updates** — fix bugs without Play Store review
- **Can eject later** if custom native modules needed

#### Why RevenueCat?
- **Simplifies IAP** — handles Google Play Billing complexity
- **Cross-platform** — ready for iOS later
- **Free tier** — $0 until $10K MRR
- **Webhook support** — syncs Pro status to Supabase

---

## 9. Database Schema

### 9.1 Tables

#### **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  daily_budget DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  last_snap_date DATE,
  streak_count INT DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMP
);
```

#### **expenses**
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  merchant TEXT,
  note TEXT,
  receipt_url TEXT, -- Supabase Storage URL
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_logged ON expenses(user_id, logged_at DESC);
```

#### **categories** (Predefined, read-only)
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT, -- emoji or icon name
  sort_order INT
);

-- Default categories
INSERT INTO categories (name, icon, sort_order) VALUES
  ('Food & Dining', '🍔', 1),
  ('Transportation', '🚗', 2),
  ('Shopping', '🛍️', 3),
  ('Entertainment', '🎬', 4),
  ('Bills & Utilities', '💡', 5),
  ('Healthcare', '🏥', 6),
  ('Other', '📦', 7);
```

#### **scan_quota** (For free tier limiting)
```sql
CREATE TABLE scan_quota (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  scans_this_month INT DEFAULT 0,
  reset_date DATE NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9.2 Row Level Security (RLS)

**Enable RLS on all tables:**

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_quota ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quota" ON scan_quota
  FOR ALL USING (auth.uid() = user_id);
```

---

## 10. Monetization Strategy

### 10.1 Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 10 scans/month, unlimited manual entry, ads (post-MLP), basic features |
| Pro | $2.99/month | Unlimited scans, priority support, early access to new features |

### 10.2 Why $2.99?

- **Lower barrier:** Gen Z has variable income — $2.99 is "coffee money"
- **Impulse price point:** Low enough to subscribe without overthinking
- **Competitive:** Lower than competitors (YNAB $14.99/month, Mint+ $4.99/month)
- **Test & iterate:** Easier to raise price than lower it

### 10.3 Conversion Funnel

```
New User
  ↓
Onboarding → Set daily budget
  ↓
First scan (FREE) → Experience AI magic
  ↓
2-9 scans → Build habit, see Burn Rate Meter value
  ↓
10th scan → HIT PAYWALL
  ↓
Convert to Pro OR churn
```

**Key insight:** Users must experience value (AI scan + Burn Rate feedback) BEFORE hitting paywall.

### 10.4 Revenue Projections (Conservative)

| Users | Pro Conversion | MRR |
|-------|---------------|-----|
| 500 DAU | 1% | $150 |
| 1,000 DAU | 2% | $600 |
| 5,000 DAU | 3% | $4,500 |

**Break-even:** ~200 Pro users ($600 MRR) to cover OpenAI + Supabase + domain costs.

---

## 11. UI/UX Guidelines

### 11.1 Design Principles

1. **Speed is king** — Every screen loads in <1s
2. **Thumb-friendly** — All primary actions in bottom 60% of screen
3. **Visual hierarchy** — Numbers big, labels small
4. **Color = emotion** — Green (good), Red (warning), not decorative
5. **Minimize text** — Icons + numbers > sentences

### 11.2 Color Palette

```
Primary:    #6C5CE7 (Purple - modern, Gen Z)
Success:    #00B894 (Green - under budget)
Warning:    #FDCB6E (Yellow - approaching limit)
Danger:     #FF7675 (Red - over budget)
Background: #F8F9FA (Light gray)
Text:       #2D3436 (Dark gray)
```

### 11.3 Typography

- **Primary font:** Inter (clean, modern)
- **Headers:** 24-32px, bold
- **Body:** 16-18px, regular
- **Numbers:** 28-48px, semibold (makes amounts stand out)

### 11.4 Key Screens (Wireframe Descriptions)

#### Home Screen
```
┌─────────────────────────────────┐
│         Tulung                  │ ← Top bar
│                                 │
│   ┌─────────────────────────┐  │
│   │   BURN RATE METER       │  │ ← Circular progress
│   │                         │  │
│   │       $12 / $50         │  │ ← Big numbers
│   │      24% spent          │  │
│   │                         │  │
│   └─────────────────────────┘  │
│                                 │
│   🔥 5-day streak               │ ← Streak badge
│                                 │
│   Today's Expenses              │
│   ──────────────────────────    │
│   🍔 Lunch - $8.50              │
│   ☕ Coffee - $3.50             │
│   ──────────────────────────    │
│   Total: $12.00                 │
│                                 │
│   [This Week] [This Month]      │ ← Filter tabs
│                                 │
│         [📸 Scan Receipt]       │ ← Primary CTA (sticky bottom)
└─────────────────────────────────┘
```

#### Scan Flow
```
1. Tap "Scan Receipt" → Camera opens
2. Snap photo → Loading spinner (1-3s)
3. Auto-log → Toast appears
4. Toast: "✅ $8.50 logged — Food [Undo]"
5. Returns to home → Burn Rate Meter updates
```

#### Paywall (When 10 scans used)
```
┌─────────────────────────────────┐
│         🚀                      │
│                                 │
│   You've used all 10 free      │
│   scans this month              │
│                                 │
│   Upgrade to Pro:               │
│   ✅ Unlimited scans            │
│   ✅ Priority support           │
│   ✅ Future features            │
│                                 │
│   $2.99/month                   │
│   Cancel anytime                │
│                                 │
│   [Subscribe to Pro]            │
│                                 │
│   [Maybe Later]                 │
└─────────────────────────────────┘
```

---

## 12. Release Plan

### 12.1 6-Week Sprint Breakdown

#### **Week 1-2: Foundation**
- [ ] React Native project setup (Expo)
- [ ] Supabase project setup + database schema
- [ ] Supabase Auth (email + Google OAuth)
- [ ] Basic navigation (React Navigation)
- [ ] Home screen UI shell
- [ ] Settings screen
- [ ] Camera permissions

**Deliverable:** App shell with auth flow

---

#### **Week 3-4: Core Feature**
- [ ] Camera integration (`expo-camera`)
- [ ] Image upload to Supabase Storage
- [ ] OpenAI GPT-4o mini API integration
- [ ] OCR response parsing → auto-log expense
- [ ] Undo toast component (3s timeout)
- [ ] Expense list view (grouped by date)
- [ ] Manual expense entry form
- [ ] Edit/delete expense

**Deliverable:** Working expense logging (scan + manual)

---

#### **Week 5: Polish + Monetization**
- [ ] Burn Rate Meter UI + logic
- [ ] Snap Streak tracking + display
- [ ] Scan quota enforcement (10/month)
- [ ] RevenueCat setup
- [ ] Google Play Billing integration
- [ ] Paywall modal
- [ ] Pro status sync to Supabase
- [ ] Settings page (edit budget, manage subscription)

**Deliverable:** Full MLP feature set

---

#### **Week 6: Testing + Ship**
- [ ] Internal testing (you + 3 friends)
- [ ] Fix critical bugs
- [ ] Play Store listing:
  - [ ] Screenshots (5-8)
  - [ ] App description
  - [ ] Feature graphic
  - [ ] Icon (512x512)
- [ ] Privacy policy page (required for Play Store)
- [ ] Terms of service page
- [ ] Google Play Console setup
- [ ] **SHIP TO PLAY STORE** (beta or production)

**Deliverable:** Live on Play Store

---

### 12.2 Daily Development Cadence

- **Morning:** 4-hour deep work block (no Slack, no email)
- **Afternoon:** 2-hour testing + bug fixing
- **Evening:** 1-hour planning next day's tasks
- **Sunday:** Review week, adjust scope if needed

**Total dev time:** ~40-50 hours/week for 6 weeks = 240-300 hours

---

### 12.3 Launch Checklist

**Pre-Launch:**
- [ ] Privacy Policy live at https://yourwebsite.com/privacy
- [ ] Terms of Service live at https://yourwebsite.com/terms
- [ ] App Store screenshots (5-8 images)
- [ ] App description written (150 words short, 4000 words long)
- [ ] Feature graphic (1024x500 for Play Store)
- [ ] App icon (512x512 PNG)
- [ ] Test on ≥3 Android devices (different models)
- [ ] Crash-free rate > 99%
- [ ] Google Play Console account ($25 one-time)

**Play Store Compliance:**
- [ ] Target API level 34+ (Android 14)
- [ ] Data safety form completed
- [ ] Permission justifications written
- [ ] App content rating questionnaire
- [ ] No policy violations (test thoroughly)

**Post-Launch:**
- [ ] Monitor crash reports (Firebase Crashlytics or Sentry)
- [ ] Track key metrics (PostHog or Mixpanel)
- [ ] Set up support email (support@tulung.app)
- [ ] Prepare for user feedback (in-app + email)

---

## 13. Cost Breakdown

### 13.1 Monthly Costs (First 3 Months)

| Item | Cost/Month | Notes |
|------|------------|-------|
| Supabase | $0 | Free tier: 500MB DB, 1GB storage, 2GB bandwidth |
| OpenAI API (GPT-4o mini) | $30-50 | ~5K scans/month @ $0.01/image |
| RevenueCat | $0 | Free under $10K MRR |
| Google Play Dev Account | $25 one-time | Required for Play Store |
| Domain (tulung.app) | $1/month | $12/year for .app domain |
| Hosting (landing page) | $0 | Vercel free tier |
| **Total (Month 1)** | **~$56** | One-time + first month |
| **Total (Month 2-3)** | **~$31-51/month** | Recurring only |

### 13.2 Cost Scaling

| Users | Scans/Month | OpenAI Cost | Supabase Cost | Total |
|-------|-------------|-------------|---------------|-------|
| 100 | 1,000 | $10 | $0 | $10 |
| 500 | 5,000 | $50 | $0 | $50 |
| 1,000 | 10,000 | $100 | $0 | $100 |
| 5,000 | 50,000 | $500 | $25 (Pro tier) | $525 |

**Break-even:** ~200 Pro subscribers ($600 MRR) covers $525 operating costs at 5K users.

### 13.3 Bootstrapped Reality

- **First 3 months budget:** $150-200 total
- **No fundraising needed** — Can launch with savings
- **Profit margin:** High (70-80%) once you hit scale
- **Risk:** Low — If it fails, you lost $200 and 6 weeks

---

## 14. Risk Assessment

### 14.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OCR accuracy < 70% | Medium | Critical | Test on 100+ receipts before launch; improve prompt; fallback to manual |
| OpenAI API downtime | Low | High | Cache last known status; allow manual entry always |
| Supabase free tier exhausted | Low | Medium | Monitor usage weekly; upgrade to Pro ($25/month) if needed |
| Play Store rejection | Medium | High | Follow all policies; prepare appeal docs; beta test first |
| Expo limitations hit | Low | Medium | Can eject to bare React Native if needed |

### 14.2 Product Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Users don't return after D1 | High | Critical | Nail onboarding; push notifications (post-MLP); streak mechanic |
| Free tier too generous | Medium | High | 10 scans/month is intentionally low — watch conversion rate |
| Users bypass OCR with manual entry | Medium | Medium | Track method used; optimize OCR if manual % > 50% |
| Pro conversion < 1% | High | Critical | Test pricing ($1.99 vs $2.99); improve paywall copy; add features |

### 14.3 Market Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Competitor launches similar product | Medium | Medium | Ship fast; focus on speed + UX; build community |
| Users prefer bank integrations | Low | Medium | Position as complementary; add API integrations later |
| Low willingness to pay | Medium | High | Validate early; adjust pricing; consider ads if needed |

---

## 15. Post-MLP Roadmap

### 15.1 Version 1.1 (Month 2-3)
**Goal:** Improve retention

| Feature | Why |
|---------|-----|
| Weekly/monthly summary report | Shows long-term value |
| Receipt gallery view | Let users browse past receipts |
| Push notifications (streak reminders) | Drive daily habit |
| Widget (Android home screen) | Persistent visibility |

### 15.2 Version 1.2 (Month 4-6)
**Goal:** Increase conversion

| Feature | Why |
|---------|-----|
| Custom categories | Power user request |
| Recurring expense tracking | Auto-log subscriptions |
| Budget alerts | Notify when approaching limit |
| Export to CSV/PDF | Enable tax/analysis use cases |

### 15.3 Version 2.0 (Month 7-12)
**Goal:** Scale & differentiate

| Feature | Why |
|---------|-----|
| iOS version | Expand to iPhone users (60% of US market) |
| Bank API integration (optional) | Auto-import transactions for Pro users |
| BNPL tracking | Track Klarna/Afterpay installments |
| Shared budgets | Couples/roommates tracking |
| AI spending insights | Personalized advice based on patterns |

### 15.4 Decision Gates

| Milestone | Decision |
|-----------|----------|
| 500 DAU | Kill or continue? If D7 retention < 20%, pivot |
| 2% Pro conversion | Pricing is validated — scale marketing |
| 5,000 DAU | Raise funding OR continue bootstrapping? |
| $5K MRR | Hire part-time dev/designer OR stay solo? |

---

## 16. Final Notes

### What We're NOT Doing (And Why)

| Feature | Why Not |
|---------|---------|
| Social features | Requires critical mass — premature |
| AI spending advice | Cool but not core value prop |
| Debt tracking | Different product — scope creep |
| Bill splitting | Adds complexity — P&L not validated |
| Multi-device sync | Supabase handles this automatically |
| Dark mode | Nice-to-have — post-MLP |

### Success = Validating Assumptions

This MLP is designed to answer THREE questions:

1. **Does AI receipt scanning feel magical?** (Measure: OCR accuracy, user feedback)
2. **Does Burn Rate Meter drive retention?** (Measure: D7/D30 retention)
3. **Will users pay $2.99/month?** (Measure: Pro conversion rate)

If any of these fail, we pivot or kill.

### Your Advantage

- **Speed:** 6 weeks to market
- **Focus:** One core feature done exceptionally well
- **Cost:** <$200 to validate
- **Learning:** Real users, real data, real revenue

Ship it. Learn. Iterate. Win.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2024 | Initial MLP PRD (refined from original SnapBudget doc) |

---

**END OF DOCUMENT**

Now go fucking build it. 🚀
