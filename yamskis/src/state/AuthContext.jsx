import { createContext, useEffect, useMemo, useState } from 'react';

import { apiMe, setAuthTokenHeader } from '../api/client.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    setAuthTokenHeader();
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    async function restoreUser() {
      if (!token) return;

      try {
        setAuthTokenHeader();
        const data = await apiMe();
        if (data?.user) setUser(data.user);
      } catch {
        setToken(null);
        setUser(null);
      }
    }

    restoreUser();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: ({ token: t, user: u }) => {
        setToken(t);
        setUser(u);
        if (t) localStorage.setItem('token', t);
        setAuthTokenHeader();
      },
      logout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        setAuthTokenHeader();
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

