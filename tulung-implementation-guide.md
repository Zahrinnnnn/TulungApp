# Tulung — Phase-by-Phase Implementation Guide

**Purpose:** This document breaks down the Tulung MLP into actionable phases for AI-assisted development.  
**Timeline:** 6 weeks  
**Tech Stack:** React Native (Expo), Supabase, OpenAI GPT-4o mini, RevenueCat  

---

## How to Use This Document

1. **Feed each phase to your AI coding assistant** (Claude Code, Cursor, etc.)
2. **Prompt:** "Read and understand this phase. Start implementation."
3. **Complete Phase 0 manually** (database setup, project configs)
4. **Work through phases sequentially** — each builds on the previous
5. **Test after each phase** before moving to the next

---

## Development Notes & Remarks

### Testing Environment: Expo Go

We are using **Expo Go** for testing during development. This has some implications:

| Feature | Expo Go Support | Notes |
|---------|-----------------|-------|
| Email/Password Auth | ✅ Works | Use this for testing |
| Google OAuth | ❌ Doesn't work | Requires development build |
| Camera (expo-camera) | ✅ Works | Part of Expo SDK |
| Image Picker (expo-image-picker) | ✅ Works | Part of Expo SDK |
| RevenueCat | ❌ Doesn't work | Requires development build (Phase 5) |

### When to Switch to Development Build

You'll need to switch from Expo Go to a **development build** when:
- Testing Google OAuth authentication
- Testing in-app purchases (RevenueCat) in Phase 5
- Building for production release

To create a development build:
```bash
npx expo prebuild
npx expo run:android
```

### Running the App (Expo Go)

```bash
cd tulung
npx expo start
# Scan QR code with Expo Go app on your Android device
```

---

## Phase 0: Manual Setup (YOU DO THIS)

**Duration:** 1-2 hours  
**Goal:** Set up all external services and configs before coding starts

### 0.1 Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Choose region closest to target users
   - Save the following credentials:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

2. **Run Database Schema**
   - Go to Supabase SQL Editor
   - Run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
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

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  merchant TEXT,
  note TEXT,
  receipt_url TEXT,
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_expenses_user_logged ON expenses(user_id, logged_at DESC);

-- Categories table (predefined)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INT
);

-- Insert default categories
INSERT INTO categories (name, icon, sort_order) VALUES
  ('Food & Dining', '🍔', 1),
  ('Transportation', '🚗', 2),
  ('Shopping', '🛍️', 3),
  ('Entertainment', '🎬', 4),
  ('Bills & Utilities', '💡', 5),
  ('Healthcare', '🏥', 6),
  ('Other', '📦', 7);

