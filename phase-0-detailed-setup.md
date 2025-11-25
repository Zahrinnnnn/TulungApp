# Phase 0: Manual Setup — Complete Step-by-Step Guide

**Duration:** 2-4 hours (depending on experience)  
**Goal:** Set up ALL external services before touching any code  
**Requirements:** Computer, internet, credit card (for OpenAI billing)  

---

## Overview: What You're Setting Up

Before you write a single line of code, you need:

1. **Supabase** — Database + auth + file storage (replaces building your own backend)
2. **OpenAI** — GPT-4o mini for receipt OCR (the AI that reads receipts)
3. **Google Play Console** — Required to publish Android apps ($25 one-time)
4. **RevenueCat** — Handles subscription payments (simplifies Google Play Billing)

**Total cost to complete Phase 0:** $25 (Google Play fee)  
**Monthly costs after launch:** ~$30-50 (OpenAI usage)

---

## 0.1 Supabase Setup (Detailed)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"** (green button, top-right)
3. Sign up with:
   - **GitHub** (recommended — easier OAuth later) OR
   - **Email + password**
4. Verify your email if you used email signup

**Screenshot description:** You should see the Supabase dashboard with "Create a new project" button.

---

### Step 2: Create New Project

1. Click **"New Project"** (big green button)
2. Fill in the form:

| Field | What to enter | Example |
|-------|---------------|---------|
| **Name** | tulung-production | `tulung-production` |
| **Database Password** | Generate strong password (click dice icon) | `XyZ123!@#AbC` |
| **Region** | Closest to your target users | `Southeast Asia (Singapore)` if targeting ASEAN, `United States (East)` if targeting US |
| **Pricing Plan** | Free (starts at $0/month) | Free |

3. Click **"Create new project"**
4. Wait 2-3 minutes for project to provision (loading screen)

**CRITICAL:** Save your database password somewhere safe. You won't need it often, but you CAN'T recover it if you lose it.

---

### Step 3: Get Your API Keys

Once project is ready:

1. In the left sidebar, click **"Settings"** (gear icon at bottom)
2. Click **"API"** in the settings menu
3. You'll see a page with several keys. Copy these:

**Project URL:**
```
https://abcdefghijklmnop.supabase.co
```
Save this as: `SUPABASE_URL`

**anon public key:** (long string starting with `eyJ...`)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNzg5MzIwMCwiZXhwIjoxOTQzNDY5MjAwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```
Save this as: `SUPABASE_ANON_KEY`

**service_role key:** (another long string starting with `eyJ...`)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjI3ODkzMjAwLCJleHAiOjE5NDM0NjkyMDB9.different_string_here_1234567890
```
Save this as: `SUPABASE_SERVICE_ROLE_KEY`

**How to save:** Create a text file called `tulung-credentials.txt` on your desktop. Paste all three values there. We'll use them later.

