import { create } from 'zustand';
import { Property, User } from '../types/models';
import { authApi, portfolioApi, propertiesApi } from '../api/endpoints';
import { setAuthToken } from '../api/client';
import { clearToken, loadToken, saveToken } from '../api/storage';
import { ApiError } from '../api/errors';
import type { CreatePropertyDto, PortfolioSummary } from '../api/types';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  authEpoch: number;
  isHydrating: boolean;

  // Domain
  properties: Property[];
  portfolioSummary: PortfolioSummary | null;

  // UI
  isLoading: boolean;
  error: string | null;

  // Preferences
  language: 'en' | 'ar';
  themeMode: 'light' | 'dark';

  // Actions
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProperties: () => Promise<void>;
  fetchPortfolioSummary: () => Promise<void>;
  addProperty: (dto: CreatePropertyDto) => Promise<Property>;
  markInstallmentPaid: (propertyId: string, installmentId: string) => Promise<void>;
  setLanguage: (lang: 'en' | 'ar') => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  clearError: () => void;
}

const INITIAL_AUTH = {
  isAuthenticated: false,
  user: null as User | null,
  token: null as string | null,
  properties: [] as Property[],
  portfolioSummary: null as PortfolioSummary | null,
};

function toErrorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export const useAppStore = create<AppState>((set, get) => ({
  ...INITIAL_AUTH,
  authEpoch: 0,
  isHydrating: true,
  isLoading: false,
  error: null,
  language: 'en',
  themeMode: 'light',

  hydrate: async () => {
    try {
      const stored = await loadToken();
      if (stored) {
        setAuthToken(stored);
        set({ token: stored, isAuthenticated: true });
        // Best-effort property prefetch — failure here shouldn't block boot.
        try {
          await get().fetchProperties();
        } catch {
          // Leave properties empty; the list screen will surface the error.
        }
      }
    } finally {
      set({ isHydrating: false });
    }
  },

  login: async (email, password) => {
    const epoch = get().authEpoch + 1;
    set({ authEpoch: epoch, isLoading: true, error: null });

    // Phase 1: authenticate. Only failures here should revoke auth.
    let token: string;
    let user: User;
    try {
      const res = await authApi.login(email, password);
      token = res.token;
      user = res.user;
    } catch (e) {
      if (get().authEpoch === epoch) {
        set({ error: toErrorMessage(e), isAuthenticated: false, isLoading: false });
      }
      throw e;
    }

    setAuthToken(token);
    await saveToken(token);
    if (get().authEpoch !== epoch) return; // superseded (logout raced in)
    set({ token, user, isAuthenticated: true });

    // Phase 2: best-effort prefetch. Failure surfaces via `error` but does
    // NOT flip `isAuthenticated` back — the user is already logged in.
    try {
      await get().fetchProperties();
    } catch {
      // fetchProperties already set `error`; PropertiesScreen will render it.
    } finally {
      if (get().authEpoch === epoch) set({ isLoading: false });
    }
  },

  logout: async () => {
    const epoch = get().authEpoch + 1;
    set({ authEpoch: epoch });
    try {
      await authApi.logout();
    } catch {
      // logout is stateless / best-effort
    }
    await clearToken();
    setAuthToken(null);
    set({ ...INITIAL_AUTH, error: null });
  },

  fetchProperties: async () => {
    const epoch = get().authEpoch;
    set({ isLoading: true, error: null });
    try {
      const properties = await propertiesApi.list();
      if (get().authEpoch !== epoch) return;
      set({ properties });
    } catch (e) {
      if (get().authEpoch !== epoch) return;
      set({ error: toErrorMessage(e) });
      throw e;
    } finally {
      if (get().authEpoch === epoch) {
        set({ isLoading: false });
      }
    }
  },

  fetchPortfolioSummary: async () => {
    const epoch = get().authEpoch;
    try {
      const summary = await portfolioApi.summary();
      if (get().authEpoch !== epoch) return;
      set({ portfolioSummary: summary });
    } catch (e) {
      if (get().authEpoch !== epoch) return;
      set({ error: toErrorMessage(e) });
    }
  },

  addProperty: async (dto) => {
    set({ error: null });
    try {
      const created = await propertiesApi.create(dto);
      set((state) => ({ properties: [...state.properties, created] }));
      // Refresh summary so the totals card stays accurate.
      get().fetchPortfolioSummary();
      return created;
    } catch (e) {
      set({ error: toErrorMessage(e) });
      throw e;
    }
  },

  markInstallmentPaid: async (propertyId, installmentId) => {
    set({ error: null });
    try {
      const updated = await propertiesApi.markInstallmentPaid(propertyId, installmentId);
      // Merge into the cached property rather than replace. If the server
      // response is ever partial (missing installments/name/etc.), the
      // cached fields survive and the card doesn't go blank.
      set((state) => ({
        properties: state.properties.map((p) =>
          p.id === propertyId ? { ...p, ...updated } : p
        ),
      }));
      // Self-heal: refetch aggregates + full list in the background so any
      // denormalized fields (nextDue*, paidAmount, installments) converge
      // with the server regardless of what PATCH returned.
      get().fetchPortfolioSummary();
      get().fetchProperties().catch(() => {
        // swallow — cached data is still usable
      });
    } catch (e) {
      set({ error: toErrorMessage(e) });
      throw e;
    }
  },

  setLanguage: (lang) => set({ language: lang }),
  setThemeMode: (mode) => set({ themeMode: mode }),
  clearError: () => set({ error: null }),
}));
