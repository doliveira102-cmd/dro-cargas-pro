"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setTokens, clearTokens } from "./api";

interface User {
  id: string;
  nome: string;
  email: string;
  role: "ADMIN" | "OPERADOR" | "COMERCIAL" | "MOTORISTA" | "CLIENTE";
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("dro_access_token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch("/users/me")
      .then((data) => setUser(data))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, senha: string) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    setTokens(data.accessToken, data.refreshToken);
    const me = await apiFetch("/users/me");
    setUser(me);
    router.push("/dashboard");
  }

  function logout() {
    clearTokens();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
