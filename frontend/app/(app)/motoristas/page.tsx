"use client";

import { useEffect, useState } from "react";
import { Star, Phone, Plus, X } from "lucide-react";
import { apiFetch, Motorista } from "@/lib/api";

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  function carregar() {
    apiFetch("/motoristas").then(setMotoristas).catch((e) => setErro(e.message));
  }

  useEffect(carregar, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl">Motoristas</h1>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-1.5 bg-amber text-ink text-sm font-semibold px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} /> Novo motorista
        </button>
      </div>

      {erro && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{erro}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motoristas.map((m) => (
          <div key={m.id} className="bg-white dark:bg-surface border border-slate-200 dark:border-border rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-tealSoft text-teal flex items-center justify-center text-xs font-semibold">
                  {m.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold text-sm">{m.nome}</div>
                  <div className="text-xs text-slate-400">CNH {m.cnhCategoria}{m.cpf ? ` · CPF ${m.cpf}` : ""}</div>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${m.disponivel ? "bg-success/10 text-success" : "bg-slate-100 dark:bg-surfaceRaised text-slate-400"}`}>
                {m.disponivel ? "Disponível" : "Indisponível"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-warn" fill="currentColor" />
                {m.avaliacaoMedia.toFixed(1)}
              </div>
              {m.telefone && (
                <div className="flex items-center gap-1">
                  <Phone size={12} /> {m.telefone}
                </div>
              )}
            </div>
          </div>
        ))}
        {motoristas.length === 0 && !erro && (
          <p className="text-sm text-slate-400 col-span-full text-center py-8">Nenhum motorista cadastrado ainda.</p>
        )}
      </div>

      {modalAberto && (
        <NovoMotoristaModal
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

function NovoMotoristaModal({ onClose, onCriado }: { onClose: () => void; onCriado: () => void }) {
  const [form, setForm] = useState({
    nome: "", telefone: "", cnh: "", cnhCategoria: "", cnhValidade: "", rg: "", cpf: "",
    placa: "", tipo: "", reboque1: "", reboque2: "", reboque3: "",
    proprietarioNome: "", proprietarioCpfCnpj: "", proprietarioEndereco: "", proprietarioMunicipioUf: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const motorista = await apiFetch("/motoristas", {
        method: "POST",
        body: JSON.stringify({
          nome: form.nome, telefone: form.telefone, cnh: form.cnh, cnhCategoria: form.cnhCategoria,
          cnhValidade: form.cnhValidade || undefined, rg: form.rg, cpf: form.cpf,
        }),
      });

      if (form.placa) {
        await apiFetch("/veiculos", {
          method: "POST",
          body: JSON.stringify({
            placa: form.placa, tipo: form.tipo || undefined, motoristaId: motorista.id,
            reboque1: form.reboque1 || undefined, reboque2: form.reboque2 || undefined, reboque3: form.reboque3 || undefined,
            proprietarioNome: form.proprietarioNome || undefined, proprietarioCpfCnpj: form.proprietarioCpfCnpj || undefined,
            proprietarioEndereco: form.proprietarioEndereco || undefined, proprietarioMunicipioUf: form.proprietarioMunicipioUf || undefined,
          }),
        });
      }
      onCriado();
    } catch (err: any) {
      setErro(err.message || "Não foi possível criar o motorista.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white dark:bg-surface rounded-2xl p-5 w-full max-w-lg my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Cadastrar novo motorista</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        {erro && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-3">{erro}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Section title="Dados do motorista">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome do motorista" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
              <Field label="Telefone / WhatsApp" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="CNH nº" value={form.cnh} onChange={(v) => setForm({ ...form, cnh: v })} required />
              <Field label="Categoria" value={form.cnhCategoria} onChange={(v) => setForm({ ...form, cnhCategoria: v })} required />
              <Field label="Validade CNH" type="date" value={form.cnhValidade} onChange={(v) => setForm({ ...form, cnhValidade: v })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="RG" value={form.rg} onChange={(v) => setForm({ ...form, rg: v })} />
              <Field label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} />
            </div>
          </Section>

          <Section title="Dados do veículo">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Placa do cavalo" value={form.placa} onChange={(v) => setForm({ ...form, placa: v })} />
              <Field label="Tipo de veículo (opcional)" value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Reboque 1" value={form.reboque1} onChange={(v) => setForm({ ...form, reboque1: v })} />
              <Field label="Reboque 2" value={form.reboque2} onChange={(v) => setForm({ ...form, reboque2: v })} />
              <Field label="Reboque 3" value={form.reboque3} onChange={(v) => setForm({ ...form, reboque3: v })} />
            </div>
          </Section>

          <Section title="Dados do proprietário (CRLV)">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome do proprietário" value={form.proprietarioNome} onChange={(v) => setForm({ ...form, proprietarioNome: v })} />
              <Field label="CPF/CNPJ" value={form.proprietarioCpfCnpj} onChange={(v) => setForm({ ...form, proprietarioCpfCnpj: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Endereço" value={form.proprietarioEndereco} onChange={(v) => setForm({ ...form, proprietarioEndereco: v })} />
              <Field label="Município/UF" value={form.proprietarioMunicipioUf} onChange={(v) => setForm({ ...form, proprietarioMunicipioUf: v })} />
            </div>
          </Section>

          <button
            type="submit"
            disabled={salvando}
            className="mt-1 bg-amber text-ink font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Cadastrar motorista"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-amber uppercase tracking-wide">{title}</div>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
      />
    </div>
  );
}
