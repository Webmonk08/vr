import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, ApiException } from "@/lib/api-client";
import { toast } from "@/store/useToastStore";

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
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchRole: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      role: null,
      isLoading: false,
      error: null,
      clearError: () => set({ error: null }),
      fetchRole: async (userId) => {
        try {
          const data = await apiClient.get<{ role: string }>(`/api/auth/role?userId=${userId}`);
          const userRole = data.role || "customer";
          set({ role: userRole });
        } catch (error) {
          console.error("Error fetching role:", error);
          if (error instanceof ApiException) {
            toast.error(error.getUserMessage());
          }
        }
      },
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.post<{ user: User; session: Session }>('/api/auth/login', { email, password });
          set({ user: data.user, session: data.session, isLoading: false });
          toast.success('Login successful!');
          if (data.user) {
            await get().fetchRole(data.user.id);
          }
        } catch (error) {
          set({ isLoading: false });
          if (error instanceof ApiException) {
            const message = error.getUserMessage();
            set({ error: message });
            toast.error(message);
          } else {
            const message = 'Login failed. Please try again.';
            set({ error: message });
            toast.error(message);
          }
          throw error;
        }
      },
      signUp: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiClient.post<{ user: User; session: Session }>('/api/auth/signup', { email, password });
          set({ user: data.user, session: data.session, isLoading: false });
          toast.success('Account created successfully!');
          if (data.user) {
            await get().fetchRole(data.user.id);
          }
        } catch (error) {
          set({ isLoading: false });
          if (error instanceof ApiException) {
            const message = error.getUserMessage();
            set({ error: message });
            toast.error(message);
          } else {
            const message = 'Signup failed. Please try again.';
            set({ error: message });
            toast.error(message);
          }
          throw error;
        }
      },
      logout: async () => {
        const { session } = get();
        try {
          if (session) {
            await apiClient.post('/api/auth/logout', null, {
              headers: { Authorization: session.access_token },
            });
          }
        } catch (error) {
          console.error("Logout error:", error);
        }
        set({ user: null, session: null, role: null });
        toast.info('Logged out successfully');
      },
    }),
    { name: "auth-storage" }
  )
);
