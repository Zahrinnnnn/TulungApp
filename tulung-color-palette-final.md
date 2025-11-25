# Tulung Color Palette — Gen Z Edition

**Version:** 1.0 MLP  
**Target:** Global Gen Z users (18-28)  
**Vibe:** Fresh, energetic, modern, mobile-first  
**Philosophy:** Bold enough to stand out, simple enough to ship fast

---

## 🎨 Core Brand Colors (Primary Palette)

### Primary — Electric Teal
```
#1DD3C0
RGB: 29, 211, 192
HSL: 174°, 76%, 47%

Usage: Primary buttons, CTAs, key actions, branding
Why: Energetic, modern, screams "new tech" — stands out without being corporate
Perfect for: Scan button, subscribe CTA, active states
```

### Primary Dark — Deep Teal
```
#0FB9A8
RGB: 15, 185, 168
HSL: 174°, 85%, 39%

Usage: Button hover states, pressed states, darker accents
Why: Provides visual feedback without jumping to a different color family
Perfect for: Hover effects, active tabs, selected items
```

### Accent — Neon Aqua
```
#2DE5E8
RGB: 45, 229, 232
HSL: 181°, 80%, 54%

Usage: Streak badges, milestone celebrations, special highlights
Why: High energy, attention-grabbing — use sparingly for dopamine hits
Perfect for: "🔥 5-day streak", new feature badges, celebration moments
DO NOT use for: Large areas, backgrounds, or anything that needs to be read
```

---

## ✅ Semantic Colors (Feedback & Status)

### Success — Mint Green
```
#00D9A3
RGB: 0, 217, 163
HSL: 165°, 100%, 43%

Usage: Success toasts, expense logged confirmation, positive feedback
Why: Distinct from brand teal, universally understood as "good"
Perfect for: "✅ Expense logged", streak milestones, budget under limit
```

### Warning — Amber
```
#FFB020
RGB: 255, 176, 32
HSL: 39°, 100%, 56%

Usage: Budget warnings (80%+ spent), caution states, important notices
Why: Grabs attention without alarming — "careful but not critical"
Perfect for: "You've spent 80% of today's budget" banner
```

### Danger — Hot Coral
```
#FF5370
RGB: 255, 83, 112
HSL: 351°, 100%, 66%

Usage: Over-budget alerts, OCR failures, critical errors
Why: Modern red (not aggressive), Gen Z-friendly, Instagram-ish
Perfect for: "Over budget!", "Scan failed", delete confirmations
```

### Info — Sky Blue
```
#57B8FF
RGB: 87, 184, 255
HSL: 205°, 100%, 67%

Usage: Tips, hints, neutral information, educational content
Why: Friendly, non-threatening, complements teal without competing
Perfect for: Onboarding tooltips, help text, feature explanations
```

---

## 🌈 Burn Rate Meter Colors (Emotional Feedback)

**This is the most important visual element in your app. Colors must be instantly readable.**

### Safe Zone (0-50% spent)
```
#00D9A3 (Mint Green)
Message: "You're doing great! 💚"
Feeling: Calm, in control, winning
```

### Caution Zone (51-79% spent)
```
#FFB020 (Amber)
Message: "Watch your spending today ⚠️"
Feeling: Awareness, slight tension, still okay
```

### Danger Zone (80-99% spent)
```
#FF8C42 (Burnt Orange)
RGB: 255, 140, 66
HSL: 23°, 100%, 63%
Message: "Almost at your limit! 🔥"
Feeling: Urgency, need to stop spending
```

### Over Budget (100%+)
```
#FF5370 (Hot Coral)
Message: "You're over budget 😬"
Feeling: Oops, need to course-correct tomorrow
```

**Color transitions should be smooth** — use linear interpolation between zones for the circular progress bar.

---

## 🖼️ Neutral Colors (Backgrounds, Text, UI)

### Backgrounds

**Light Mode Primary**
```
#FFFFFF (Pure White)
Usage: Main app background, card backgrounds
Why: Clean, maximizes contrast, reduces eye strain
Note: Use subtle shadows for depth, not tinted backgrounds
```

