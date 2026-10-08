import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '@/services/api';
import { storage, STORAGE_KEYS } from '@/services/storage';

const AuthContext = createContext(null);

/**
 * JWT-based auth. The token is kept in localStorage and the cached user is
 * refreshed from /auth/me on load, so role or profile changes apply immediately.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (storage.get(STORAGE_KEYS.token) ? storage.get(STORAGE_KEYS.user) : null));

  const persistUser = useCallback((nextUser) => {
    storage.set(STORAGE_KEYS.user, nextUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const persistSession = useCallback(
    ({ user: nextUser, token }) => {
      storage.set(STORAGE_KEYS.token, token);
      return persistUser(nextUser);
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.user);
    storage.remove(STORAGE_KEYS.token);
    setUser(null);
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(logout);
    if (storage.get(STORAGE_KEYS.token)) {
      api.getMe().then(persistUser).catch((e) => e.status === 401 && logout());
    }
  }, [logout, persistUser]);

  const login = useCallback(async (credentials) => persistSession(await api.login(credentials)), [persistSession]);
  const register = useCallback(async (payload) => persistSession(await api.register(payload)), [persistSession]);
  const resetPassword = useCallback(async (token, password) => persistSession(await api.resetPassword(token, password)), [persistSession]);
  const updateProfile = useCallback(async (data) => persistUser(await api.updateProfile(data)), [persistUser]);
  const uploadAvatar = useCallback(async (file) => persistUser(await api.uploadAvatar(file)), [persistUser]);
  const refreshUser = useCallback(async () => persistUser(await api.getMe()), [persistUser]);
  const isAuthenticated = useCallback(() => Boolean(user), [user]);

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      resetPassword,
      updateProfile,
      uploadAvatar,
      refreshUser,
      isAuthenticated,
    }),
    [user, login, register, logout, resetPassword, updateProfile, uploadAvatar, refreshUser, isAuthenticated],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
