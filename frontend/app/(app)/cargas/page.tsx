"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, X, Search, Trash2, Eraser, Pencil, Truck as TruckIcon, FileText, Printer } from "lucide-react";
import { apiFetch, Carga, CargaStatus, Cliente, Motorista, Ordem } from "@/lib/api";
import { CidadeUfInput } from "@/components/CidadeUfInput";
import { OrdemDocumento } from "@/components/OrdemDocumento";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
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
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [cargaEditando, setCargaEditando] = useState<Carga | null>(null);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [processando, setProcessando] = useState(false);
  const [cargaParaOrdem, setCargaParaOrdem] = useState<Carga | null>(null);

  function carregar() {
    setLoading(true);
    const query = statusFiltro ? `?status=${statusFiltro}` : "";
    apiFetch(`/cargas${query}`)
      .then((res) => setCargas(res.items))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(carregar, [statusFiltro]);

  const cargasFiltradas = useMemo(() => {
    if (!busca.trim()) return cargas;
    const q = busca.toLowerCase();
    return cargas.filter((c) =>
      [c.opCn, c.codigo, c.origemCidade, c.destinoCidade, c.produto, c.cliente?.razaoSocial]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [cargas, busca]);

  function toggleSelecionada(id: string) {
    setSelecionadas((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTodas() {
    setSelecionadas((s) =>
      s.size === cargasFiltradas.length ? new Set() : new Set(cargasFiltradas.map((c) => c.id))
    );
  }

  async function excluirSelecionadas() {
    if (selecionadas.size === 0) return;
    if (!confirm(`Excluir ${selecionadas.size} carga(s) selecionada(s)?`)) return;
    setProcessando(true);
    try {
      await Promise.all([...selecionadas].map((id) => apiFetch(`/cargas/${id}`, { method: "DELETE" })));
      setSelecionadas(new Set());
      carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setProcessando(false);
    }
  }

  async function limparZeradas() {
    const zeradas = cargas.filter((c) => !c.valor || Number(c.valor) === 0);
    if (zeradas.length === 0) return;
    if (!confirm(`Excluir ${zeradas.length} carga(s) com valor zerado?`)) return;
    setProcessando(true);
    try {
      await Promise.all(zeradas.map((c) => apiFetch(`/cargas/${c.id}`, { method: "DELETE" })));
      carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl">Cargas</h1>
        <button
          onClick={() => { setCargaEditando(null); setModalAberto(true); }}
          className="flex items-center gap-1.5 bg-amber text-ink text-sm font-semibold px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} /> Cadastrar carga
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cargas..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <button
          onClick={excluirSelecionadas}
          disabled={selecionadas.size === 0 || processando}
          className="flex items-center gap-1.5 bg-danger/10 text-danger text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-40"
        >
