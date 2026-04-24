import { createContext, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, login as loginRequest } from '../api/auth';
import {
  clearAuthToken,
  registerUnauthorizedHandler,
  setAuthToken,
} from '../api/client';

const STORAGE_KEY = 'smartseason_auth';

export const AuthContext = createContext(null);

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: null, user: null };
    }

    const parsed = JSON.parse(raw);

    return {
      token: parsed?.token || null,
      user: parsed?.user || null,
    };
  } catch (_error) {
    return { token: null, user: null };
  }
}

function persistAuth(token, user) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token,
      user,
    })
  );
}

function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const stored = readStoredAuth();
  const [token, setToken] = useState(stored.token);
  const [user, setUser] = useState(stored.user);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(stored.token));

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      persistAuth(token, user);
    } else {
      clearAuthToken();
      clearStoredAuth();
    }
  }, [token, user]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      clearStoredAuth();

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      if (!stored.token) {
        setIsBootstrapping(false);
        return;
      }

      setAuthToken(stored.token);

      try {
        const response = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(response.user);
        setToken(stored.token);
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setToken(null);
        setUser(null);
        clearStoredAuth();
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [stored.token]);

  async function login(credentials) {
    const response = await loginRequest(credentials);
    setToken(response.token);
    setUser(response.user);
    persistAuth(response.token, response.user);
    return response;
  }

  function logout() {
    setToken(null);
    setUser(null);
    clearStoredAuth();

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }

  function isAdmin() {
    return user?.role === 'admin';
  }

  function isAgent() {
    return user?.role === 'field_agent';
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login,
      logout,
      isAdmin,
      isAgent,
    }),
    [user, token, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
