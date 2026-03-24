import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchRole: (userId: string) => Promise<void>;
}

const BACKEND_URL = "http://localhost:8080";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      role: null,
      fetchRole: async (userId) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/role?userId=${userId}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to fetch role");
          const userRole = data.role || "customer";
          set({ role: userRole });
          console.log('user role', userRole);
        } catch (error: any) {
          console.error("Error fetching role:", error);
        }
      },
      login: async (email, password) => {
        console.log("Request recieved");
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "Login failed");
        }
        set({ user: data.user, session: data.session });
        if (data.user) {
          await get().fetchRole(data.user.id);
        }
      },
      signUp: async (email, password) => {
        const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        console.log("data" , data)
        if (!res.ok) throw new Error(data.message || data.error || "Signup failed");
        set({ user: data.user, session: data.session });
        if (data.user) {
          await get().fetchRole(data.user.id);
        }
      },
      logout: async () => {
        const { session } = get();
        if (session) {
          await fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
              "Authorization": session.access_token,
            },
          });
        }
        set({ user: null, session: null, role: null });
      },
    }),
    { name: "auth-storage" }
  )
);
