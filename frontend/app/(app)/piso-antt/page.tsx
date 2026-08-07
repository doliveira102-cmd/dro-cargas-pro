"use client";

import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Opcoes {
  tiposCarga: string[];
  ufs: string[];
  configsVeiculo: string[];
}

interface LinhaResultado {
  config: string;
  eixos: number;
  peso: number;
  pisoMinimoAntt: number | null;
  freteMotoristaSemPedagio: number | null;
  pedagio: number;
  freteMotoristaComPedagio: number | null;
  icmsIssPercent: number;
  margemPercent: number;
  freteEmpresaTotal: number | null;
  freteEmpresaTon: number | null;
}

function fmtBRL(n: number | null) {
  if (n === null) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
}

export default function PisoAnttPage() {
  const [opcoes, setOpcoes] = useState<Opcoes | null>(null);
  const [form, setForm] = useState({
    origemUf: "", destinoUf: "", operacao: "NACIONAL", distanciaKm: "", tipoCarga: "", margemPercent: "10",
  });
  const [pedagios, setPedagios] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<LinhaResultado[] | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/piso-antt/opcoes").then(setOpcoes).catch((e) => setErro(e.message));
  }, []);

  async function calcular(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCalculando(true);
    try {
      const pedagiosNum: Record<string, number> = {};
      Object.entries(pedagios).forEach(([k, v]) => { pedagiosNum[k] = Number(v) || 0; });

      const res = await apiFetch("/piso-antt/calcular", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          distanciaKm: Number(form.distanciaKm),
          margemPercent: Number(form.margemPercent),
          pedagios: pedagiosNum,
        }),
      });
      setResultado(res);
    } catch (err: any) {
      setErro(err.message || "Não foi possível calcular.");
    } finally {
      setCalculando(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <Calculator size={20} className="text-amber" />
        <h1 className="font-display font-semibold text-xl">Piso Mínimo ANTT (Resolução nº 6.084/2026)</h1>
      </div>

      {erro && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{erro}</div>
      )}

      <form onSubmit={calcular} className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Origem</label>
            <select
              required
              value={form.origemUf}
              onChange={(e) => setForm({ ...form, origemUf: e.target.value })}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
            >
              <option value="">UF</option>
              {opcoes?.ufs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Destino</label>
            <select
              required
              value={form.destinoUf}
              onChange={(e) => setForm({ ...form, destinoUf: e.target.value })}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
            >
              <option value="">UF</option>
              {opcoes?.ufs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Operação</label>
            <select
              value={form.operacao}
              onChange={(e) => setForm({ ...form, operacao: e.target.value })}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
            >
              <option value="NACIONAL">Nacional</option>
              <option value="EXPORTAÇÃO">Exportação</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Distância (km)</label>
            <input
              required type="number" value={form.distanciaKm}
              onChange={(e) => setForm({ ...form, distanciaKm: e.target.value })}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Margem (%)</label>
            <input
              type="number" value={form.margemPercent}
              onChange={(e) => setForm({ ...form, margemPercent: e.target.value })}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Tipo de carga</label>
          <select
            required
            value={form.tipoCarga}
            onChange={(e) => setForm({ ...form, tipoCarga: e.target.value })}
            className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50 max-w-xs"
          >
            <option value="">Selecione</option>
            {opcoes?.tiposCarga.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {opcoes && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Pedágio por configuração de veículo (R$, opcional)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {opcoes.configsVeiculo.map((cfg) => (
                <div key={cfg} className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">{cfg}</span>
                  <input
                    type="number"
                    value={pedagios[cfg] || ""}
                    onChange={(e) => setPedagios({ ...pedagios, [cfg]: e.target.value })}
                    placeholder="0"
                    className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-amber/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={calculando}
          className="self-start bg-amber text-ink font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-60"
        >
          {calculando ? "Calculando..." : "Calcular piso mínimo"}
        </button>
      </form>

      {resultado && (
        <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-borderSoft">
                <th className="px-3 py-2.5">Veículo</th>
                <th className="px-3 py-2.5">Piso mín. ANTT</th>
                <th className="px-3 py-2.5">Peso (t)</th>
                <th className="px-3 py-2.5">Frete mot. s/ pedágio</th>
                <th className="px-3 py-2.5">Pedágio</th>
                <th className="px-3 py-2.5">Frete mot. + pedágio</th>
                <th className="px-3 py-2.5">ICMS/ISS</th>
                <th className="px-3 py-2.5">Margem</th>
                <th className="px-3 py-2.5">Frete empresa total</th>
                <th className="px-3 py-2.5">Frete empresa /ton</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((r) => (
                <tr key={r.config} className="border-b border-slate-50 dark:border-borderSoft/50">
                  <td className="px-3 py-3 font-medium whitespace-nowrap">{r.config}</td>
                  <td className="px-3 py-3 font-mono whitespace-nowrap">{fmtBRL(r.pisoMinimoAntt)}</td>
                  <td className="px-3 py-3 font-mono text-slate-500">{r.peso}</td>
                  <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{fmtBRL(r.freteMotoristaSemPedagio)}</td>
                  <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{fmtBRL(r.pedagio)}</td>
                  <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{fmtBRL(r.freteMotoristaComPedagio)}</td>
                  <td className="px-3 py-3 font-mono text-slate-500">{r.icmsIssPercent}%</td>
                  <td className="px-3 py-3 font-mono text-slate-500">{r.margemPercent}%</td>
                  <td className="px-3 py-3 font-mono font-semibold whitespace-nowrap">{fmtBRL(r.freteEmpresaTotal)}</td>
                  <td className="px-3 py-3 font-mono whitespace-nowrap">{fmtBRL(r.freteEmpresaTon)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
