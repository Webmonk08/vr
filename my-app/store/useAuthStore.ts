import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchRole: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      role: null,
      fetchRole: async (userId) => {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        if (data) {
          set({ role: data.role });
          console.log('user role', data.role)
        } else if (error) {
          console.error("Error fetching role:", error);
        }
      },
      login: async (email, password) => {
        console.log("Request recieved")
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,

        });
        if (error) {
          console.log("HI")
          throw error
        };
        set({ user: data.user, session: data.session });
        if (data.user) {
          await get().fetchRole(data.user.id);
        }
      },
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        set({ user: data.user, session: data.session });
        if (data.user) {
          await get().fetchRole(data.user.id);
        }
      },
      logout: () => {
        supabase.auth.signOut();
        set({ user: null, session: null, role: null });
      },
    }),
    { name: "auth-storage" }
  )
);
