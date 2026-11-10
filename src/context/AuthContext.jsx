import { useState, useCallback } from "react";
import * as authClient from "../utils/authClient";
import { AuthContext } from "./authContextInstance";

const STORAGE_KEY = "flowarchitect:auth";

function loadSaved() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    const { token, user } = JSON.parse(raw);
    return { token: token || null, user: user || null };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  // Lazy initializer reads localStorage once, synchronously, on first
  // render — no effect needed just to hydrate state from storage.
  const [{ token, user }, setAuth] = useState(loadSaved);

  const persist = useCallback((nextToken, nextUser) => {
    setAuth({ token: nextToken, user: nextUser });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }, []);

  const login = useCallback(
    async (creds) => {
      return authClient.login(creds);
    },
    []
  );

  const verifyOtp = useCallback(
    async (details) => {
      const data = await authClient.verifyOtp(details);
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const resendOtp = useCallback((details) => authClient.resendOtp(details), []);

  const register = useCallback(
    async (details) => {
      const data = await authClient.register(details);
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    setAuth({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading: false, login, register, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