**Light Mode Secondary**
```
#F8F9FA (Soft Gray)
RGB: 248, 249, 250
Usage: Section dividers, input field backgrounds, disabled states
Why: Barely-there gray, defines areas without adding noise
```

**Light Mode Tertiary**
```
#E9ECEF (Light Gray)
RGB: 233, 236, 239
Usage: Borders, separators, inactive elements
Why: Subtle but visible, doesn't compete with content
```

---

### Text Colors

**Primary Text**
```
#1A1D29
RGB: 26, 29, 41
HSL: 228°, 22%, 13%

Usage: Headings, expense amounts, key information
Why: Near-black with slight blue tint (softer than #000000)
Contrast: 16.5:1 on white (WCAG AAA)
Perfect for: H1, H2, $$ amounts, merchant names
```

**Secondary Text**
```
#4A5568
RGB: 74, 85, 104
HSL: 217°, 17%, 35%

Usage: Labels, descriptions, timestamps, helper text
Why: Readable but clearly secondary hierarchy
Contrast: 8.1:1 on white (WCAG AAA)
Perfect for: "2 hours ago", category labels, form labels
```

**Tertiary Text (Subtle)**
```
#9CA3AF
RGB: 156, 163, 175
HSL: 217°, 11%, 65%

Usage: Placeholders, disabled text, very low-priority info
Why: Visible but doesn't demand attention
Contrast: 3.7:1 on white (WCAG AA for large text)
Perfect for: Input placeholders, "No expenses yet" empty states
```

---

## 🌙 Dark Mode Colors (Post-MLP)

**Background Base**
```
#0F172A (Deep Navy)
RGB: 15, 23, 42
Usage: Main dark mode background
Why: Softer than pure black, easier on eyes, premium feel
```

**Card Background**
```
#1E293B (Slate)
RGB: 30, 41, 59
Usage: Card/container backgrounds in dark mode
Why: Subtle elevation without harsh contrast
```

**Dark Mode Text**
```
#F1F5F9 (Almost White)
RGB: 241, 245, 249
Usage: Primary text on dark backgrounds
Why: Easier on eyes than pure white, reduces glare
```

**Primary Teal in Dark Mode**
```
#1DD3C0 (Same as light mode)
Why: Teal pops beautifully on dark backgrounds
No adjustment needed
```

---

## 🎯 Component-Specific Colors

### Buttons

**Primary CTA**
```css
background: linear-gradient(135deg, #1DD3C0 0%, #0FB9A8 100%);
color: #FFFFFF;
border: none;
box-shadow: 0 4px 12px rgba(29, 211, 192, 0.3);

/* Hover */
box-shadow: 0 6px 20px rgba(29, 211, 192, 0.4);
transform: translateY(-2px);
```

**Secondary Button**
```css
background: rgba(29, 211, 192, 0.08);
color: #1DD3C0;
border: 1.5px solid #1DD3C0;

/* Hover */
background: rgba(29, 211, 192, 0.15);
```

**Danger Button (Delete)**
```css
background: transparent;
color: #FF5370;
border: 1.5px solid #FF5370;

/* Hover */
background: rgba(255, 83, 112, 0.08);
```

---

### Cards & Containers

**Standard Card (Expense Item)**
```css
background: #FFFFFF;
border: 1px solid #E9ECEF;
border-radius: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

/* Hover/Active */
border-color: #1DD3C0;
box-shadow: 0 4px 16px rgba(29, 211, 192, 0.12);
```

