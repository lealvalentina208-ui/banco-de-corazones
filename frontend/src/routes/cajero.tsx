import { createFileRoute } from "@tanstack/react-router";
import { CajeroAtmView } from "@/components/cajero/CajeroAtmView";

export const Route = createFileRoute("/cajero")({
  head: () => ({
    meta: [
      { title: "Cajero Automático ATM — Banco de Corazones" },
      { name: "description", content: "Terminal ATM de autoservicio para retiros de efectivo y consultas con tarjeta y PIN." },
      { property: "og:title", content: "Cajero Automático ATM — Banco de Corazones" },
      { property: "og:description", content: "Terminal ATM de autoservicio" },
    ],
  }),
  component: CajeroRoute,
});

function CajeroRoute() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <CajeroAtmView />
    </div>
  );
}
