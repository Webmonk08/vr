
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import { updateUser, changePassword } from "@/services/user.service";

interface AuthState {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: { name?: string; address?: string; phone?: string }) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,

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
      },

      signUp: async (email, password, role = 'customer') => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role
            }
          }
        });
        if (error) throw error;
        set({ user: data.user, session: data.session });
      },

      logout: () => {
        supabase.auth.signOut();
        set({ user: null, session: null });
      },

      updateUser: async (data) => {
        const updatedUser = await updateUser(data);
        set({ user: updatedUser.user });
      },

      changePassword: async (password: string) => {
        await changePassword(password);
      }
    }),
    { name: "auth-storage" }
  )
);

