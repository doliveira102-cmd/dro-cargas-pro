"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, X, Search, Trash2, Eraser, Pencil, Truck as TruckIcon } from "lucide-react";
import { apiFetch, Carga, CargaStatus, Cliente, Motorista } from "@/lib/api";
import { CidadeUfInput } from "@/components/CidadeUfInput";

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
          <Trash2 size={13} /> Excluir selecionadas
        </button>
        <button
          onClick={limparZeradas}
          disabled={processando}
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-surfaceRaised text-slate-500 text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-40"
        >
          <Eraser size={13} /> Limpar cargas zeradas
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

      <div className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-borderSoft">
              <th className="px-3 py-2.5">
                <input type="checkbox" checked={selecionadas.size > 0 && selecionadas.size === cargasFiltradas.length} onChange={toggleTodas} />
              </th>
              <th className="px-3 py-2.5">OP</th>
              <th className="px-3 py-2.5">Cidade origem</th>
              <th className="px-3 py-2.5">Cidade destino</th>
              <th className="px-3 py-2.5">Cliente orig.</th>
              <th className="px-3 py-2.5">Cliente dest.</th>
              <th className="px-3 py-2.5">Produto</th>
              <th className="px-3 py-2.5">Vlr empresa</th>
              <th className="px-3 py-2.5">Vlr motorista</th>
              <th className="px-3 py-2.5">Caminhões</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cargasFiltradas.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 dark:border-borderSoft/50">
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selecionadas.has(c.id)} onChange={() => toggleSelecionada(c.id)} />
                </td>
                <td className="px-3 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{c.opCn || c.codigo}</td>
                <td className="px-3 py-3 whitespace-nowrap">{c.origemCidade}/{c.origemUf}</td>
                <td className="px-3 py-3 whitespace-nowrap">{c.destinoCidade}/{c.destinoUf}</td>
                <td className="px-3 py-3 text-slate-500">{c.cliente?.razaoSocial || "—"}</td>
                <td className="px-3 py-3 text-slate-500">{(c as any).clienteDestino?.razaoSocial || "—"}</td>
                <td className="px-3 py-3 text-slate-500">{c.produto}</td>
                <td className="px-3 py-3 font-mono font-semibold whitespace-nowrap">{fmtBRL(Number(c.valor))}</td>
                <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{c.valorMotorista ? fmtBRL(Number(c.valorMotorista)) : "—"}</td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <TruckIcon size={12} /> {(c as any).motoristasAtribuidos?.length || 0}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-full whitespace-nowrap">
                    {STATUS_LABEL[c.status]}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => { setCargaEditando(c); setModalAberto(true); }}
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 border border-slate-200 dark:border-border px-2 py-1 rounded-md"
                  >
                    <Pencil size={11} /> Editar
                  </button>
                </td>
              </tr>
            ))}
            {!loading && cargasFiltradas.length === 0 && (
              <tr>
                <td colSpan={12} className="px-5 py-8 text-center text-slate-400">
                  Nenhuma carga encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <CargaModal
          carga={cargaEditando}
          onClose={() => setModalAberto(false)}
          onSalvo={(cargaSalva) => {
            carregar();
            // Mantém o modal aberto em modo edição pra já poder atribuir caminhões ao lote recém-criado
            if (!cargaEditando) setCargaEditando(cargaSalva);
            else setModalAberto(false);
          }}
        />
      )}
    </div>
  );
}

