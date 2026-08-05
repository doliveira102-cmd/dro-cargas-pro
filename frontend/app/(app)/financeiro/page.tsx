"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingDown, TrendingUp, Percent } from "lucide-react";
import { apiFetch, ResumoFinanceiro } from "@/lib/api";

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

interface Transacao {
  id: string;
  tipo: "RECEITA" | "DESPESA" | "COMISSAO";
  descricao: string;
  valor: number;
  criadoEm: string;
}

export default function FinanceiroPage() {
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiFetch("/financeiro/resumo"), apiFetch("/financeiro/transacoes")])
      .then(([r, t]) => {
        setResumo(r);
        setTransacoes(t);
      })
      .catch((e) => setErro(e.message));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display font-semibold text-xl">Financeiro</h1>

      {erro && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{erro}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card icon={DollarSign} label="Receitas" value={resumo ? fmtBRL(resumo.receitas) : "—"} color="text-teal" />
        <Card icon={TrendingDown} label="Despesas" value={resumo ? fmtBRL(resumo.despesas) : "—"} color="text-danger" />
        <Card icon={Percent} label="Comissões" value={resumo ? fmtBRL(resumo.comissoes) : "—"} color="text-amber" />
        <Card icon={TrendingUp} label="Lucro" value={resumo ? fmtBRL(resumo.lucro) : "—"} color="text-success" />
      </div>

      <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-borderSoft">
          <h2 className="font-display font-semibold text-sm">Transações</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-borderSoft">
              <th className="px-5 py-2.5">Descrição</th>
              <th className="px-5 py-2.5">Tipo</th>
              <th className="px-5 py-2.5">Valor</th>
              <th className="px-5 py-2.5">Data</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 dark:border-borderSoft/50">
                <td className="px-5 py-3">{t.descricao}</td>
                <td className="px-5 py-3 text-slate-500">{t.tipo}</td>
                <td className="px-5 py-3 font-mono font-semibold">{fmtBRL(t.valor)}</td>
                <td className="px-5 py-3 text-slate-400">{new Date(t.criadoEm).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
            {transacoes.length === 0 && !erro && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">Nenhuma transação registrada ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{label}</span>
        <Icon size={15} className={color} />
      </div>
      <span className="font-mono font-semibold text-lg">{value}</span>
    </div>
  );
}
