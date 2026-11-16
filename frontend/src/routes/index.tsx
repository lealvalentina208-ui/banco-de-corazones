import { createFileRoute } from "@tanstack/react-router";
import { BancaVirtualView } from "@/components/banca/BancaVirtualView";
import { Heart, CreditCard, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sucursal Virtual — Banco de Corazones" },
      { name: "description", content: "Banco de Corazones: plataforma bancaria desarrollada por Valentina Leal, Sergio Ramos y Dana Manrique." },
      { property: "og:title", content: "Sucursal Virtual — Banco de Corazones" },
      { property: "og:description", content: "Valentina Leal · Sergio Ramos · Dana Manrique" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col w-full max-w-full overflow-x-hidden">
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        <BancaVirtualView />
      </div>

      <footer className="border-t border-rose-500/20 bg-[#1a070d] py-3.5 px-4 text-xs text-rose-200/70 lg:pl-64 w-full">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="flex items-center justify-center sm:justify-start gap-1.5">
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>© 2026 <strong>Banco de Corazones</strong> · Equipo: Valentina Leal, Sergio Ramos y Dana Manrique</span>
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="/cajero" className="hover:text-rose-400 hover:underline flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> Dispensador Efectivo
            </a>
            <a href="/admin" className="hover:text-pink-400 hover:underline flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Dirección General
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
