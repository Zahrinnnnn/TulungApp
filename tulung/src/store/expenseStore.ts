import { create } from 'zustand';
import { Expense } from '../types/database';
import { supabase } from '../services/supabase';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchExpenses: (userId: string) => Promise<void>;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => Promise<void>;
  clearExpenses: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false });

      if (error) {
        throw error;
      }

      set({ expenses: data || [], loading: false });
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      set({ error: error.message, loading: false });
    }
  },

  addExpense: (expense: Expense) => {
    set((state) => ({
      expenses: [expense, ...state.expenses],
    }));
  },

  updateExpense: (id: string, updates: Partial<Expense>) => {
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      ),
    }));
  },

  deleteExpense: async (id: string) => {
    try {
      // Get expense to check for receipt URL
      const expense = get().expenses.find((e) => e.id === id);

      // If expense has receipt, delete from storage first
      if (expense?.receipt_url) {
        try {
          // Extract file path from signed URL or public URL
          const urlMatch = expense.receipt_url.match(/receipts\/(.+?)(\?|$)/);
          if (urlMatch) {
            const filePath = urlMatch[1];
            const { error: storageError } = await supabase.storage
              .from('receipts')
              .remove([filePath]);

            if (storageError) {
              console.warn('Failed to delete receipt image:', storageError);
              // Don't throw - continue with expense deletion
            }
          }
        } catch (storageError) {
          console.warn('Error deleting receipt:', storageError);
          // Don't throw - continue with expense deletion
        }
      }

      // Delete expense from database
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) {
        throw error;
      }

      set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
      }));
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      set({ error: error.message });
      throw error;
    }
  },

  clearExpenses: () => {
    set({ expenses: [], error: null });
  },
}));
