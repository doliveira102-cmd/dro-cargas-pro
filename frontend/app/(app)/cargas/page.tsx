"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { apiFetch, Carga, CargaStatus } from "@/lib/api";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const STATUS_LABEL: Record<CargaStatus, string> = {
  DISPONIVEL: "Disponível",
  EM_TRANSITO: "Em trânsito",
  ENCERRADA: "Encerrada",
  SUSPENSA: "Suspensa",
  CANCELADA: "Cancelada",
};

export default function CargasPage() {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  function carregar() {
    setLoading(true);
    const query = statusFiltro ? `?status=${statusFiltro}` : "";
    apiFetch(`/cargas${query}`)
      .then((res) => setCargas(res.items))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(carregar, [statusFiltro]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl">Cargas</h1>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-1.5 bg-amber text-ink text-sm font-semibold px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} /> Nova carga
        </button>
      </div>

      <div className="flex gap-2">
        {["", "DISPONIVEL", "EM_TRANSITO", "ENCERRADA", "SUSPENSA"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFiltro(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
              statusFiltro === s
                ? "bg-amber/10 border-amber text-amber"
                : "border-slate-200 dark:border-border text-slate-500"
            }`}
          >
            {s ? STATUS_LABEL[s as CargaStatus] : "Todas"}
          </button>
        ))}
      </div>

      {erro && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {erro}
        </div>
      )}

      <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-borderSoft">
              <th className="px-5 py-2.5">Código</th>
              <th className="px-5 py-2.5">Origem</th>
              <th className="px-5 py-2.5">Destino</th>
              <th className="px-5 py-2.5">Produto</th>
              <th className="px-5 py-2.5">Cliente</th>
              <th className="px-5 py-2.5">Valor</th>
              <th className="px-5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {cargas.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 dark:border-borderSoft/50">
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{c.codigo}</td>
                <td className="px-5 py-3">{c.origemCidade}/{c.origemUf}</td>
                <td className="px-5 py-3">{c.destinoCidade}/{c.destinoUf}</td>
                <td className="px-5 py-3 text-slate-500">{c.produto}</td>
                <td className="px-5 py-3 text-slate-500">{c.cliente?.razaoSocial || "—"}</td>
                <td className="px-5 py-3 font-mono font-semibold">{fmtBRL(c.valor)}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-full">
                    {STATUS_LABEL[c.status]}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && cargas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  Nenhuma carga encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <NovaCargaModal
          onClose={() => setModalAberto(false)}
          onCriada={() => {
            setModalAberto(false);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function NovaCargaModal({ onClose, onCriada }: { onClose: () => void; onCriada: () => void }) {
  const [form, setForm] = useState({
    origemCidade: "", origemUf: "", destinoCidade: "", destinoUf: "", produto: "", valor: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await apiFetch("/cargas", {
        method: "POST",
        body: JSON.stringify({ ...form, valor: Number(form.valor) }),
      });
      onCriada();
    } catch (err: any) {
      setErro(err.message || "Não foi possível criar a carga.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-surface rounded-2xl p-5 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Nova carga</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        {erro && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-3">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cidade de origem" value={form.origemCidade} onChange={(v) => setForm({ ...form, origemCidade: v })} required />
            <Field label="UF origem" value={form.origemUf} onChange={(v) => setForm({ ...form, origemUf: v })} maxLength={2} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cidade de destino" value={form.destinoCidade} onChange={(v) => setForm({ ...form, destinoCidade: v })} required />
            <Field label="UF destino" value={form.destinoUf} onChange={(v) => setForm({ ...form, destinoUf: v })} maxLength={2} required />
          </div>
          <Field label="Produto" value={form.produto} onChange={(v) => setForm({ ...form, produto: v })} required />
          <Field label="Valor (R$)" type="number" value={form.valor} onChange={(v) => setForm({ ...form, valor: v })} required />

          <button
            type="submit"
            disabled={salvando}
            className="mt-2 bg-amber text-ink font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Criar carga"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input
        type={type}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
      />
    </div>
  );
}
