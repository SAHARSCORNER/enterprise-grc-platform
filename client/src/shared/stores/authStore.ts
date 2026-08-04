import { create } from 'zustand';
import { User, UserRole, AuthTokens } from '@grc/shared';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (role: UserRole, action: string) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: {
    id: 'usr-admin-1',
    email: 'admin@enterprise.grc',
    name: 'System Administrator',
    role: UserRole.ADMINISTRATOR,
    department: 'IT Operations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  tokens: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 86400,
  },
  isAuthenticated: true,

  login: (user, tokens) => set({ user, tokens, isAuthenticated: true }),

  logout: () => set({ user: null, tokens: null, isAuthenticated: false }),

  switchRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),

  hasPermission: (requiredRole, action) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === UserRole.ADMINISTRATOR) return true;
    return user.role === requiredRole;
  },
}));
