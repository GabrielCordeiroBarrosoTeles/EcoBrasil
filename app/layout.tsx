import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";
import { ReactQueryProvider } from "../components/providers/react-query-provider";
import { AppShell } from "../components/layout/AppShell";

export const metadata: Metadata = {
  title: "EcoMonitor",
  description: "Monitoramento e análise preditiva de riscos ambientais no Brasil",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900">
        <ReactQueryProvider>
          <AppShell>{children}</AppShell>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