**Security note:** NEVER commit `service_role` key to GitHub. The `anon` key is safe to expose (it's public).

---

### Step 4: Create Database Tables

Now we set up the database schema (tables that store your data).

1. In left sidebar, click **"SQL Editor"** (icon looks like `</>`)
2. Click **"New query"** button (top-right)
3. Copy and paste this ENTIRE SQL script:

```sql
-- ============================================
-- TULUNG DATABASE SCHEMA
-- Version: 1.0 MLP
-- ============================================

-- Enable UUID extension (for generating unique IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Stores user accounts and settings
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  daily_budget DECIMAL(10,2) DEFAULT 50.00,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  last_snap_date DATE,
  streak_count INT DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMP WITH TIME ZONE
);

-- Add comment to table
COMMENT ON TABLE users IS 'User accounts with budget settings and Pro status';

-- ============================================
-- EXPENSES TABLE
-- Stores all logged expenses
-- ============================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  merchant TEXT,
  note TEXT,
  receipt_url TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for fast queries (critical for performance)
CREATE INDEX idx_expenses_user_logged ON expenses(user_id, logged_at DESC);
CREATE INDEX idx_expenses_user_created ON expenses(user_id, created_at DESC);

COMMENT ON TABLE expenses IS 'Individual expense records with receipt images';

-- ============================================
-- CATEGORIES TABLE
-- Predefined expense categories (read-only)
-- ============================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  sort_order INT NOT NULL
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

COMMENT ON TABLE categories IS 'Predefined expense categories with emoji icons';

-- ============================================
-- SCAN QUOTA TABLE
-- Tracks free tier usage (10 scans/month)
-- ============================================
CREATE TABLE scan_quota (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  scans_this_month INT DEFAULT 0 CHECK (scans_this_month >= 0),
  reset_date DATE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE scan_quota IS 'Tracks monthly scan usage for free tier limits';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_quota ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Expenses table policies
CREATE POLICY "Users can view own expenses" 
  ON expenses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" 
  ON expenses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" 
  ON expenses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" 
  ON expenses FOR DELETE 
  USING (auth.uid() = user_id);

-- Scan quota policies
CREATE POLICY "Users can view own quota" 
  ON scan_quota FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quota" 
  ON scan_quota FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quota" 
  ON scan_quota FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Categories table is public (everyone can read)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" 
  ON categories FOR SELECT 
  TO authenticated 
  USING (true);

-- ============================================
-- FUNCTIONS (Optional but useful)
-- ============================================

-- Function to auto-create scan quota when user signs up
CREATE OR REPLACE FUNCTION create_scan_quota_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO scan_quota (user_id, scans_this_month, reset_date)
  VALUES (
    NEW.id, 
    0, 
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create quota on user creation
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_scan_quota_for_new_user();

-- ============================================
-- VALIDATION
-- Run these queries to verify setup
-- ============================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Expected output: categories, expenses, scan_quota, users

-- Check categories were inserted
SELECT * FROM categories ORDER BY sort_order;

-- Expected output: 7 rows with emojis

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Expected output: All tables should have rowsecurity = true
```

4. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
5. Wait for success message: **"Success. No rows returned"**

**Troubleshooting:**
- If you get an error like `relation "users" already exists` → Your tables are already created, skip this step
- If you get `permission denied` → Make sure you're logged into the correct project
- If you get syntax errors → Make sure you copied the ENTIRE script (scroll up, it's long)

---

### Step 5: Verify Database Setup

Let's make sure everything worked:

1. In SQL Editor, run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
```

2. You should see 4 tables:
   - `categories`
   - `expenses`
   - `scan_quota`
   - `users`

3. Now run this to check categories:

```sql
SELECT * FROM categories ORDER BY sort_order;
```

4. You should see 7 rows with emojis (🍔, 🚗, 🛍️, etc.)

**If everything looks good, move to next step.**

---

### Step 6: Set Up Storage Bucket (For Receipt Images)

1. In left sidebar, click **"Storage"**
2. Click **"Create a new bucket"** button
3. Fill in:

| Field | Value |
|-------|-------|
| **Name** | `receipts` |
| **Public bucket** | **OFF** (unchecked) — receipts are private |
| **File size limit** | 10 MB |
| **Allowed MIME types** | `image/jpeg, image/png, image/heic` |

4. Click **"Create bucket"**

**Screenshot description:** You should now see a bucket called "receipts" in the Storage page.

---

### Step 7: Set Storage Policies (Security)

Now we need to allow users to upload/view ONLY their own receipts.

1. Click on the **"receipts"** bucket you just created
2. Click **"Policies"** tab at the top
3. Click **"New Policy"** button
4. Select **"For full customization"** (not a template)
5. Create first policy:

**Policy 1: Upload Own Receipts**

| Field | Value |
|-------|-------|
| **Policy name** | `Users can upload own receipts` |
| **Allowed operation** | `INSERT` |
| **Target roles** | `authenticated` |
| **USING expression** | Leave empty |
| **WITH CHECK expression** | Copy this: |

```sql
bucket_id = 'receipts' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

6. Click **"Review"** then **"Save policy"**

7. Now create second policy by clicking **"New Policy"** again:

**Policy 2: View Own Receipts**

| Field | Value |
|-------|-------|
| **Policy name** | `Users can view own receipts` |
| **Allowed operation** | `SELECT` |
| **Target roles** | `authenticated` |
| **USING expression** | Copy this: |

```sql
bucket_id = 'receipts' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

| **WITH CHECK expression** | Leave empty |

8. Click **"Review"** then **"Save policy"**

**What this does:** Users can only upload images to their own folder (named by their user ID), and can only view images in their own folder. Other users can't see their receipts.

---

### Step 8: Enable Authentication Providers

1. In left sidebar, click **"Authentication"**
2. Click **"Providers"** in the sub-menu
3. You should see a list of auth providers

**Email (Already enabled by default)**
- Confirm it says "Enabled" — no action needed

**Google OAuth (Required for "Sign in with Google")**

This is more complex. Follow carefully:

#### 8a. Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Sign in with your Google account
3. Click **"Select a project"** dropdown at top
4. Click **"New Project"**
5. Name it: `tulung-app`
6. Click **"Create"**
7. Wait for project to be created (30 seconds)

#### 8b. Enable Google+ API

1. In the search bar at top, type: `Google+ API`
2. Click on **"Google+ API"** result
3. Click **"Enable"** button
4. Wait for it to enable (10 seconds)

#### 8c. Create OAuth Consent Screen

1. In left sidebar, click **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the form:

| Field | Value |
|-------|-------|
| **App name** | Tulung |
| **User support email** | Your email |
| **App logo** | Skip for now |
| **Application home page** | Leave blank for now |
| **Authorized domains** | Leave blank |
| **Developer contact email** | Your email |

5. Click **"Save and Continue"**
6. On "Scopes" page, click **"Save and Continue"** (no changes)
7. On "Test users" page, click **"Save and Continue"** (no changes)
8. Review and click **"Back to Dashboard"**

#### 8d. Create OAuth Credentials

1. In left sidebar, click **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Name it: `tulung-supabase`
5. Under **"Authorized redirect URIs"**, click **"Add URI"**
6. Go back to your Supabase dashboard → Authentication → Providers → Google
7. Copy the **"Callback URL (for OAuth)"** (looks like `https://yourproject.supabase.co/auth/v1/callback`)
8. Paste it into Google Cloud Console as a redirect URI
9. Click **"Create"**
10. You'll see a popup with **Client ID** and **Client Secret** — COPY BOTH

#### 8e. Add Credentials to Supabase

1. Go back to Supabase → Authentication → Providers → Google
2. Toggle **"Enable Sign in with Google"** to ON
3. Paste your **Client ID** and **Client Secret** from Google
4. Click **"Save"**

**Test it:**
- Supabase should now show Google as "Enabled"
- You'll test the actual sign-in flow in Phase 1

---

### Step 9: Create `.env` File Template

Create a text file on your desktop called `tulung-env-template.txt` and paste this:

```bash
# ============================================
# TULUNG ENVIRONMENT VARIABLES
# Copy these to .env in your project root
# ============================================

# Supabase Configuration
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI API
OPENAI_API_KEY=sk-proj-...

# RevenueCat
REVENUECAT_PUBLIC_API_KEY=...

# App Configuration
APP_NAME=Tulung
APP_VERSION=1.0.0
ENVIRONMENT=development
```

Replace the `...` with your actual keys as you get them.

---

## 0.2 OpenAI API Setup (Detailed)

### Step 1: Create OpenAI Account

1. Go to https://platform.openai.com
2. Click **"Sign Up"** (top-right)
3. Sign up with:
   - **Google** (easiest) OR
   - **Email + password**
4. Verify your email
5. You'll be prompted to enter your name and phone number (required)

---

### Step 2: Add Payment Method

**CRITICAL:** OpenAI requires a credit card. No credit card = no API access.

1. Once logged in, click your profile icon (top-right)
2. Click **"Billing"**
3. Click **"Payment methods"**
4. Click **"Add payment method"**
5. Enter credit card details
6. Click **"Add"**

**Billing setup:**
- OpenAI charges per API call (pay-as-you-go)
- GPT-4o mini costs ~$0.01 per receipt scan
- For 1000 scans/month = ~$10
- They'll charge your card monthly

---

### Step 3: Set Spending Limits (Recommended)

Prevent surprise bills:

1. Still in **Billing** section
2. Click **"Limits"** in sidebar
3. Set these:

| Limit Type | Recommended Value |
|------------|------------------|
| **Hard limit** | $50/month |
| **Soft limit** | $25/month (you'll get email at this point) |

4. Click **"Save"**

---

### Step 4: Create API Key

1. In left sidebar, click **"API keys"**
2. Click **"Create new secret key"** (green button)
3. Name it: `tulung-production`
4. Permissions: Leave as **"All"** (default)
5. Click **"Create secret key"**
6. **CRITICAL:** Copy the key NOW (starts with `sk-proj-...`)
   - You'll NEVER see it again after closing this window
7. Paste it into your `tulung-env-template.txt` file

**Your key looks like:**
```
sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz...
```

---

### Step 5: Verify API Access (Optional)

Let's test that your API key works:

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Run this command (replace `YOUR_API_KEY` with your actual key):

**Mac/Linux:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Windows (PowerShell):**
```powershell
curl https://api.openai.com/v1/models `
  -H "Authorization: Bearer YOUR_API_KEY"
```

3. You should get a JSON response listing available models
4. If you get an error like `Invalid API key` → Your key is wrong, create a new one

---

## 0.3 Google Play Console Setup (Detailed)

### Step 1: Create Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Click **"Create Developer Account"**
4. Choose account type:
   - **Personal** (if it's just you)
   - **Organization** (if you have a company)
5. Fill in your details:
   - Name
   - Email
   - Country
6. Agree to terms
7. Pay **$25 registration fee** (one-time, non-refundable)
   - Uses Google Pay or credit card
8. Wait 1-2 days for account verification (Google reviews all new accounts)

**You'll get an email when approved.** Continue to next steps after approval.

---

### Step 2: Create App in Play Console

Once your account is verified:

1. Go back to https://play.google.com/console
2. Click **"Create app"** button
3. Fill in:

| Field | Value |
|-------|-------|
| **App name** | Tulung |
| **Default language** | English (United States) |
| **App or game** | App |
| **Free or paid** | Free |
| **Declarations** | Check all boxes (confirm you comply) |

4. Click **"Create app"**

**You should now see the app dashboard.** Don't submit anything yet — we'll come back here in Phase 6.

---

### Step 3: Create Subscription Product

We need to create the $2.99/month Pro subscription:

1. In left sidebar, go to **"Monetize"** → **"Products"** → **"Subscriptions"**
2. Click **"Create subscription"** button
3. Fill in:

| Field | Value |
|-------|-------|
| **Product ID** | `pro_monthly` (MUST match exactly — RevenueCat uses this) |
| **Name** | Tulung Pro |
| **Description** | Unlimited receipt scans, priority support, and early access to features |

4. Click **"Create"**

5. Now add a **Base plan**:
   - Click **"Add base plan"**
   - **Base plan ID:** `monthly`
   - **Billing period:** 1 month
   - **Price:** $2.99 USD
   - **Free trial:** None (for MLP)
   - **Grace period:** 3 days (recommended)
6. Click **"Activate"** (top-right)

**Important:** The product is now created but not live. You can test it without activating.

---

## 0.4 RevenueCat Setup (Detailed)

### Step 1: Create RevenueCat Account

1. Go to https://www.revenuecat.com
2. Click **"Get started free"**
3. Sign up with:
   - **Email + password** OR
   - **GitHub** (if you used GitHub for Supabase, use same account)
4. Verify email

---

### Step 2: Create Project

1. Once logged in, click **"Create new project"**
2. Name it: `Tulung`
3. Click **"Create"**

---

### Step 3: Add Android App

1. Click **"Add app"** button
2. Choose **"Android"**
3. Fill in:

| Field | Value |
|-------|-------|
| **App name** | Tulung Android |
| **Bundle ID** | `com.yourname.tulung` (you'll use this in React Native) |

4. Click **"Save"**

---

### Step 4: Connect to Google Play

1. You'll see **"Service Credentials Required"** warning
2. Click **"Configure"** next to Google Play Store
3. Follow RevenueCat's guide to create service credentials:

**This is complex, so follow step-by-step:**

#### 4a. Create Service Account in Google Cloud

1. Go back to https://console.cloud.google.com
2. Select your `tulung-app` project (same one from OAuth setup)
3. In search bar, type: `Service Accounts`
4. Click on **"Service Accounts"**
5. Click **"Create Service Account"**
6. Name: `play-console-service-account`
7. Click **"Create and Continue"**
8. For role, select: **"Service Account User"**
9. Click **"Continue"** then **"Done"**

#### 4b. Create JSON Key

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **"JSON"**
5. Click **"Create"**
6. A JSON file will download — SAVE IT (you'll upload to RevenueCat)

#### 4c. Grant Access in Play Console

1. Go to https://play.google.com/console
2. Go to **"Users and permissions"** in left sidebar
3. Click **"Invite new users"**
4. Paste the **email address** from the service account (looks like `play-console-service-account@tulung-app.iam.gserviceaccount.com`)
5. Under **"App permissions"**, click **"Add app"**
6. Select **Tulung**
7. Grant these permissions:
   - View app information and download bulk reports (read-only)
   - View financial data, orders, and cancellation survey responses
   - Manage orders and subscriptions
8. Click **"Invite user"**

#### 4d. Upload to RevenueCat

1. Go back to RevenueCat dashboard
2. In the Google Play Store configuration
3. Click **"Upload Google Service Account JSON"**
4. Upload the JSON file you downloaded
5. Click **"Save"**

**You should see "Connected" status now.**

---

### Step 5: Create Product in RevenueCat

1. In RevenueCat, go to **"Products"** (left sidebar)
2. Click **"Add product"**
3. Fill in:

| Field | Value |
|-------|-------|
| **Identifier** | `pro_monthly` (MUST match Google Play product ID exactly) |
| **Type** | Subscription |
| **Store Product ID (Google Play)** | `pro_monthly` |

4. Click **"Save"**

---

### Step 6: Create Entitlement

Entitlements define what Pro users get:

1. Go to **"Entitlements"** in left sidebar
2. Click **"Create entitlement"**
3. Name: `pro`
4. Click **"Save"**
5. Click on the `pro` entitlement
6. Click **"Attach products"**
7. Select `pro_monthly`
8. Click **"Attach"**

---

### Step 7: Get SDK Keys

1. In RevenueCat, go to **"API Keys"** (left sidebar)
2. You'll see different keys for iOS and Android
3. Copy the **"Public app-specific API key"** for Android
4. Save it as `REVENUECAT_PUBLIC_API_KEY` in your `tulung-env-template.txt`

**Your key looks like:**
```
appl_abc123XYZ456def789
```

---

## 0.5 Final Checklist & Verification

### Credentials Checklist

Open your `tulung-env-template.txt` file. You should have ALL of these filled in:

```bash
# Should look like this (with your actual values):
SUPABASE_URL=https://abcdefghijklmnop.supabase.co ✅
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI... ✅
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI... ✅
OPENAI_API_KEY=sk-proj-abc123def456... ✅
REVENUECAT_PUBLIC_API_KEY=appl_abc123XYZ... ✅
```

**If any are missing, go back and complete that section.**

---

### Services Checklist

Verify each service is properly set up:

#### Supabase
- [ ] Project created and running
- [ ] Database tables exist (run `SELECT * FROM users;` in SQL Editor — should work even if empty)
- [ ] Storage bucket `receipts` exists
- [ ] Storage policies created (check Storage → receipts → Policies, should see 2 policies)
- [ ] Google OAuth enabled (Authentication → Providers → Google shows "Enabled")
- [ ] API keys saved

#### OpenAI
- [ ] Account created
- [ ] Billing set up (credit card added)
- [ ] Spending limits configured ($50 hard limit, $25 soft limit)
- [ ] API key created and saved
- [ ] API key tested (optional but recommended)

#### Google Play Console
- [ ] Developer account approved ($25 paid)
- [ ] App "Tulung" created
- [ ] Subscription product `pro_monthly` created ($2.99/month)
- [ ] Product activated

#### RevenueCat
- [ ] Account created
- [ ] Project "Tulung" created
- [ ] Android app added
- [ ] Connected to Google Play (service credentials uploaded)
- [ ] Product `pro_monthly` created and linked
- [ ] Entitlement `pro` created
- [ ] SDK key saved

---

### Test Connections (Optional but Recommended)

Let's verify everything is connected:

#### Test 1: Supabase Database

1. Go to Supabase SQL Editor
2. Run:
```sql
INSERT INTO categories (name, icon, sort_order) 
VALUES ('Test Category', '🧪', 99);

SELECT * FROM categories WHERE name = 'Test Category';
```
3. You should see your test row
4. Delete it:
```sql
DELETE FROM categories WHERE name = 'Test Category';
```

**Result:** If this works, your database is set up correctly.

---

#### Test 2: Supabase Storage

1. Go to Supabase → Storage → receipts
2. Try to upload a test image (any image from your computer)
3. You'll get an error: **"new row violates row-level security policy"**
4. **This is CORRECT** — it means your security policies are working
5. You won't be able to upload until you're authenticated in the app

---

#### Test 3: OpenAI API

Run this in Terminal/Command Prompt (replace YOUR_KEY):

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Say test"}],
    "max_tokens": 5
  }'
```

**Expected response:** JSON with "test" in it.

**If you get an error:** Check your API key, check billing is set up.

---

## 0.6 Organize Your Credentials

Create a secure file structure:

```
Desktop/
  tulung-credentials/
    - supabase-keys.txt (URL, anon key, service key)
    - openai-key.txt (API key)
    - revenuecat-key.txt (Public API key)
    - google-service-account.json (service account key)
    - env-template.txt (all keys combined)
```

**Security:**
- Keep this folder PRIVATE
- DO NOT commit to GitHub
- Back up to secure location (1Password, Bitwarden, encrypted drive)

---

## 0.7 Common Issues & Troubleshooting

### Issue: Supabase SQL queries fail

**Symptom:** Errors like "permission denied" or "relation does not exist"

**Fix:**
1. Make sure you're in the correct project (check project name at top)
2. Try running `SELECT * FROM users;` — if this fails, your tables weren't created
3. Re-run the full database schema script from Step 4

---

### Issue: Google OAuth not working

**Symptom:** "Redirect URI mismatch" error when testing sign-in

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Make sure the Supabase callback URL is EXACTLY as shown in Supabase
4. No extra slashes, no typos
5. Save and wait 5 minutes for Google to propagate changes

---

### Issue: OpenAI API returns 429 error

**Symptom:** "Rate limit exceeded"

**Fix:**
1. You're using free tier which has strict limits
2. Add a payment method to increase limits
3. Wait a few minutes and try again

---

### Issue: RevenueCat says "Invalid credentials"

**Symptom:** Can't connect to Google Play

**Fix:**
1. Make sure service account email was invited in Play Console
2. Check service account has ALL permissions (view financial data, manage orders)
3. Try re-uploading the JSON file
4. Wait 10-15 minutes for permissions to propagate

---

### Issue: Can't create Google Play subscription

**Symptom:** "App not eligible for subscriptions"

**Fix:**
1. Your app needs to be in "Closed Testing" track first
2. Go to Play Console → Testing → Closed testing
3. Create a test track (can skip for now)
4. OR: Create product anyway — it just won't be active until you publish

---

## 0.8 Cost Breakdown

Here's what you'll pay:

| Service | Setup Cost | Monthly Cost |
|---------|-----------|--------------|
| Supabase | $0 | $0 (free tier covers MLP) |
| OpenAI | $0 | $30-50 (usage-based) |
| Google Play | $25 one-time | $0 |
| RevenueCat | $0 | $0 (free until $10K MRR) |
| **Total** | **$25** | **$30-50** |

**After launch at 1000 scans/month:**
- OpenAI: ~$10 (OCR costs)
- Supabase: $0 (still on free tier)
- RevenueCat: $0 (still under $10K MRR)
- **Total: ~$10/month**

---

## Phase 0 Complete ✅

You're done when:

- [x] Supabase project running with all tables and policies
- [x] Supabase storage bucket created with security policies
- [x] Google OAuth enabled in Supabase
- [x] OpenAI API key created with billing active
- [x] Google Play Console account approved
- [x] Google Play subscription product created
- [x] RevenueCat account created and connected to Google Play
- [x] All API keys saved in `tulung-env-template.txt`

**Estimated time:** 2-4 hours if you've never done this before, 1-2 hours if you have.

**Next step:** Move to Phase 1 (React Native project setup)

---

## Quick Reference: Where to Find Everything

| What you need | Where to find it |
|--------------|------------------|
| Supabase dashboard | https://supabase.com/dashboard |
| Supabase SQL editor | Dashboard → SQL Editor |
| OpenAI dashboard | https://platform.openai.com |
| Google Play Console | https://play.google.com/console |
| RevenueCat dashboard | https://app.revenuecat.com |
| Google Cloud Console | https://console.cloud.google.com |

**Bookmark these URLs — you'll use them throughout development.**

---

**NOW YOU'RE READY TO CODE.** 🚀
