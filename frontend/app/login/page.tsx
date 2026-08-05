"use client";

import { useState } from "react";
import { Truck, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, senha);
    } catch (err: any) {
      setError(err.message || "Não foi possível entrar. Confira suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-amber flex items-center justify-center">
            <Truck size={20} className="text-ink" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-slate-900 dark:text-white leading-none">
              DRO Cargas
            </div>
            <div className="text-[10px] tracking-widest text-slate-400">PRO</div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl p-6 flex flex-col gap-4"
        >
          <h1 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
            Entrar
          </h1>

          {error && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber/50"
              placeholder="voce@empresa.com.br"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-amber text-ink font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
