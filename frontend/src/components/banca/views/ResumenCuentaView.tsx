import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Check, Copy, KeyRound, RefreshCw, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/formatters";
import type { Cuenta, Movimiento, Usuario } from "../types";

interface ResumenCuentaViewProps {
  usuario: Usuario;
  cuentaActiva: Cuenta | null;
  saldoActual: number;
  movimientos: Movimiento[];
  onRefresh: () => void;
  onIrTransferir: () => void;
  onIrPinRetiro: () => void;
}

export function ResumenCuentaView({
  usuario,
  cuentaActiva,
  saldoActual,
  movimientos,
  onRefresh,
  onIrTransferir,
  onIrPinRetiro,
}: ResumenCuentaViewProps) {
  const [copiado, setCopiado] = useState(false);

  const copiarTexto = (txt: string) => {
    if (!txt) return;
    navigator.clipboard?.writeText(txt);
    setCopiado(true);
    toast.success(`Copiado: ${txt}`);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-5">
        <div className="rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-100">
              Cuenta {cuentaActiva?.tipo_cuenta || "Ahorros"} Corazón
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
              {cuentaActiva?.estado_cuenta || "ACTIVA"}
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs text-rose-100 block">Saldo Disponible</span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-0.5">
              {formatCOP(saldoActual)}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-rose-100 block text-[11px]">Número de Cuenta / Tarjeta</span>
              <span className="font-mono font-bold text-sm tracking-wider">
                {cuentaActiva?.numero_cuenta}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copiarTexto(cuentaActiva?.numero_cuenta || "")}
              className="inline-flex items-center gap-1 rounded-lg bg-white/20 hover:bg-white/30 px-2.5 py-1.5 text-xs font-semibold"
            >
              {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copiar</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
            <User className="h-4 w-4" />
            <span>Ficha del Asociado</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-slate-500 block">Titular</span>
              <strong className="text-slate-900 mt-0.5 block">
                {usuario.nombres} {usuario.apellidos}
              </strong>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-slate-500 block">Documento</span>
              <strong className="text-slate-900 font-mono mt-0.5 block">
                {usuario.numero_documento}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Button
              type="button"
              onClick={onIrTransferir}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-10 rounded-xl"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" /> Enviar Dinero
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onIrPinRetiro}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold h-10 rounded-xl"
            >
              <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Retirar en Cajero
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Movimientos Recientes</h2>
              <p className="text-xs text-slate-500">Últimas operaciones registradas en tu cuenta</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar
            </button>
          </div>

          {movimientos.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              No tienes movimientos registrados todavía.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 mt-2">
              {movimientos.slice(0, 6).map((m) => {
                const esCredito = m.sentido === "CREDITO";
                return (
                  <div key={m.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                          esCredito
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {esCredito ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {m.descripcion || m.tipo_operacion}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(m.fecha || m.fecha_hora).toLocaleString("es-CO")} · {m.canal}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-extrabold font-mono ${
                          esCredito ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {esCredito ? "+" : "-"}
                        {formatCOP(m.valor)}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Saldo: {formatCOP(m.saldo_resultante)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
