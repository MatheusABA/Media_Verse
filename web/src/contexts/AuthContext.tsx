"use client"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  username: string
  email: string
  bio: string | null
  avatarUrl: string | null
}

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  isLoggedIn: boolean;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user")
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setInitialized(true);
  }, [])

  function login(accessToken: string, refreshToken: string, user: User) {
    setToken(accessToken);
    setUser(user);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
  }

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await logout();
      return null;
    }

    const data = await res.json();
    setToken(data.accessToken);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
  }

  async function fetchWithAuth(
    input: RequestInfo,
    init: RequestInit = {},
  ): Promise<Response> {
    const currentToken = localStorage.getItem("accessToken");
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string>),
      Authorization: `Bearer ${currentToken}`,
    };

    if (!(init.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(input, { ...init, headers });

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return res;

      const retryHeaders: Record<string, string> = {
        ...(init.headers as Record<string, string>),
        Authorization: `Bearer ${newToken}`,
      };
      if (!(init.body instanceof FormData)) {
        retryHeaders["Content-Type"] = "application/json";
      }

      return fetch(input, { ...init, headers: retryHeaders });
    }

    return res;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        fetchWithAuth,
        isLoggedIn: !!token,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)