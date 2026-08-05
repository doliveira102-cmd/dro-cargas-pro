"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Truck, Package, Route, DollarSign, Users, Monitor, LogOut, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: Monitor },
  { href: "/cargas", label: "Cargas", icon: Package },
  { href: "/motoristas", label: "Motoristas", icon: Truck },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/comercial", label: "Comercial", icon: Users },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-ink text-slate-400 text-sm">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-ink text-slate-900 dark:text-slate-100">
      <aside className="w-56 shrink-0 border-r border-slate-200 dark:border-border bg-white dark:bg-surface flex flex-col">
        <div className="px-4 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center shrink-0">
            <Truck size={16} className="text-ink" />
          </div>
          <div>
            <div className="font-display font-bold text-sm leading-none">DRO Cargas</div>
            <div className="text-[9px] tracking-widest text-slate-400">PRO</div>
          </div>
        </div>

        <nav className="px-2.5 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-slate-100 dark:bg-surfaceRaised text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <item.icon size={16} className={active ? "text-amber" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-3 border-t border-slate-100 dark:border-borderSoft flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-tealSoft text-teal flex items-center justify-center text-xs font-semibold shrink-0">
            {user.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate">{user.nome}</div>
            <div className="text-[10px] text-slate-400">{user.role}</div>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="w-7 h-7 rounded-md border border-slate-200 dark:border-border flex items-center justify-center text-slate-400"
            title="Alternar tema"
          >
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button
            onClick={logout}
            className="w-7 h-7 rounded-md border border-slate-200 dark:border-border flex items-center justify-center text-slate-400"
            title="Sair"
          >
            <LogOut size={13} />
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