function CargaModal({ carga, onClose, onSalvo }: { carga: Carga | null; onClose: () => void; onSalvo: (c: any) => void }) {
  const editando = !!carga;
  const [form, setForm] = useState({
    opCn: carga?.opCn || "",
    origemCidade: carga?.origemCidade || "",
    origemUf: carga?.origemUf || "",
    destinoCidade: carga?.destinoCidade || "",
    destinoUf: carga?.destinoUf || "",
    produto: carga?.produto || "",
    valor: carga ? String(carga.valor) : "",
    valorMotorista: carga?.valorMotorista ? String(carga.valorMotorista) : "",
    clienteId: carga?.clienteId || "",
    clienteDestinoId: (carga as any)?.clienteDestinoId || "",
    localizacaoLink: carga?.localizacaoLink || "",
    observacoes: carga?.observacoes || "",
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/comercial/clientes").then(setClientes).catch(() => {});
  }, []);

  function handleClienteDestinoChange(clienteDestinoId: string) {
    const cliente = clientes.find((c) => c.id === clienteDestinoId);
    setForm((f) => ({
      ...f,
      clienteDestinoId,
      localizacaoLink: cliente?.localizacaoLink || f.localizacaoLink,
      destinoCidade: f.destinoCidade || cliente?.cidade || "",
      destinoUf: f.destinoUf || cliente?.uf || "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        ...form,
        valor: Number(form.valor),
        valorMotorista: form.valorMotorista ? Number(form.valorMotorista) : undefined,
        clienteId: form.clienteId || undefined,
        clienteDestinoId: form.clienteDestinoId || undefined,
      };
      let salva;
      if (editando) {
        salva = await apiFetch(`/cargas/${carga!.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        salva = await apiFetch("/cargas", { method: "POST", body: JSON.stringify(payload) });
      }
      onSalvo(salva);
    } catch (err: any) {
      setErro(err.message || "Não foi possível salvar a carga.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white dark:bg-surface rounded-2xl p-5 w-full max-w-md my-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">{editando ? "Editar carga" : "Cadastrar nova carga"}</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        {erro && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-3">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="OP / CN" value={form.opCn} onChange={(v) => setForm({ ...form, opCn: v })} />

          <CidadeUfInput
            labelCidade="Cidade de origem" labelUf="UF origem"
            cidade={form.origemCidade} uf={form.origemUf}
            onChangeCidade={(v) => setForm({ ...form, origemCidade: v })}
            onChangeUf={(v) => setForm({ ...form, origemUf: v })}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Cliente de origem</label>
            <select
              value={form.clienteId}
              onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
            >
              <option value="">Selecione (opcional)</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
            </select>
          </div>

          <CidadeUfInput
            labelCidade="Cidade de destino" labelUf="UF destino"
            cidade={form.destinoCidade} uf={form.destinoUf}
            onChangeCidade={(v) => setForm({ ...form, destinoCidade: v })}
            onChangeUf={(v) => setForm({ ...form, destinoUf: v })}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Cliente de destino</label>
            <select
              value={form.clienteDestinoId}
              onChange={(e) => handleClienteDestinoChange(e.target.value)}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
            >
              <option value="">Selecione (opcional)</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
            </select>
          </div>

          <Field label="Produto" value={form.produto} onChange={(v) => setForm({ ...form, produto: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor empresa (R$)" type="number" value={form.valor} onChange={(v) => setForm({ ...form, valor: v })} required />
            <Field label="Valor motorista (R$)" type="number" value={form.valorMotorista} onChange={(v) => setForm({ ...form, valorMotorista: v })} />
          </div>
          <Field label="Localização (link/endereço)" value={form.localizacaoLink} onChange={(v) => setForm({ ...form, localizacaoLink: v })} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Observações internas</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={2}
              className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
            />
          </div>

          <button type="submit" disabled={salvando} className="mt-1 bg-amber text-ink font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60">
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar carga e continuar"}
          </button>
        </form>

        {editando && <CaminhoesDoLote cargaId={carga!.id} atribuicoesIniciais={(carga as any).motoristasAtribuidos || []} />}
      </div>
    </div>
  );
}

function CaminhoesDoLote({ cargaId, atribuicoesIniciais }: { cargaId: string; atribuicoesIniciais: any[] }) {
  const [atribuicoes, setAtribuicoes] = useState<any[]>(atribuicoesIniciais);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [motoristaId, setMotoristaId] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/motoristas").then(setMotoristas).catch(() => {});
  }, []);

  async function adicionar() {
    if (!motoristaId) return;
    setAdicionando(true);
    setErro(null);
    try {
      const nova = await apiFetch(`/cargas/${cargaId}/motoristas`, {
        method: "POST",
        body: JSON.stringify({ motoristaId }),
      });
      setAtribuicoes((a) => [...a, nova]);
      setMotoristaId("");
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setAdicionando(false);
    }
  }

  async function remover(atribuicaoId: string) {
    try {
      await apiFetch(`/cargas/${cargaId}/motoristas/${atribuicaoId}`, { method: "DELETE" });
      setAtribuicoes((a) => a.filter((x) => x.id !== atribuicaoId));
    } catch (e: any) {
      setErro(e.message);
    }
  }

  return (
    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-borderSoft flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber uppercase tracking-wide">
        <TruckIcon size={13} /> Caminhões deste lote ({atribuicoes.length})
      </div>

      {erro && <div className="text-xs text-danger">{erro}</div>}

      <div className="flex flex-col gap-1.5">
        {atribuicoes.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm">
            <span>{a.motorista?.nome}</span>
            <button onClick={() => remover(a.id)} className="text-danger">
              <X size={14} />
            </button>
          </div>
        ))}
        {atribuicoes.length === 0 && <p className="text-xs text-slate-400">Nenhum caminhão atribuído ainda.</p>}
      </div>

      <div className="flex gap-2">
        <select
          value={motoristaId}
          onChange={(e) => setMotoristaId(e.target.value)}
          className="flex-1 border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
        >
          <option value="">Selecione um motorista</option>
          {motoristas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <button
          type="button"
          onClick={adicionar}
          disabled={!motoristaId || adicionando}
          className="bg-amber text-ink text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
        >
          <Plus size={15} />
        </button>
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
