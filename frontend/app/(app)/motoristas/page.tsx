"use client";

import { useEffect, useState } from "react";
import { Star, Phone } from "lucide-react";
import { apiFetch, Motorista } from "@/lib/api";

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/motoristas").then(setMotoristas).catch((e) => setErro(e.message));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display font-semibold text-xl">Motoristas</h1>

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
                  <div className="text-xs text-slate-400">CNH {m.cnhCategoria}</div>
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
    </div>
  );
}