**Highlighted Card (Today's total, streaks)**
```css
background: linear-gradient(135deg, rgba(29, 211, 192, 0.08) 0%, rgba(45, 229, 232, 0.08) 100%);
border: 1.5px solid rgba(29, 211, 192, 0.3);
border-radius: 20px;
box-shadow: 0 4px 20px rgba(29, 211, 192, 0.15);
```

---

### Inputs & Forms

**Text Input (Default)**
```css
background: #F8F9FA;
border: 2px solid #E9ECEF;
border-radius: 12px;
color: #1A1D29;

/* Focus */
border-color: #1DD3C0;
background: #FFFFFF;
box-shadow: 0 0 0 4px rgba(29, 211, 192, 0.1);
```

**Input Error State**
```css
border-color: #FF5370;
box-shadow: 0 0 0 4px rgba(255, 83, 112, 0.1);
```

---

### Toasts & Notifications

**Success Toast (Expense Logged)**
```css
background: #00D9A3;
color: #FFFFFF;
border-radius: 16px;
box-shadow: 0 8px 24px rgba(0, 217, 163, 0.3);

Content: "✅ $12.50 logged — Food [Undo]"
```

**Warning Toast (Budget Alert)**
```css
background: #FFB020;
color: #1A1D29;
border-radius: 16px;
box-shadow: 0 8px 24px rgba(255, 176, 32, 0.3);

Content: "⚠️ You've spent 80% of today's budget"
```

**Error Toast (OCR Failed)**
```css
background: #FF5370;
color: #FFFFFF;
border-radius: 16px;
box-shadow: 0 8px 24px rgba(255, 83, 112, 0.3);

Content: "❌ Couldn't read receipt. Try again?"
```

---

## 💎 Special Effects (Use Sparingly)

### Streak Fire Effect
```css
/* For milestone celebrations (7, 14, 30 days) */
background: linear-gradient(135deg, #FF8C42 0%, #FF5370 50%, #FFB020 100%);
/* Animated gradient for "fire" effect */
```

### Shimmer Effect (Loading States)
```css
background: linear-gradient(
  90deg,
  #F8F9FA 0%,
  #FFFFFF 50%,
  #F8F9FA 100%
);
/* Animate background-position for skeleton loaders */
```

### Glow Effect (Pro Badge)
```css
box-shadow: 
  0 0 20px rgba(29, 211, 192, 0.4),
  0 0 40px rgba(29, 211, 192, 0.2),
  0 0 60px rgba(29, 211, 192, 0.1);
/* Pulsing glow for Pro features */
```

---

## 📱 Gen Z Design Principles

### Why These Colors Work for Gen Z

**1. Bold but not obnoxious**
- Teal (#1DD3C0) is vibrant without being "startup blue" (#2196F3)
- Distinct from competitors (Mint = green, YNAB = blue, Wallet = purple)

**2. Instagram-ready**
- Coral red (#FF5370) is literally Instagram's color palette
- Neon aqua (#2DE5E8) = TikTok aesthetic vibes
- Your app will look good in screenshots

**3. Emotional, not clinical**
- Burn Rate colors create feelings: green = calm, red = urgency
- Not sterile like bank apps (Navy blue #003366 = boring AF)

**4. Mobile-optimized**
- High contrast (16.5:1) = readable in bright sunlight
- Solid colors = fast rendering on budget Android phones
- No performance-killing blur effects

**5. Accessible but fun**
- WCAG AAA compliant (not boring gray-on-gray)
- Color-blind friendly (red-green alternatives via shape/icon)

---

## 🚫 What NOT to Do

### Don't Use These Colors

```
❌ #6C5CE7 (Generic startup purple)
❌ #2196F3 (Overused tech blue)
❌ #4CAF50 (Android Material green)
❌ #000000 (Pure black — too harsh)
❌ Gradients everywhere (slow, looks 2015)
```

### Don't Mix

```
❌ Warm colors (orange/red) with cool colors (blue) — exception: warning/error states only
❌ More than 2 colors in a single component
❌ Teal + blue + green all at once (pick one family)
```

---

## 🎨 Complete Palette Summary

### Copy-Paste for Developer Handoff

```javascript
// colors.ts
export const colors = {
  // Brand
  primary: '#1DD3C0',
  primaryDark: '#0FB9A8',
  accent: '#2DE5E8',
  
  // Semantic
  success: '#00D9A3',
  warning: '#FFB020',
  danger: '#FF5370',
  info: '#57B8FF',
  
  // Burn Rate Meter
  burnSafe: '#00D9A3',
  burnCaution: '#FFB020',
  burnDanger: '#FF8C42',
  burnOver: '#FF5370',
  
  // Neutrals
  white: '#FFFFFF',
  background: '#F8F9FA',
  border: '#E9ECEF',
  
  // Text
  textPrimary: '#1A1D29',
  textSecondary: '#4A5568',
  textTertiary: '#9CA3AF',
  
  // Dark Mode (future)
  darkBg: '#0F172A',
  darkCard: '#1E293B',
  darkText: '#F1F5F9',
};

// React Native StyleSheet
export const theme = {
  colors: colors,
  
  // Shadows
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    large: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  
  // Border Radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    round: 999,
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};
```

---

## ✅ MLP Implementation Checklist

**Phase 1: Core Colors**
- [ ] Set up colors.ts with all values
- [ ] Test primary teal on white background (contrast check)
- [ ] Implement button styles (primary, secondary, danger)
- [ ] Test on Android device (color accuracy)

**Phase 2: Burn Rate Meter**
- [ ] Implement 4-color gradient (safe → caution → danger → over)
- [ ] Test smooth color transitions
- [ ] Verify readability in bright sunlight
- [ ] Test with color-blind simulator

**Phase 3: Semantic Colors**
- [ ] Implement toast notifications (success, warning, error)
- [ ] Add icons to toasts (not just color-dependent)
- [ ] Test error states (OCR failure, network error)

**Phase 4: Polish**
- [ ] Add subtle shadows to cards
- [ ] Implement hover states (if applicable)
- [ ] Test dark mode prep (future)
- [ ] Accessibility audit (TalkBack, VoiceOver)

---

## 🎯 Color Psychology for Expense Tracking

**Why this palette drives behavior:**

**Teal (#1DD3C0):**
- **Perception:** Modern, trustworthy, energetic
- **Behavior:** Encourages action (scan receipt NOW)
- **Feeling:** "This app is fresh, not boring"

**Green (#00D9A3):**
- **Perception:** Success, safety, good job
- **Behavior:** Positive reinforcement (keep logging!)
- **Feeling:** "I'm winning at budgeting"

**Amber (#FFB020):**
- **Perception:** Caution, pay attention, slow down
- **Behavior:** Awareness without panic
- **Feeling:** "Careful, but I'm still okay"

**Coral (#FF5370):**
- **Perception:** Error, over-limit, oops
- **Behavior:** Immediate course-correction
- **Feeling:** "Tomorrow I'll do better"

---

## 🚀 Competitive Differentiation

**How Tulung's colors stand out:**

| App | Primary Color | Vibe | Problem |
|-----|--------------|------|---------|
| Mint | Blue (#00A7E1) | Corporate, serious | Boring, not Gen Z |
| YNAB | Blue (#005A8C) | Professional, dense | Too heavy, intimidating |
| Money Lover | Green (#4CAF50) | Android Material | Generic, forgettable |
| Spendee | Purple (#8E44AD) | Playful | Too cutesy, not serious |
| **Tulung** | **Teal (#1DD3C0)** | **Energetic, modern, fresh** | **None — it pops** |

Your teal is distinct, ownable, and screams "new generation of finance apps."

---

## 📊 Final Recommendations

### For MLP (Week 1-6)
✅ Use this exact palette  
✅ Solid colors only (no gradients except primary button)  
✅ Focus on Burn Rate Meter colors (most important)  
✅ Test on mid-range Android devices  

### Post-MLP (v1.1+)
🎨 Add dark mode (colors already defined above)  
✨ Experiment with subtle gradients on cards  
🔥 Animated streak fire effect for milestones  
💎 Pro badge glow effect  

### Never Do
❌ Add more colors "just because"  
❌ Use glassmorphism (performance nightmare)  
❌ Deviate from this palette mid-build  
❌ Copy competitors (stay unique)  

---

**This palette is production-ready. No more color decisions needed.**  
**Now go build the fucking app.** 🚀

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Final — Ready for Implementation
