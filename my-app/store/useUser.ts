
import { create } from "zustand";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";

interface UserState {
  user: User | null;
  role: string | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

export const useUser = create<UserState>((set) => ({
  user: null,
  role: null,
  loading: true,
  fetchUser: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { user } = session;
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (profile) {
          set({ user, role: profile.role, loading: false });
        } else {
          set({ user, role: null, loading: false });
        }
      } else {
        set({ user: null, role: null, loading: false });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ user: null, role: null, loading: false });
    }
  },
}));
