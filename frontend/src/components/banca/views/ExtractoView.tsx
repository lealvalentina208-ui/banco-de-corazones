import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatCOP } from "@/lib/formatters";
import type { Cuenta, Movimiento } from "../types";

interface ExtractoViewProps {
  cuentaActiva: Cuenta | null;
  movimientos: Movimiento[];
}

export function ExtractoView({ cuentaActiva, movimientos }: ExtractoViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const movimientosFiltrados = movimientos.filter((m) => {
    if (!searchTerm.trim()) return true;
    const t = searchTerm.toLowerCase();
    return (
      m.descripcion?.toLowerCase().includes(t) ||
      m.tipo_operacion?.toLowerCase().includes(t) ||
      String(m.valor).includes(t)
    );
  });

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Extracto de Movimientos</h2>
          <p className="text-xs text-slate-500">
            Cuenta No. <span className="font-mono font-bold">{cuentaActiva?.numero_cuenta}</span>
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por concepto o valor..."
            className="h-9 bg-slate-50 border-slate-300 text-xs text-slate-900"
          />
        </div>
      </div>

      {movimientosFiltrados.length === 0 ? (
        <p className="py-10 text-center text-xs text-slate-400">
          No se encontraron movimientos para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Concepto</th>
                <th className="py-2.5 px-3">Canal</th>
                <th className="py-2.5 px-3 text-right">Valor</th>
                <th className="py-2.5 px-3 text-right">Saldo Resultante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientosFiltrados.map((m) => {
                const esCredito = m.sentido === "CREDITO";
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(m.fecha || m.fecha_hora).toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {m.descripcion || m.tipo_operacion}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{m.canal}</td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold ${
                        esCredito ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {esCredito ? "+" : "-"}
                      {formatCOP(m.valor)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatCOP(m.saldo_resultante)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
