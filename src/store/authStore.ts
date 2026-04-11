import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  phone: string;
  city?: string | null;
  leadId?: string | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (payload: { user: User; token: string }) => void;
  setLeadId: (leadId: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setSession: ({ user, token }) => set({ user, token }),
  setLeadId: (leadId) =>
    set((state) => ({
      user: state.user ? { ...state.user, leadId } : state.user,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, token: null }),
}));
