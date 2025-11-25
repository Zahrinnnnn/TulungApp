// Database types matching Supabase schema

export interface User {
  id: string;
  email: string;
  created_at: string;
  daily_budget: number;
  currency: string;
  timezone: string;
  last_snap_date: string | null;
  streak_count: number;
  is_pro: boolean;
  pro_expires_at: string | null;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  category: string;
  merchant: string | null;
  note: string | null;
  receipt_url: string | null;
  logged_at: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
}

export interface ScanQuota {
  user_id: string;
  scans_this_month: number;
  reset_date: string;
  updated_at: string;
}

// Input types for creating/updating
export interface ExpenseInput {
  amount: number;
  currency: string;
  category: string;
  merchant?: string;
  note?: string;
  receipt_url?: string;
}

export interface UserProfileUpdate {
  daily_budget?: number;
  currency?: string;
  timezone?: string;
}

// OCR result from OpenAI
export interface ReceiptData {
  amount: number;
  currency: string;
  merchant: string;
  category: string;
}
