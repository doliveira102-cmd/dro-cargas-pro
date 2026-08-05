import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRO Cargas PRO",
  description: "Gestão de cargas para transportadoras e operadores logísticos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
