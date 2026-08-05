"use client";

import { useEffect, useState } from "react";
import { Package, Truck, DollarSign, TrendingUp, BadgeCheck } from "lucide-react";
import { apiFetch, Carga, ResumoFinanceiro } from "@/lib/api";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const STATUS_LABEL: Record<string, string> = {
  DISPONIVEL: "Disponível",
  EM_TRANSITO: "Em trânsito",
  ENCERRADA: "Encerrada",
  SUSPENSA: "Suspensa",
  CANCELADA: "Cancelada",
};

export default function DashboardPage() {
  const [totalCargas, setTotalCargas] = useState<number | null>(null);
  const [cargasRecentes, setCargasRecentes] = useState<Carga[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [totalMotoristas, setTotalMotoristas] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/cargas?page=1&pageSize=8"),
      apiFetch("/financeiro/resumo").catch(() => null),
      apiFetch("/motoristas").catch(() => []),
    ])
      .then(([cargasRes, resumoRes, motoristas]) => {
        setTotalCargas(cargasRes.total);
        setCargasRecentes(cargasRes.items);
        setResumo(resumoRes);
        setTotalMotoristas(Array.isArray(motoristas) ? motoristas.length : 0);
      })
      .catch((e) => setErro(e.message));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display font-semibold text-xl">Visão geral</h1>

      {erro && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          Não consegui carregar os dados: {erro}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Package} label="Total de cargas" value={totalCargas ?? "—"} colorClass="text-teal" />
        <KpiCard icon={Truck} label="Motoristas" value={totalMotoristas ?? "—"} colorClass="text-amber" />
        <KpiCard
          icon={DollarSign}
          label="Receitas"
          value={resumo ? fmtBRL(resumo.receitas) : "—"}
          colorClass="text-amber"
        />
        <KpiCard
          icon={TrendingUp}
          label="Lucro"
          value={resumo ? fmtBRL(resumo.lucro) : "—"}
          colorClass="text-success"
        />
      </div>

      <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-borderSoft">
          <h2 className="font-display font-semibold text-sm">Cargas recentes</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-borderSoft">
              <th className="px-5 py-2.5">Código</th>
              <th className="px-5 py-2.5">Origem</th>
              <th className="px-5 py-2.5">Destino</th>
              <th className="px-5 py-2.5">Produto</th>
              <th className="px-5 py-2.5">Valor</th>
              <th className="px-5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {cargasRecentes.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 dark:border-borderSoft/50">
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{c.codigo}</td>
                <td className="px-5 py-3">{c.origemCidade}/{c.origemUf}</td>
                <td className="px-5 py-3">{c.destinoCidade}/{c.destinoUf}</td>
                <td className="px-5 py-3 text-slate-500">{c.produto}</td>
                <td className="px-5 py-3 font-mono font-semibold">{fmtBRL(c.valor)}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-full">
                    <BadgeCheck size={12} />
                    {STATUS_LABEL[c.status] || c.status}
                  </span>
                </td>
              </tr>
            ))}
            {cargasRecentes.length === 0 && !erro && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  Nenhuma carga cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: any;
  label: string;
  value: string | number;
  colorClass: string;
}) {
  return (
    <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{label}</span>
        <Icon size={15} className={colorClass} />
      </div>
      <span className="font-mono font-semibold text-xl">{value}</span>
    </div>
  );
}
