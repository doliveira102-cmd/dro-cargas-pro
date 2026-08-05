const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";

function getTokens() {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("dro_access_token"),
    refreshToken: localStorage.getItem("dro_refresh_token"),
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("dro_access_token", accessToken);
  localStorage.setItem("dro_refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("dro_access_token");
  localStorage.removeItem("dro_refresh_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const { accessToken } = getTokens();

  const doFetch = async (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

  let res = await doFetch(accessToken);

  // Access token expirado — tenta renovar uma vez e repete a chamada
  if (res.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) res = await doFetch(newToken);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new Error(message || `Erro ${res.status}`);
  }

  if (res.status === 200 || res.status === 201) {
    return res.json().catch(() => null);
  }
  return null;
}

// ---- Tipos ----
export type CargaStatus = "DISPONIVEL" | "EM_TRANSITO" | "ENCERRADA" | "SUSPENSA" | "CANCELADA";

export interface Carga {
  id: string;
  codigo: string;
  origemCidade: string;
  origemUf: string;
  destinoCidade: string;
  destinoUf: string;
  produto: string;
  valor: number;
  status: CargaStatus;
  criadoEm: string;
  cliente?: { razaoSocial: string } | null;
  motorista?: { nome: string } | null;
}

export interface Motorista {
  id: string;
  nome: string;
  cnh: string;
  cnhCategoria: string;
  telefone?: string;
  disponivel: boolean;
  avaliacaoMedia: number;
}

export interface Cliente {
  id: string;
  razaoSocial: string;
  cnpjCpf: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
}

export interface ResumoFinanceiro {
  receitas: number;
  despesas: number;
  comissoes: number;
  lucro: number;
}
