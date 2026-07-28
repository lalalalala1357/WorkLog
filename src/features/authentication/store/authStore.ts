import { create } from "zustand";
import type { User } from "oidc-client-ts";

interface AuthState
{
    user: User | null;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (user) => set({user}),
}));