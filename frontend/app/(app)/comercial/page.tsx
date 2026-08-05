"use client";

import { useEffect, useState } from "react";
import { Plus, X, Building2 } from "lucide-react";
import { apiFetch, Cliente } from "@/lib/api";

export default function ComercialPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  function carregar() {
    apiFetch("/comercial/clientes").then(setClientes).catch((e) => setErro(e.message));
  }

  useEffect(carregar, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl">Comercial · Clientes</h1>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-1.5 bg-amber text-ink text-sm font-semibold px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} /> Novo cliente
        </button>
      </div>

      {erro && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{erro}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((c) => (
          <div key={c.id} className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber/10 text-amber flex items-center justify-center">
                <Building2 size={15} />
              </div>
              <div className="font-semibold text-sm">{c.razaoSocial}</div>
            </div>
            <div className="text-xs text-slate-400">{c.cnpjCpf}</div>
            {(c.cidade || c.uf) && (
              <div className="text-xs text-slate-400">{c.cidade}{c.cidade && c.uf ? "/" : ""}{c.uf}</div>
            )}
          </div>
        ))}
        {clientes.length === 0 && !erro && (
          <p className="text-sm text-slate-400 col-span-full text-center py-8">Nenhum cliente cadastrado ainda.</p>
        )}
      </div>

      {modalAberto && (
        <NovoClienteModal
          onClose={() => setModalAberto(false)}
          onCriado={() => {
            setModalAberto(false);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function NovoClienteModal({ onClose, onCriado }: { onClose: () => void; onCriado: () => void }) {
  const [form, setForm] = useState({ razaoSocial: "", cnpjCpf: "", email: "", telefone: "", cidade: "", uf: "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await apiFetch("/comercial/clientes", { method: "POST", body: JSON.stringify(form) });
      onCriado();
    } catch (err: any) {
      setErro(err.message || "Não foi possível criar o cliente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-surface rounded-2xl p-5 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Novo cliente</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        {erro && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-3">{erro}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Razão social" value={form.razaoSocial} onChange={(v) => setForm({ ...form, razaoSocial: v })} required />
          <Field label="CNPJ/CPF" value={form.cnpjCpf} onChange={(v) => setForm({ ...form, cnpjCpf: v })} required />
          <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cidade" value={form.cidade} onChange={(v) => setForm({ ...form, cidade: v })} />
            <Field label="UF" value={form.uf} onChange={(v) => setForm({ ...form, uf: v })} maxLength={2} />
          </div>
          <button type="submit" disabled={salvando} className="mt-2 bg-amber text-ink font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60">
            {salvando ? "Salvando..." : "Criar cliente"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, maxLength }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; maxLength?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
      />
    </div>
  );
}
