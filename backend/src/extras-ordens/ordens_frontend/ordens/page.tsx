"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle2, Trash2, Printer } from "lucide-react";
import { apiFetch, Ordem } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { OrdemDocumento } from "@/components/OrdemDocumento";

export default function OrdensPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [escopo, setEscopo] = useState<"minhas" | "todas">("minhas");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ordemVisualizando, setOrdemVisualizando] = useState<Ordem | null>(null);

  function carregar() {
    const params = new URLSearchParams();
    if (dataIni) params.set("de", dataIni);
    if (dataFim) params.set("ate", dataFim);
    if (isAdmin) params.set("escopo", escopo);
    apiFetch(`/ordens?${params.toString()}`).then(setOrdens).catch((e) => setErro(e.message));
  }

  useEffect(carregar, [escopo]);

  async function finalizar(id: string) {
    try {
      await apiFetch(`/ordens/${id}/finalizar`, { method: "PATCH" });
      carregar();
    } catch (e: any) {
      setErro(e.message);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta ordem do histórico?")) return;
    try {
      await apiFetch(`/ordens/${id}`, { method: "DELETE" });
      carregar();
    } catch (e: any) {
      setErro(e.message);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-semibold text-xl">
          {escopo === "todas" ? "Ordens de todos os usuários" : "Minhas ordens emitidas"}
        </h1>
        {isAdmin && (
          <div className="flex gap-2">
            {(["minhas", "todas"] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEscopo(e)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                  escopo === e ? "bg-amber/10 border-amber text-amber" : "border-slate-200 dark:border-border text-slate-500"
                }`}
              >
                {e === "minhas" ? "Minhas ordens" : "Todas (equipe)"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Data início</label>
          <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Data fim</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none" />
        </div>
        <button onClick={carregar} className="bg-amber text-ink text-sm font-semibold px-4 py-2 rounded-lg">Filtrar</button>
      </div>

      {erro && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{erro}</div>}

      <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-borderSoft">
              <th className="px-4 py-2.5">Emissão</th>
              <th className="px-4 py-2.5">Motorista</th>
              <th className="px-4 py-2.5">Carga</th>
              <th className="px-4 py-2.5">Peso</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ordens.map((o) => (
              <tr key={o.id} className="border-b border-slate-50 dark:border-borderSoft/50">
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(o.criadoEm).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 font-medium">{o.motorista?.nome}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{o.carga?.origemCidade} → {o.carga?.destinoCidade}</td>
                <td className="px-4 py-3">{o.peso || "—"} ton</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${o.status === "FINALIZADA" ? "bg-success/10 text-success" : "bg-warn/10 text-warn"}`}>
                    {o.status === "FINALIZADA" ? "Finalizada" : "Pendente"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setOrdemVisualizando(o)} className="flex items-center gap-1 text-xs font-medium text-slate-500 border border-slate-200 dark:border-border px-2 py-1 rounded-md">
                      <FileText size={11} /> Ver/PDF
                    </button>
                    {o.status !== "FINALIZADA" && (
                      <button onClick={() => finalizar(o.id)} className="flex items-center gap-1 text-xs font-medium text-success border border-success/30 px-2 py-1 rounded-md">
                        <CheckCircle2 size={11} /> Dar baixa
                      </button>
                    )}
                    <button onClick={() => excluir(o.id)} className="flex items-center gap-1 text-xs font-medium text-danger border border-danger/30 px-2 py-1 rounded-md">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {ordens.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nenhuma ordem encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {ordemVisualizando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white dark:bg-surface rounded-2xl p-5 max-w-3xl w-full">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white">Documento da ordem</h2>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-amber text-ink text-sm font-semibold px-3 py-2 rounded-lg">
                  <Printer size={14} /> Imprimir / Salvar PDF
                </button>
                <button onClick={() => setOrdemVisualizando(null)} className="text-sm text-slate-500 px-3 py-2">Fechar</button>
              </div>
            </div>
            <OrdemDocumento ordem={ordemVisualizando} />
          </div>
        </div>
      )}
    </div>
  );
}
