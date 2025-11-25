import { create } from 'zustand';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { User } from '../types';
import { DEFAULT_DAILY_BUDGET, DEFAULT_CURRENCY, DEFAULT_TIMEZONE } from '../constants/defaults';

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  userProfile: User | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: SupabaseUser | null) => void;
  setSession: (session: Session | null) => void;
  setUserProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, userProfile: null });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchUserProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // User doesn't exist yet, create profile
        if (error.code === 'PGRST116') {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              daily_budget: DEFAULT_DAILY_BUDGET,
              currency: DEFAULT_CURRENCY,
              timezone: DEFAULT_TIMEZONE,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
          } else {
            set({ userProfile: newUser as User });
          }
        } else {
          console.error('Error fetching user profile:', error);
        }
      } else {
        set({ userProfile: data as User });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  },
}));

// Initialize auth listener
export const initializeAuth = () => {
  const { setUser, setSession, setLoading, setInitialized, fetchUserProfile } =
    useAuthStore.getState();

  // Check current session
  supabase.auth.getSession()
    .then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile();
      }
      setLoading(false);
      setInitialized(true);
    })
    .catch((error) => {
      console.error('Failed to get session:', error);
      setLoading(false);
      setInitialized(true);
    });

  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    setSession(session);
    setUser(session?.user ?? null);

    if (event === 'SIGNED_IN' && session?.user) {
      await fetchUserProfile();
    }

    if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ userProfile: null });
    }

    setLoading(false);
  });

  return () => {
    subscription.unsubscribe();
  };
};
