"use client";

import { useEffect, useId, useState } from "react";
import { getCidadesPorUf, UFS_BRASIL } from "@/lib/ibge";

interface CidadeUfInputProps {
  labelCidade: string;
  labelUf: string;
  cidade: string;
  uf: string;
  onChangeCidade: (v: string) => void;
  onChangeUf: (v: string) => void;
  required?: boolean;
}

// Campo de Cidade com autocomplete (datalist) que se atualiza conforme a UF escolhida,
// usando a base oficial de municípios do IBGE.
export function CidadeUfInput({
  labelCidade, labelUf, cidade, uf, onChangeCidade, onChangeUf, required,
}: CidadeUfInputProps) {
  const [cidades, setCidades] = useState<string[]>([]);
  const listId = useId();

  useEffect(() => {
    if (uf) getCidadesPorUf(uf).then(setCidades);
    else setCidades([]);
  }, [uf]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">{labelCidade}</label>
        <input
          list={listId}
          required={required}
          value={cidade}
          onChange={(e) => onChangeCidade(e.target.value)}
          placeholder={uf ? "Digite para buscar..." : "Escolha a UF primeiro"}
          className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
        />
        <datalist id={listId}>
          {cidades.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">{labelUf}</label>
        <select
          required={required}
          value={uf}
          onChange={(e) => onChangeUf(e.target.value)}
          className="border border-slate-200 dark:border-border bg-slate-50 dark:bg-surfaceRaised rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber/50"
        >
          <option value="">UF</option>
          {UFS_BRASIL.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  );
}
