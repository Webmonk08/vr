import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.log("HI")
          throw error
        };
        set({ user: data.user, session: data.session });
      },
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        set({ user: data.user, session: data.session });
      },
      logout: () => {
        supabase.auth.signOut();
        set({ user: null, session: null });
      },
    }),
    { name: "auth-storage" }
  )
);