-- Scan quota table
CREATE TABLE scan_quota (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  scans_this_month INT DEFAULT 0,
  reset_date DATE NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_quota ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quota" ON scan_quota
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quota" ON scan_quota
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quota" ON scan_quota
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

3. **Configure Supabase Storage**
   - Go to Storage → Create bucket: `receipts`
   - Make bucket **private** (only authenticated users can access)
   - Set up storage policy:

```sql
-- Storage policy for receipts bucket
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

4. **Enable Authentication Providers**
   - Go to Authentication → Providers
   - Enable Email (already enabled by default)
   - Enable Google OAuth:
     - Get credentials from Google Cloud Console
     - Add OAuth redirect URLs

---

### 0.2 OpenAI API Setup

1. Go to https://platform.openai.com
2. Create API key
3. Save `OPENAI_API_KEY`
4. Set up billing (add credit card)
5. Set usage limits (optional but recommended):
   - Hard limit: $50/month
   - Email notification at: $25/month

---

### 0.3 RevenueCat Setup

1. Go to https://www.revenuecat.com
2. Create account (free tier)
3. Create new app → Select Android
4. Save `REVENUECAT_PUBLIC_API_KEY`
5. Configure products:
   - Product ID: `pro_monthly`
   - Price: $2.99/month
   - Type: Auto-renewable subscription

---

### 0.4 Google Play Console Setup

1. Go to https://play.google.com/console
2. Pay $25 one-time developer fee
3. Create app (don't submit yet)
4. Go to Monetization → Products
5. Create subscription product:
   - Product ID: `pro_monthly` (must match RevenueCat)
   - Price: $2.99/month
   - Billing period: 1 month
   - Free trial: None (for MLP)

---

### 0.5 Environment Variables File

Create a `.env` file (you'll add this to the project in Phase 1):

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# RevenueCat
REVENUECAT_PUBLIC_API_KEY=your-revenuecat-key-here

# App Config
APP_NAME=Tulung
APP_VERSION=1.0.0
```

---

### 0.6 Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Supabase Storage bucket created
- [ ] Supabase Auth providers enabled
- [ ] OpenAI API key obtained
- [ ] RevenueCat account created
- [ ] Google Play Console account created
- [ ] All API keys saved in `.env` file

**Once complete, move to Phase 1.**

---

## Phase 1: Project Foundation & Authentication ✅ COMPLETED

**Duration:** Week 1
**Status:** ✅ Completed
**Goal:** Set up React Native project with Expo, implement authentication, and basic navigation

### What Was Built

```
tulung/
├── App.tsx                    # Main entry with NavigationContainer
├── app.json                   # Expo config with camera permissions
├── .env                       # Environment variables (add your keys!)
├── .env.example               # Template for env vars
└── src/
    ├── components/            # Reusable UI components (empty for now)
    ├── constants/
    │   └── colors.ts          # Full color palette from design spec
    ├── navigation/
    │   ├── AuthNavigator.tsx  # Login/SignUp stack
    │   ├── MainNavigator.tsx  # Bottom tab navigator
    │   └── RootNavigator.tsx  # Conditional auth/main routing
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx    # Email/password + Google OAuth
    │   │   └── SignUpScreen.tsx   # Registration with validation
    │   ├── home/
    │   │   └── HomeScreen.tsx     # Burn Rate Meter placeholder
    │   ├── expenses/
    │   │   └── ExpensesScreen.tsx # Placeholder
    │   └── settings/
    │       └── SettingsScreen.tsx # Full settings UI with sign out
    ├── services/
    │   └── supabase.ts        # Supabase client with AsyncStorage
    ├── store/
    │   └── authStore.ts       # Zustand auth state + user profile
    ├── types/
    │   ├── database.ts        # DB types matching Supabase schema
    │   └── index.ts           # Navigation param types
    └── utils/                 # Empty for now
```

### Before Running

1. **Add your Supabase credentials to `.env`:**
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Start the app:**
   ```bash
   cd tulung
   npm start
   # Press 'a' for Android
   ```

---

### Original Implementation Guide (Reference)

### 1.1 Project Initialization

**Prompt for AI:**
```
Create a new React Native project using Expo with TypeScript.
Project name: tulung
Initialize with the following:
- Expo SDK 50+
- TypeScript configuration
- ESLint and Prettier
- Git repository
```

**Expected Output:**
- Expo project structure
- `package.json` with dependencies
- `tsconfig.json` configured
- `.gitignore` file

---

### 1.2 Install Core Dependencies

**Prompt for AI:**
```
Install the following dependencies:

Production:
- @supabase/supabase-js (Supabase client)
- @react-navigation/native (Navigation)
- @react-navigation/native-stack (Stack navigator)
- @react-navigation/bottom-tabs (Tab navigator)
- zustand (State management)
- expo-camera (Camera access)
- expo-image-picker (Gallery access)
- expo-file-system (File operations)
- react-native-dotenv (Environment variables)
- axios (HTTP client)
- date-fns (Date utilities)

Dev:
- @types/react
- @types/react-native
```

**Expected Output:**
- Updated `package.json`
- `yarn.lock` or `package-lock.json`

---

### 1.3 Project Structure

**Prompt for AI:**
```
Create the following folder structure:

src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── home/          # Home/dashboard
│   ├── expenses/      # Expense-related screens
│   └── settings/      # Settings screens
├── navigation/         # Navigation configuration
├── services/          # API services (Supabase, OpenAI)
├── store/             # Zustand store
├── utils/             # Helper functions
├── constants/         # Constants (colors, fonts, etc.)
└── types/             # TypeScript types

Also create:
- src/constants/colors.ts (color palette)
- src/constants/fonts.ts (typography)
- src/types/index.ts (shared types)
```

**Expected Output:**
- Complete folder structure
- Placeholder files in each folder

---

### 1.4 Supabase Client Setup

**Prompt for AI:**
```
Create a Supabase client in src/services/supabase.ts

Requirements:
- Import Supabase URL and Anon Key from environment variables
- Initialize Supabase client
- Export client for use across the app
- Add TypeScript types for User and Session

Also create types in src/types/database.ts for:
- User (matching database schema)
- Expense (matching database schema)
- Category (matching database schema)
- ScanQuota (matching database schema)
```

**Expected Code:**
```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types will be imported from database.ts
```

---

### 1.5 Authentication Screens

**Prompt for AI:**
```
Create authentication screens:

1. src/screens/auth/LoginScreen.tsx
   - Email and password input fields
   - "Sign In" button
   - "Don't have an account? Sign Up" link
   - Google Sign-In button (using Supabase OAuth)
   - Loading state during authentication
   - Error handling with toast/alert

2. src/screens/auth/SignUpScreen.tsx
   - Email and password input fields
   - "Create Account" button
   - "Already have an account? Sign In" link
   - Input validation (email format, password min length 8)
   - Loading state
   - Error handling

Design requirements:
- Clean, modern UI
- Use colors from src/constants/colors.ts
- Thumb-friendly (buttons at bottom 60% of screen)
- Input fields with clear labels
- Password visibility toggle

Authentication logic:
- Use Supabase Auth (supabase.auth.signInWithPassword, signUp)
- On successful auth, navigate to Home
- Store auth state globally (Zustand store)
```

**Expected Output:**
- LoginScreen.tsx with full UI and logic
- SignUpScreen.tsx with full UI and logic
- Form validation
- Error handling

---

### 1.6 Auth State Management

**Prompt for AI:**
```
Create Zustand store for authentication state in src/store/authStore.ts

Store should include:
- user: User | null
- session: Session | null
- loading: boolean
- setUser: (user: User | null) => void
- setSession: (session: Session | null) => void
- signOut: () => Promise<void>

Also create:
- src/utils/auth.ts with helper functions:
  - checkAuthStatus(): Check if user is logged in
  - initializeAuth(): Listen for auth state changes
```

**Expected Output:**
- authStore.ts with Zustand store
- auth.ts with helper functions

---

### 1.7 Navigation Setup

**Prompt for AI:**
```
Set up React Navigation in src/navigation/

Create:
1. src/navigation/AuthNavigator.tsx
   - Stack navigator with Login and SignUp screens

2. src/navigation/MainNavigator.tsx
   - Tab navigator with:
     - Home (placeholder for now)
     - Expenses (placeholder)
     - Settings (placeholder)

3. src/navigation/RootNavigator.tsx
   - Conditionally renders AuthNavigator or MainNavigator based on auth state
   - Listens to Supabase auth changes
   - Shows loading spinner while checking auth status

4. App.tsx
   - Wraps app with NavigationContainer
   - Initializes auth listener
```

**Expected Output:**
- Complete navigation structure
- Auth flow working (logged out → Login → Home)

---

### 1.8 Testing Checklist

- [x] App runs on Android emulator/device
- [x] Can navigate to Sign Up screen
- [x] Can create account with email/password
- [x] Can sign in with created account
- [x] After sign in, navigates to Home (placeholder)
- [x] Can sign out (button in Settings)
- [x] Auth state persists on app reload

**End of Phase 1** ✅

---

## Phase 2: Core Expense Logging (Camera + Manual Entry) ✅ COMPLETED

**Duration:** Week 2
**Status:** ✅ Completed
**Goal:** Implement camera/gallery access and manual expense entry (NO AI OCR yet)

### Phase 2 Summary

Phase 2 is **100% complete**! All core expense logging features have been successfully implemented:

✅ **Camera & Gallery Integration** - FAB button with action sheet for photo capture or selection
✅ **Manual Expense Entry** - Complete form with amount, currency, category, merchant, notes
✅ **Expense Management** - Create, view, delete expenses with real-time updates
✅ **Dynamic Burn Rate Meter** - Color-coded daily spending tracker
✅ **Updated Home Screen** - Expense list with pull-to-refresh
✅ **Expense Details** - Full detail view with receipt image and delete functionality
✅ **Settings Enhancement** - Editable daily budget and currency selection
✅ **Image Upload** - React Native compatible upload to Supabase Storage
✅ **Streak System** - Automatic daily streak tracking
✅ **Haptic Feedback** - Throughout all user interactions

**Files Created:** 8 new files (components, screens, services, store, navigation, utils)
**Files Modified:** 3 files (HomeScreen, SettingsScreen, MainNavigator)
**Dependencies Added:** `base64-arraybuffer`
**All Tests Passing:** ✅ TypeScript compilation, no warnings, fully functional

---

### Original Implementation Guide (Reference)

### 2.1 Camera & Gallery Integration

**Prompt for AI:**
```
Implement camera and gallery functionality:

1. Create src/components/CameraButton.tsx
   - Floating action button (FAB) with camera icon
   - Position: Bottom-right, sticky
   - On press: Show action sheet with two options:
     - "Take Photo" → Opens camera
     - "Choose from Gallery" → Opens image picker

2. Create src/screens/expenses/CameraScreen.tsx
   - Full-screen camera view using expo-camera
   - Camera permissions handling
   - Capture button at bottom center
   - Flash toggle button
   - Close button (X) at top-left
   - After capture: Save photo to temp storage, navigate to expense form

3. Create src/utils/imageUtils.ts
   - pickImageFromGallery(): Opens gallery, returns image URI
   - captureImageFromCamera(): Handles camera capture
   - compressImage(): Compress image to <2MB for upload
   - getImageDimensions(): Get width/height

Permissions:
- Request camera permission on first use
- Request media library permission on first use
- Show helpful error messages if permissions denied
```

**Expected Output:**
- CameraButton component
- CameraScreen with camera view
- Image picker integration
- Permission handling

---

### 2.2 Manual Expense Entry Screen

**Prompt for AI:**
```
Create src/screens/expenses/AddExpenseScreen.tsx

This screen is shown:
1. When user taps "Enter Manually" from action sheet
2. After user captures/selects an image (for now, they'll enter details manually)

UI Components:
- Amount input (large, numeric keyboard)
- Currency selector (dropdown: USD, EUR, MYR, SGD, PHP, THB, IDR, INR, BRL, MXN)
- Category selector (grid of icons from categories table)
- Merchant name input (optional, text field)
- Note input (optional, multiline text)
- Receipt image preview (if image was provided)
- Save button (sticky at bottom)
- Cancel button (top-left)

Validation:
- Amount is required and > 0
- Category is required
- Currency defaults to user's currency (from user profile)

On Save:
1. Upload receipt image to Supabase Storage (if provided)
2. Insert expense record in expenses table
3. Update scan_quota (increment scans_this_month)
4. Update user.last_snap_date and streak_count
5. Show success toast
6. Navigate back to Home

Create src/services/expenseService.ts with:
- createExpense(expense: ExpenseInput): Promise<Expense>
- uploadReceiptImage(uri: string, userId: string): Promise<string> (returns storage URL)
- updateScanQuota(userId: string): Promise<void>
- updateStreak(userId: string): Promise<void>
```

**Expected Output:**
- AddExpenseScreen with full UI
- Form validation
- Supabase integration (expenses table)
- Image upload to Supabase Storage
- Expense creation working end-to-end

---

### 2.3 Expense Store (Zustand)

**Prompt for AI:**
```
Create src/store/expenseStore.ts

Store should manage:
- expenses: Expense[] (sorted by logged_at DESC)
- loading: boolean
- addExpense: (expense: Expense) => void
- updateExpense: (id: string, updates: Partial<Expense>) => void
- deleteExpense: (id: string) => void
- fetchExpenses: (userId: string) => Promise<void>

Also create:
- src/utils/expenseUtils.ts with:
  - calculateDailyTotal(expenses: Expense[], date: Date): number
  - filterExpensesByDate(expenses: Expense[], startDate: Date, endDate: Date): Expense[]
  - groupExpensesByDate(expenses: Expense[]): Record<string, Expense[]>
```

**Expected Output:**
- expenseStore.ts with Zustand store
- expenseUtils.ts with helper functions

---

### 2.4 Home Screen (Basic)

**Prompt for AI:**
```
Create src/screens/home/HomeScreen.tsx

For now, show:
1. Header with app name "Tulung"
2. Placeholder for Burn Rate Meter (just text: "Burn Rate Meter - Coming Soon")
3. Today's expenses list:
   - Group expenses by date
   - Show most recent 10 expenses
   - Each expense card shows:
     - Category icon
     - Merchant name
     - Amount with currency
     - Time (e.g., "2 hours ago")
   - Tap to view details
4. Empty state if no expenses: "No expenses yet. Tap + to add one!"
5. CameraButton (FAB) at bottom-right

Data:
- Fetch expenses on mount using expenseStore.fetchExpenses()
- Real-time updates when new expense added

Create src/components/ExpenseCard.tsx for expense list items.
```

**Expected Output:**
- HomeScreen with expense list
- ExpenseCard component
- Empty state
- Real-time updates working

---

### 2.5 Expense Details Screen

**Prompt for AI:**
```
Create src/screens/expenses/ExpenseDetailScreen.tsx

Accessed when user taps an expense card.

Show:
- Receipt image (full-screen thumbnail, tap to zoom)
- Amount (large font)
- Category
- Merchant
- Note (if provided)
- Date and time
- Edit button
- Delete button (with confirmation dialog)

Actions:
- Edit: Navigate to edit form (reuse AddExpenseScreen with pre-filled data)
- Delete: Show confirmation → Delete from database → Update store → Navigate back
```

**Expected Output:**
- ExpenseDetailScreen with full UI
- Edit functionality
- Delete with confirmation

---

### 2.6 User Store & Profile

**Prompt for AI:**
```
Create src/store/userStore.ts

Store should manage:
- userProfile: User | null
- dailyBudget: number
- currency: string
- streakCount: number
- isPro: boolean
- fetchUserProfile: (userId: string) => Promise<void>
- updateDailyBudget: (budget: number) => Promise<void>
- updateCurrency: (currency: string) => Promise<void>

Also create:
- src/screens/settings/SettingsScreen.tsx with:
  - Daily budget setting (editable)
  - Currency setting (dropdown)
  - Sign Out button
  - App version number
  - Placeholder for "Upgrade to Pro" (not functional yet)
```

**Expected Output:**
- userStore.ts with Zustand store
- SettingsScreen with basic settings
- Daily budget can be updated

---

### 2.7 Testing Checklist

- [x] Can open camera and take photo
- [x] Can choose image from gallery
- [x] Can enter expense manually (with or without image)
- [x] Expense appears in Home screen immediately
- [x] Can tap expense to view details
- [x] Can delete expense (with confirmation)
- [x] Daily budget can be set in Settings
- [x] Currency can be changed
- [x] Sign out works
- [x] TypeScript compilation passes
- [x] No deprecation warnings

**Note:** Edit expense functionality is placeholder (shows alert). Full edit mode will be implemented in a future update.

---

### What Was Built in Phase 2

**New Files Created:**
```
src/
├── components/
│   ├── CameraButton.tsx           # FAB with camera/gallery action sheet
│   └── ExpenseCard.tsx             # Expense list item component
├── screens/
│   └── expenses/
│       ├── AddExpenseScreen.tsx    # Full expense entry form
│       └── ExpenseDetailScreen.tsx # Expense detail view with delete
├── services/
│   └── expenseService.ts           # Expense CRUD + image upload
├── store/
│   └── expenseStore.ts             # Zustand state management
├── navigation/
│   └── HomeStackNavigator.tsx      # Nested navigation for Home tab
└── utils/
    ├── expenseUtils.ts             # Expense helper functions
    └── imageUtils.ts               # Camera/gallery utilities
```

**Key Features:**
- ✅ Camera & gallery integration with permissions
- ✅ Receipt image upload to Supabase Storage (React Native compatible)
- ✅ Manual expense entry with validation
- ✅ Dynamic burn rate meter (color-coded by % spent)
- ✅ Real-time expense list with pull-to-refresh
- ✅ Expense details view with delete
- ✅ Editable budget & currency settings
- ✅ Streak system (updates on expense creation)
- ✅ Scan quota tracking
- ✅ Haptic feedback throughout
- ✅ Multi-currency support (10 currencies)
- ✅ Category system (7 categories with icons)

**Technical Highlights:**
- Used `expo-file-system/legacy` for image operations
- Base64 → ArrayBuffer conversion for Supabase uploads
- Fixed `ImagePicker.MediaTypeOptions` deprecation
- Zustand for state management
- Pull-to-refresh functionality
- Safe area handling for all screens

**End of Phase 2** ✅

---

## Phase 3: AI-Powered Receipt Scanning (OpenAI Integration) ✅ COMPLETED

**Duration:** Week 3  
**Goal:** Integrate GPT-4o mini for automatic receipt data extraction

### 3.1 OpenAI Service

**Prompt for AI:**
```
Create src/services/openaiService.ts

Function: extractReceiptData(imageUri: string): Promise<ReceiptData>

Process:
1. Convert image to base64 using expo-file-system
2. Call OpenAI API (gpt-4o-mini) with vision
3. Prompt: "Extract the following from this receipt: total amount, currency, merchant name, and suggest a category. Return ONLY valid JSON with this exact structure: {\"amount\": number, \"currency\": string, \"merchant\": string, \"category\": string}. If you cannot read the receipt, return {\"error\": \"Could not read receipt\"}."
4. Parse JSON response
5. Validate response structure
6. Return ReceiptData or throw error

Types:
interface ReceiptData {
  amount: number;
  currency: string;
  merchant: string;
  category: string;
}

Error handling:
- Network errors → Retry once
- Invalid JSON → Throw error with message
- API rate limit → Throw error with message
- Timeout (>10s) → Throw error

Add loading state management.
```

**Expected Code:**
```typescript
// Example structure
export async function extractReceiptData(imageUri: string): Promise<ReceiptData> {
  // 1. Convert image to base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 2. Call OpenAI API
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract total amount, currency, merchant name, and suggest a category. Return ONLY valid JSON: {"amount": number, "currency": string, "merchant": string, "category": string}',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  // 3. Parse response
  const content = response.data.choices[0].message.content;
  const data = JSON.parse(content);

  // 4. Validate
  if (data.error) {
    throw new Error(data.error);
  }

  return data as ReceiptData;
}
```

---

### 3.2 Receipt Processing Screen

**Prompt for AI:**
```
Create src/screens/expenses/ProcessingScreen.tsx

This screen is shown immediately after user captures/selects an image.

UI:
- Full-screen overlay with semi-transparent background
- Loading spinner (large, centered)
- Status text: "Reading receipt..." → "Extracting details..." → "Almost done..."
- Cancel button (allows user to abort and go back)

Process:
1. Show loading spinner
2. Call extractReceiptData(imageUri)
3. If success:
   - Auto-create expense with extracted data
   - Upload receipt image to Supabase
   - Show success toast (3 seconds with undo option)
   - Navigate back to Home
4. If error:
   - Show error modal: "Couldn't read receipt. Try again or enter manually."
   - Options: [Retry] [Enter Manually] [Cancel]

Create src/components/UndoToast.tsx:
- Shows at bottom of screen
- Format: "✅ $12.50 logged — Food (Starbucks) [Undo]"
- Auto-dismiss after 3 seconds
- If undo tapped: Delete expense, show "Expense removed" toast

Update CameraScreen and gallery flow to navigate to ProcessingScreen after image selected.
```

**Expected Output:**
- ProcessingScreen with loading states
- OpenAI integration working
- Auto-logging with undo toast
- Error handling with retry option

---

### 3.3 OCR Accuracy Tracking

**Prompt for AI:**
```
Add OCR accuracy tracking:

Create src/services/analyticsService.ts with:
- logOCRAttempt(success: boolean, confidence?: number): void
- logOCRError(errorType: string): void
- getOCRStats(): { totalAttempts: number, successRate: number }

Store OCR stats locally (AsyncStorage) for debugging:
- Total attempts
- Successful extractions
- Failed extractions
- Common error types

Add optional "Was this correct?" feedback after auto-log:
- Small button in toast: "Not quite right? Tap to edit"
- If user edits, log as "low confidence" result
```

**Expected Output:**
- Analytics service for OCR tracking
- Optional feedback mechanism
- Stats stored locally

---

### 3.4 Fallback Flow Enhancement

**Prompt for AI:**
```
Update AddExpenseScreen to handle OCR pre-fill:

If navigated from ProcessingScreen with OCR data:
- Pre-fill form with extracted data
- Add banner at top: "We auto-filled this. Please verify."
- User can edit any field
- On save, mark as "OCR + manual edit" in analytics

If navigated from manual entry:
- Empty form as before

Add src/types/navigation.ts for typed navigation params.
```

---

### 3.5 Testing Checklist

- [ ] Can scan receipt with camera
- [ ] OCR extracts amount correctly (test 10 different receipts)
- [ ] OCR extracts merchant name (>70% accuracy)
- [ ] OCR suggests correct category (>60% accuracy)
- [ ] Auto-log works with 3-second undo
- [ ] Undo button removes expense immediately
- [ ] Error handling works (test with blurry image)
- [ ] Retry button works after failure
- [ ] "Enter Manually" fallback works
- [ ] Pre-filled form allows editing

**End of Phase 3**

---

## Phase 4: Burn Rate Meter & Streak System ✅ COMPLETED

**Duration:** Week 4
**Goal:** Implement emotional feedback mechanisms (Burn Rate Meter and Snap Streak)

### 4.1 Burn Rate Meter Component

**Prompt for AI:**
```
Create src/components/BurnRateMeter.tsx

Visual Design:
- Circular progress bar (like Apple Watch activity ring)
- Diameter: 220px
- Thickness: 16px
- Center content:
  - Top: Amount spent today (large font, e.g., "$12.50")
  - Middle: "/" separator
  - Bottom: Daily budget (medium font, e.g., "$50")
  - Below: Percentage (e.g., "25% spent")

Color Logic:
- 0-50%: Green (#00B894)
- 51-80%: Yellow (#FDCB6E)
- 81-100%: Orange (#FF7675)
- 100%+: Dark red (#D63031)

Animation:
- Smooth transition when percentage changes
- Subtle pulse animation when new expense added
- Celebration animation if user stays under budget all day

Data:
- Calculate from expenses table: SUM(amount) WHERE user_id = X AND DATE(logged_at) = TODAY
- Compare with user.daily_budget
- Update in real-time when expense added

Interaction:
- Tap meter → Show today's expense breakdown modal
- Modal shows:
  - Each category with total
  - Top spending category highlighted
  - Time of day chart (morning/afternoon/evening spending)

Use react-native-svg for circular progress rendering.
```

**Expected Output:**
- BurnRateMeter component with SVG circular progress
- Color transitions based on percentage
- Smooth animations
- Tap to view breakdown

---

### 4.2 Integrate Burn Rate Meter into Home

**Prompt for AI:**
```
Update src/screens/home/HomeScreen.tsx:

Layout:
1. Header with "Tulung" and date
2. Burn Rate Meter (prominent, top section)
3. Snap Streak badge (below meter)
4. Today's expenses list (scrollable)
5. CameraButton (FAB)

Daily Budget Calculation:
- If user set monthly budget: dailyBudget = monthlyBudget / daysInMonth
- If user set daily budget: use that value
- Default: $50 if not set

Add logic to recalculate daily budget at midnight (use date-fns).
```

---

### 4.3 Streak System

**Prompt for AI:**
```
Create src/utils/streakUtils.ts

Functions:
- updateStreak(userId: string): Promise<number>
  - Get user.last_snap_date and user.streak_count
  - If last_snap_date is TODAY → No change
  - If last_snap_date is YESTERDAY → Increment streak_count
  - If last_snap_date is OLDER → Reset streak_count to 1
  - Update user.last_snap_date to TODAY
  - Return new streak_count

- getStreakStatus(userId: string): Promise<StreakStatus>
  - Return: { streakCount: number, isActive: boolean, daysUntilBreak: number }
  - daysUntilBreak = 1 if logged today, 0 if not logged yet today

Call updateStreak() every time an expense is logged.

Create src/components/StreakBadge.tsx:
- Shows fire emoji + streak count: "🔥 5 days"
- If streak >= 7: Gold background
- If streak >= 30: Platinum background with sparkle animation
- Tap to view streak history (modal showing calendar with logged days)
```

**Expected Output:**
- Streak logic working correctly
- StreakBadge component
- Streak increments on consecutive days
- Resets if day skipped

---

### 4.4 Streak Milestone Celebrations

**Prompt for AI:**
```
Create src/components/MilestoneModal.tsx

Show celebration modal at milestones:
- 3 days: "Great start! 🎉"
- 7 days: "One week streak! 🔥"
- 14 days: "Two weeks! You're on fire! 🚀"
- 30 days: "ONE MONTH! Incredible! 🏆"
- 60, 90, 180, 365 days: Custom messages

Modal design:
- Full-screen overlay
- Confetti animation (use react-native-confetti-cannon)
- Large emoji
- Congratulatory message
- "Keep it up!" button to dismiss
- Share button (share achievement to social media - optional)

Trigger:
- After updateStreak() detects a milestone
- Show once per milestone (store shown milestones in AsyncStorage)
```

**Expected Output:**
- MilestoneModal component
- Confetti animation
- Only shows once per milestone
- Feels rewarding

---

### 4.5 Daily Budget Alerts

**Prompt for AI:**
```
Create src/utils/budgetUtils.ts

Function: checkBudgetAlert(todayTotal: number, dailyBudget: number): BudgetAlert | null

Alert thresholds:
- 80% of budget: Warning alert
- 100% of budget: Danger alert
- 120% of budget: Critical alert

Return:
interface BudgetAlert {
  type: 'warning' | 'danger' | 'critical';
  message: string;
  percentage: number;
}

Example messages:
- Warning: "You've spent 80% of today's budget"
- Danger: "Daily budget reached!"
- Critical: "You're over budget by 20%"

Show alert as a banner at top of Home screen when threshold crossed.
Create src/components/BudgetAlert.tsx for the banner.
```

**Expected Output:**
- Budget alert logic
- BudgetAlert banner component
- Shows/hides based on spending

---

### 4.6 Testing Checklist

- [ ] Burn Rate Meter displays correctly
- [ ] Meter color changes at 50%, 80%, 100%
- [ ] Meter updates in real-time when expense added
- [ ] Tap meter shows expense breakdown
- [ ] Streak badge shows current streak
- [ ] Streak increments on consecutive days
- [ ] Streak resets if day skipped
- [ ] Milestone modal shows at 7-day streak
- [ ] Budget alert appears at 80% spent
- [ ] Daily budget calculation is correct

**End of Phase 4**

---

## Phase 5: Monetization (Scan Quota & Pro Subscription)

**Duration:** Week 5  
**Goal:** Implement free tier limits and Pro subscription

### 5.1 Scan Quota Enforcement

**Prompt for AI:**
```
Update src/services/expenseService.ts:

Before allowing OCR scan:
1. Check scan_quota table for user
2. If scans_this_month < 10 → Allow scan
3. If scans_this_month >= 10 AND user.is_pro = false → Show paywall
4. If user.is_pro = true → Always allow

After successful OCR:
- Increment scan_quota.scans_this_month by 1

Monthly reset:
- Create src/utils/quotaUtils.ts
- Function: resetMonthlyQuota(userId: string): Promise<void>
- Set scans_this_month = 0
- Set reset_date = first day of next month
- Call this function at the start of each month (can use Supabase cron job or check on app open)

Create src/components/QuotaBadge.tsx:
- Shows in Settings: "Scans used: 7/10 this month"
- If Pro: "Unlimited scans"
- Color-coded: Green (<5), Yellow (5-9), Red (10)

Important: Manual expense entry should NOT count toward quota (only OCR scans).
```

**Expected Output:**
- Scan quota enforcement before OCR
- Quota increments after scan
- QuotaBadge shows usage
- Monthly reset logic

---

### 5.2 Paywall Screen

**Prompt for AI:**
```
Create src/screens/monetization/PaywallScreen.tsx

Triggered when:
- User hits 10 scans/month limit
- User taps "Upgrade to Pro" in Settings

UI Design:
- Header: "🚀 Upgrade to Pro"
- Benefits list:
  ✅ Unlimited receipt scans
  ✅ Priority support
  ✅ Early access to new features
  ✅ No ads (placeholder for future)
- Price: "$2.99/month"
- Subtext: "Cancel anytime"
- Primary button: "Subscribe to Pro"
- Secondary button: "Maybe Later"

Add visual comparison table:
| Feature | Free | Pro |
|---------|------|-----|
| Scans/month | 10 | Unlimited |
| Manual entry | Unlimited | Unlimited |
| Support | Community | Priority |

Make it feel valuable, not pushy.
```

**Expected Output:**
- PaywallScreen with compelling design
- Benefits clearly listed
- Call-to-action button
- "Maybe Later" option

---

### 5.3 RevenueCat Integration

**Prompt for AI:**
```
Create src/services/revenuecat.ts

Setup:
- Initialize RevenueCat SDK with REVENUECAT_PUBLIC_API_KEY
- Configure on app start

Functions:
- initializeRevenueCat(): void
- purchaseProSubscription(): Promise<boolean>
- restorePurchases(): Promise<boolean>
- checkProStatus(): Promise<boolean>
- getOfferings(): Promise<Offering[]>

Process:
1. When "Subscribe to Pro" tapped:
   - Call purchaseProSubscription()
   - RevenueCat handles Google Play Billing
   - On success:
     - Update user.is_pro = true in Supabase
     - Set user.pro_expires_at
     - Show success toast
     - Close paywall
   - On failure:
     - Show error message
     - Log error

2. On app start:
   - Call checkProStatus()
   - Sync with Supabase user.is_pro

3. In Settings, add "Restore Purchases" button:
   - Useful if user reinstalls app
   - Calls restorePurchases()

RevenueCat webhook:
- Set up webhook in RevenueCat dashboard
- Endpoint: Your backend (for MLP, can skip and just check on app open)
- Syncs Pro status to Supabase

Install: npm install react-native-purchases
```

**Expected Output:**
- RevenueCat SDK initialized
- Purchase flow working
- Pro status synced to Supabase
- Restore purchases working

---

### 5.4 Pro Status Management

**Prompt for AI:**
```
Update userStore to include Pro status management:

Add:
- checkAndUpdateProStatus(): Promise<void>
  - Call on app start
  - Check RevenueCat for active subscription
  - Update Supabase user.is_pro accordingly
  - If subscription expired, set is_pro = false

Add Pro badge to Settings screen:
- If Pro: Show "✨ Pro Member" badge
- If Free: Show "Upgrade to Pro" button

Create src/components/ProBadge.tsx:
- Small badge with sparkle icon
- Shown next to user's name/email in Settings
- Tappable → Shows subscription details (expiry date, manage subscription)
```

---

### 5.5 Testing Checklist

- [ ] Free user can scan 10 receipts
- [ ] On 11th scan attempt, paywall appears
- [ ] Manual entry still works when quota exhausted
- [ ] "Subscribe to Pro" button works
- [ ] Google Play purchase flow completes
- [ ] After purchase, user.is_pro updates in database
- [ ] Pro user can scan unlimited receipts
- [ ] Quota badge shows correct usage
- [ ] "Restore Purchases" works
- [ ] Pro badge shows in Settings

**Testing Note:** Use Google Play's test accounts for testing purchases without real money.

**End of Phase 5**

---

## Phase 6: Polish, Testing & Launch Prep

**Duration:** Week 6  
**Goal:** Final polish, bug fixes, Play Store preparation

### 6.1 UI/UX Polish

**Prompt for AI:**
```
Polish pass on all screens:

1. Loading States:
   - Add skeleton loaders for expense list (src/components/SkeletonLoader.tsx)
   - Show spinner during API calls
   - Disable buttons during async operations

2. Empty States:
   - Home (no expenses): Friendly illustration + "No expenses yet" message
   - Expense list (filtered, no results): "No expenses in this period"
   - Settings: Helpful tips for new users

3. Error States:
   - Network error: "Connection lost. Tap to retry."
   - OCR failed: "Couldn't read receipt. Try again or enter manually."
   - Payment failed: "Payment unsuccessful. Please try again."

4. Animations:
   - Add subtle fade-in for expense cards
   - Smooth transitions between screens
   - Haptic feedback on button presses (Haptics.impactAsync)

5. Accessibility:
   - Add accessibilityLabel to all buttons
   - Ensure sufficient color contrast
   - Support screen readers
   - Test with TalkBack (Android accessibility)

6. Performance:
   - Optimize image uploads (compress before upload)
   - Lazy load expense list (pagination if >100 expenses)
   - Cache categories in memory
   - Debounce search/filter inputs
```

**Expected Output:**
- All loading, empty, and error states implemented
- Smooth animations
- Haptic feedback
- Basic accessibility support

---

### 6.2 Onboarding Flow

**Prompt for AI:**
```
Create src/screens/onboarding/OnboardingScreen.tsx

3-step onboarding shown to new users:

Step 1: Welcome
- "Welcome to Tulung!"
- "Track your spending in 3 seconds"
- Illustration or animation

Step 2: How it works
- "Snap a receipt"
- "We extract the details"
- "Track your spending effortlessly"
- Show example receipt scan animation

Step 3: Set Daily Budget
- "What's your daily spending budget?"
- Input field for amount
- Currency selector
- "You can change this anytime"

After onboarding:
- Create user profile in database
- Set daily_budget and currency
- Navigate to Home

Store onboarding completion status in AsyncStorage:
- Key: "onboarding_completed"
- Value: true/false

Skip onboarding on subsequent app opens.
```

**Expected Output:**
- 3-step onboarding flow
- Daily budget set during onboarding
- Skips if already completed

---

### 6.3 App Icon & Splash Screen

**Prompt for AI:**
```
Generate app icon and splash screen assets:

1. App Icon:
   - Size: 512x512 PNG
   - Design: Simple, recognizable
   - Colors: Match brand (purple/green)
   - Suggestion: Receipt icon with lightning bolt (signifying speed)

2. Splash Screen:
   - Use expo-splash-screen
   - Show app logo + "Tulung" text
   - Background: Brand color
   - Auto-hide after app loads

Use Expo's asset generation:
npx expo-optimize

This will generate all required icon sizes for Android.
```

**Expected Output:**
- App icon in all required sizes
- Splash screen configured
- Assets in proper directories

---

### 6.4 App Configuration (app.json)

**Prompt for AI:**
```
Update app.json with production settings:

{
  "expo": {
    "name": "Tulung",
    "slug": "tulung",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6C5CE7"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.tulung"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6C5CE7"
      },
      "package": "com.yourname.tulung",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Tulung to access your camera to scan receipts."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Tulung to access your photos to select receipts."
        }
      ]
    ]
  }
}
```

---

### 6.5 Error Tracking & Analytics

**Prompt for AI:**
```
Set up error tracking:

Option 1: Sentry (recommended)
- Install: npx expo install sentry-expo
- Configure in App.tsx
- Captures crashes and errors
- Free tier: 5K events/month

Option 2: Firebase Crashlytics
- Install: expo install expo-firebase-crashlytics
- More complex setup but integrates with Firebase

Add basic analytics:
- Track key events:
  - App opened
  - Expense logged (scan vs manual)
  - Pro subscription purchased
  - OCR success/failure
  - Screen views

Use PostHog or Mixpanel (both have free tiers).

Install: npm install posthog-react-native

Create src/services/analyticsService.ts:
- trackEvent(name: string, properties?: object): void
- identifyUser(userId: string, traits?: object): void
```

**Expected Output:**
- Sentry configured for error tracking
- PostHog/Mixpanel configured for analytics
- Key events tracked

---

### 6.6 Testing (Internal)

**Prompt for AI:**
```
Create comprehensive test checklist:

Functional Tests:
- [ ] Sign up with email works
- [ ] Sign in with email works
- [ ] Sign in with Google works
- [ ] Sign out works
- [ ] Can scan receipt and auto-log expense
- [ ] Can choose image from gallery
- [ ] Can enter expense manually
- [ ] OCR accuracy >70% (test 20 receipts)
- [ ] Undo toast works (3-second timeout)
- [ ] Can edit expense
- [ ] Can delete expense
- [ ] Burn Rate Meter updates in real-time
- [ ] Meter color changes at thresholds
- [ ] Streak increments on consecutive days
- [ ] Streak resets if day skipped
- [ ] Milestone modal shows at 7 days
- [ ] Free user limited to 10 scans
- [ ] Paywall appears at 11th scan
- [ ] Pro purchase flow works
- [ ] Pro user has unlimited scans
- [ ] Daily budget can be changed
- [ ] Currency can be changed
- [ ] Settings persist after app restart
- [ ] Auth state persists after app restart

Performance Tests:
- [ ] App opens in <2 seconds
- [ ] OCR completes in <5 seconds
- [ ] Expense list loads in <1 second
- [ ] No memory leaks (run for 10 minutes)
- [ ] No crashes during normal use

Device Tests:
- [ ] Test on Android 10, 11, 12, 13, 14
- [ ] Test on low-end device (2GB RAM)
- [ ] Test on high-end device
- [ ] Test in portrait and landscape
- [ ] Test with slow network (airplane mode on/off)

Create src/__tests__/ directory for automated tests (optional for MLP):
- Unit tests for utility functions
- Integration tests for key flows

Run: npm test
```

---

### 6.7 Play Store Listing

**Prompt for AI:**
```
Prepare Play Store listing materials:

1. App Description (Short - 80 characters):
"Track expenses in 3 seconds. Snap receipts, we handle the rest."

2. App Description (Full - 4000 characters):
"
🚀 Track Your Spending Effortlessly

Tulung makes expense tracking as easy as taking a photo. No forms, no friction—just snap your receipt and we'll handle the rest.

✨ KEY FEATURES

📸 AI-Powered Receipt Scanning
Just snap a photo of your receipt. Our AI instantly extracts the amount, merchant, and category. No manual typing required.

🔥 Burn Rate Meter
See exactly how much of your daily budget you've spent with our visual burn rate meter. Stay aware of your spending in real-time.

📊 Snap Streak
Build a habit of tracking expenses with daily streaks. The longer your streak, the better your financial awareness.

💰 Smart Categorization
We automatically categorize your expenses so you can see where your money goes—food, transport, shopping, and more.

🎯 Daily Budget Tracking
Set your daily spending limit and get instant feedback on whether you're on track.

🌍 Multi-Currency Support
Track expenses in USD, EUR, MYR, PHP, SGD, THB, INR, BRL, MXN, and more.

💎 PRO FEATURES

Upgrade to Tulung Pro for:
• Unlimited receipt scans
• Priority support
• Early access to new features

---

WHO IS TULUNG FOR?

Perfect for:
• Young professionals learning to manage money
• Students on a tight budget
• Anyone who wants to stop wondering "where did my money go?"

---

START TODAY

Download Tulung now and take control of your spending in just 3 seconds per expense.

Questions? Contact us at support@tulung.app
"

3. Screenshots (5-8 images):
- Screenshot 1: Home screen with Burn Rate Meter
- Screenshot 2: Receipt scanning in action
- Screenshot 3: Expense list view
- Screenshot 4: Streak badge and milestone
- Screenshot 5: Pro benefits comparison
- Add short captions to each screenshot

4. Feature Graphic (1024x500):
- Show app icon + tagline: "Track expenses in 3 seconds"
- Eye-catching design

5. Promo Video (Optional but recommended):
- 30-second demo showing:
  - Open app → Snap receipt → Auto-logged → See Burn Rate Meter update
- Use screen recording + simple editing

Create these assets and save in /assets/store-listing/
```

---

### 6.8 Privacy Policy & Terms of Service

**Prompt for AI:**
```
Create simple website with Privacy Policy and Terms of Service:

Use free hosting: Vercel, Netlify, or GitHub Pages

Pages needed:
1. Landing page (index.html):
   - Hero: "Track expenses in 3 seconds"
   - Features overview
   - Download button (links to Play Store when live)
   - Screenshots
   - Footer with Privacy Policy and Terms links

2. Privacy Policy (/privacy.html):
   - What data we collect: Email, expenses, receipt images
   - How we use it: Provide app functionality
   - Third-party services: Supabase, OpenAI, RevenueCat
   - User rights: Access, delete, export data
   - Contact: support@tulung.app

3. Terms of Service (/terms.html):
   - Service description
   - User responsibilities
   - Subscription terms (Pro)
   - Limitation of liability
   - Termination policy

Generate using a privacy policy generator: https://www.freeprivacypolicy.com/

Domain: Use Vercel free subdomain (tulung.vercel.app) for MLP.

Update app.json with website URLs:
"privacy": "https://tulung.vercel.app/privacy",
"termsOfService": "https://tulung.vercel.app/terms"
```

**Expected Output:**
- Simple landing page
- Privacy Policy page
- Terms of Service page
- Hosted on free platform

---

### 6.9 Build & Submit to Play Store

**Prompt for AI:**
```
Build production APK/AAB:

1. Build for Android:
   npx eas build --platform android --profile production

   Configure eas.json:
   {
     "build": {
       "production": {
         "android": {
           "buildType": "app-bundle",
           "gradleCommand": ":app:bundleRelease"
         }
       }
     }
   }

2. Wait for build to complete (15-30 minutes)

3. Download the .aab file

4. Upload to Google Play Console:
   - Go to Release → Production
   - Create new release
   - Upload .aab file
   - Fill in release notes:
     "Initial release of Tulung - AI-powered expense tracker.
      Features: Receipt scanning, burn rate meter, snap streaks, and more."
   - Submit for review

5. Review process:
   - Usually takes 1-7 days
   - You may need to answer questions from Google
   - Be ready to fix any policy violations

Pre-submission checklist:
- [ ] App builds without errors
- [ ] All features tested on real device
- [ ] Privacy Policy and Terms links work
- [ ] App complies with all Google Play policies
- [ ] Content rating questionnaire completed
- [ ] Data safety form filled
```

---

### 6.10 Launch Checklist

Final checks before going live:

**Technical:**
- [ ] No critical bugs
- [ ] Crash-free rate >99%
- [ ] OCR accuracy tested on 50+ receipts
- [ ] All API keys secured
- [ ] Database RLS policies tested
- [ ] Pro subscription flow works
- [ ] Error tracking active (Sentry)
- [ ] Analytics tracking events

**Content:**
- [ ] Play Store listing complete
- [ ] Screenshots look professional
- [ ] App description compelling
- [ ] Privacy Policy live
- [ ] Terms of Service live
- [ ] Support email active (support@tulung.app)

**Business:**
- [ ] RevenueCat webhook configured
- [ ] Google Play developer account verified
- [ ] Payment methods set up
- [ ] Budget monitoring in place (OpenAI usage)

**Marketing (Optional for MLP):**
- [ ] Landing page live
- [ ] Social media accounts created (Twitter, Instagram)
- [ ] Launch tweet drafted
- [ ] Friend/family beta testing complete

---

## Post-Launch (Week 7+)

### Immediate Actions (Day 1-7)

1. **Monitor Key Metrics:**
   - Installs per day
   - D1 retention
   - Crash rate
   - OCR success rate
   - Pro conversion rate

2. **User Feedback:**
   - Check Play Store reviews daily
   - Respond to all reviews (good and bad)
   - Set up in-app feedback form
   - Create support email: support@tulung.app

3. **Bug Fixes:**
   - Prioritize critical bugs
   - Use Sentry to identify crashes
   - Release hotfixes if needed (via EAS Update for Expo)

4. **Iterate on OCR:**
   - Analyze failed OCR attempts
   - Improve prompt if accuracy <70%
   - Consider adding receipt type detection

### Week 2-4 Actions

1. **Optimize Conversion:**
   - If Pro conversion <1%, test new pricing ($1.99 or $3.99)
   - Improve paywall copy
   - Add social proof ("Join 1,000+ Pro users")

2. **Improve Retention:**
   - If D7 retention <20%, add push notifications
   - Test different streak messages
   - Add weekly summary email

3. **Feature Requests:**
   - Track most requested features
   - Don't build everything—focus on retention impact
   - Use PostHog to see which features users discover

4. **Growth:**
   - Share on Product Hunt
   - Post on Reddit (r/productivity, r/personalfinance)
   - Ask happy users to leave reviews
   - Consider simple referral program ("Invite a friend → 20 free scans")

### Decision Gates

**At 500 DAU:**
- If D7 retention <20% → Pivot or improve core loop
- If OCR accuracy <70% → Fix or consider alternative (Tesseract, Google Vision)
- If Pro conversion <0.5% → Reconsider monetization

**At 1,000 DAU:**
- If metrics look good → Scale marketing
- If burning too much cash on OpenAI → Add backend proxy with caching
- If users requesting iOS → Start iOS version

**At $5K MRR:**
- Consider hiring part-time help (designer or dev)
- Double down on growth
- Plan v1.1 features (weekly reports, bank integration)

---

## Common Pitfalls to Avoid

1. **Feature Creep:** Don't add features until core metrics (retention, conversion) are validated
2. **Premature Optimization:** Don't add backend caching or complex architecture until you have scale problems
3. **Ignoring Users:** Read every review and support email—early users tell you what's broken
4. **Analysis Paralysis:** Ship fast, iterate based on data, don't wait for perfection
5. **Pricing Too Low:** $2.99 is already cheap—don't go lower without testing
6. **Neglecting OCR Quality:** If OCR sucks, the whole product sucks. This is your core value prop.

---

## Final Notes

### What Success Looks Like (Month 3)

- 2,000+ DAU
- 25%+ D7 retention
- 3%+ Pro conversion
- $1,500+ MRR
- 4.0+ Play Store rating

If you hit these numbers, you've validated product-market fit. Time to scale.

### What Failure Looks Like (Month 3)

- <500 DAU after growth attempts
- <15% D7 retention (users don't come back)
- <0.5% Pro conversion (no willingness to pay)
- <3.5 Play Store rating (product quality issues)

If these are your numbers, time to pivot or kill. Don't keep building on a broken foundation.

---

## Support

If you get stuck during development:

1. **Technical Issues:** Ask Claude Code or Cursor for help with specific errors
2. **Supabase:** Check docs at https://supabase.com/docs
3. **Expo:** Check docs at https://docs.expo.dev
4. **RevenueCat:** Check docs at https://www.revenuecat.com/docs

---

**NOW GO BUILD. 6 WEEKS. SHIP IT. 🚀**

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Ready for Implementation
