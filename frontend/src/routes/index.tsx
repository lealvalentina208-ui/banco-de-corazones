import { createFileRoute } from "@tanstack/react-router";
import { BancaVirtualView } from "@/components/banca/BancaVirtualView";
import { Heart, CreditCard, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Banco de Corazones — Sucursal Virtual" },
      { name: "description", content: "Banco de Corazones: Valentina Leal, Sergio Ramos y Dana Manrique." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[#f8f4f6] font-sans text-slate-800 flex flex-col w-full max-w-full overflow-x-hidden">
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        <BancaVirtualView />
      </div>

      <footer className="border-t border-rose-200 bg-white py-4 px-4 text-xs text-slate-500 w-full">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="flex items-center justify-center sm:justify-start gap-1.5">
            <Heart className="h-4 w-4 text-rose-600 fill-rose-600" />
            <span>© 2026 <strong className="text-slate-800">Banco de Corazones</strong> · Todos los derechos reservados</span>
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="/cajero" className="text-rose-600 hover:underline flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" /> Ir al Cajero Automático
            </a>
            <a href="/admin" className="text-slate-700 hover:text-rose-600 hover:underline flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Panel de Administración
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
