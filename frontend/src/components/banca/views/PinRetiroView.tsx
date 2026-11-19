import { CreditCard, KeyRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveCajeroHandoff } from "@/lib/secureFetch";
import type { Cuenta } from "../types";

interface PinRetiroViewProps {
  cuentaActiva: Cuenta | null;
  codigoRetiro: string | null;
  loadingCodigo: boolean;
  onGenerarPin: () => void;
}

export function PinRetiroView({
  cuentaActiva,
  codigoRetiro,
  loadingCodigo,
  onGenerarPin,
}: PinRetiroViewProps) {
  return (
    <div className="max-w-lg mx-auto rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-sm space-y-5">
      <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
        <KeyRound className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">Pin de Retiro sin Tarjeta</h2>
        <p className="text-xs text-slate-500 mt-1">
          Genera un código temporal de 6 dígitos para retirar efectivo en el Cajero Automático de Banco de Corazones.
        </p>
      </div>

      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
          Tu Pin Activo de 6 Dígitos
        </span>
        <div className="font-mono text-3xl font-extrabold tracking-[0.25em] text-slate-900 my-3">
          {loadingCodigo ? "••••••" : codigoRetiro || "------"}
        </div>
        <span className="text-[11px] text-slate-500 block">
          Cuenta asociada: <strong className="font-mono">{cuentaActiva?.numero_cuenta}</strong>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onGenerarPin}
          disabled={loadingCodigo}
          className="flex-1 h-11 rounded-xl border-rose-200 text-rose-700 font-bold text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingCodigo ? "animate-spin" : ""}`} />
          Generar Nuevo Pin
        </Button>

        <Button
          type="button"
          disabled={!codigoRetiro}
          onClick={() => {
            if (!codigoRetiro || !cuentaActiva?.numero_cuenta) return;
            saveCajeroHandoff(cuentaActiva.numero_cuenta, codigoRetiro);
            window.location.href = "/cajero";
          }}
          className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
        >
          <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Ir al Cajero con este Pin
        </Button>
      </div>
    </div>
  );
}
