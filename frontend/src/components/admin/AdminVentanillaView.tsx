import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign, CheckCircle2, RefreshCw, Printer,
  UserCheck, ShieldCheck, Wallet, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

interface AdminVentanillaViewProps {
  onConsignar: (cuenta: string, valor: string, concepto: string) => Promise<any>;
  clientes?: any[];
  cuentaPreseleccionada?: string;
  onVolverDashboard?: () => void;
}

export function AdminVentanillaView({
  onConsignar,
  clientes = [],
  cuentaPreseleccionada = "",
  onVolverDashboard,
}: AdminVentanillaViewProps) {
  const [cuenta, setCuenta] = useState(cuentaPreseleccionada || "");
  const [monto, setMonto] = useState("100000");
  const [concepto, setConcepto] = useState("Consignación en efectivo por ventanilla");
  const [loading, setLoading] = useState(false);
  const [recibo, setRecibo] = useState<any>(null);

  useEffect(() => {
    if (cuentaPreseleccionada) {
      setCuenta(cuentaPreseleccionada);
    }
  }, [cuentaPreseleccionada]);

  const cuentasActivas =
    clientes.filter((c) => {
      const est = c.estado_cuenta || c.estado || c.estado_cliente || (c.estado_id === 1 ? "ACTIVO" : "BLOQUEADO");
      return (est === "ACTIVO" || est === "ACTIVA") && c.numero_cuenta;
    }).length > 0
      ? clientes
          .filter((c) => {
            const est = c.estado_cuenta || c.estado || c.estado_cliente || (c.estado_id === 1 ? "ACTIVO" : "BLOQUEADO");
            return (est === "ACTIVO" || est === "ACTIVA") && c.numero_cuenta;
          })
          .map((c) => ({
            nombre: `${c.nombres} ${c.apellidos}`,
            cuenta: c.numero_cuenta,
            doc: c.numero_documento,
            saldo: c.saldo,
          }))
      : [
          { nombre: "Valentina Leal", cuenta: "700111223344", doc: "1001112233" },
          { nombre: "Sergio Ramos", cuenta: "700222334455", doc: "1002223344" },
          { nombre: "Dana Manrique", cuenta: "700333445566", doc: "1003334455" },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuenta.trim()) {
      toast.error("Ingrese o seleccione el número de cuenta.");
      return;
    }
    const val = parseFloat(monto);
    if (isNaN(val) || val <= 0) {
      toast.error("El valor a consignar debe ser mayor a cero.");
      return;
    }

    setLoading(true);
    const rec = await onConsignar(cuenta.trim(), monto, concepto);
    setLoading(false);
    if (rec) {
      setRecibo(rec);
      toast.success("Consignación aplicada con éxito.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#142038] pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Ventanilla de Caja y Depósitos</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inyección directa de fondos en efectivo a cuentas bancarias con emisión de comprobante de caja.
          </p>
        </div>
        {onVolverDashboard && (
          <button
            type="button"
            onClick={onVolverDashboard}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#1e3154] bg-[#0b1528] hover:bg-[#132342] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al Dashboard</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* FORMULARIO DE CONSIGNACIÓN */}
        <div className="lg:col-span-7 rounded-3xl border border-[#1b2c4d] bg-[#0a1324] p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Recepción de Efectivo</h3>
              <p className="text-xs text-slate-400">Canal: Ventanilla Administrativa Central</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs text-slate-300">Número de Cuenta Destino *</Label>
              <Input
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
                placeholder="Ej: 400110203040"
                required
                className="mt-1 font-mono text-sm bg-[#070d19] border-[#1d2e50] text-rose-300 tracking-wider h-11"
              />

              {/* CUENTAS ACTIVAS DEL SISTEMA */}
              <div className="mt-3">
                <span className="text-[11px] text-slate-400 font-medium">
                  Seleccionar titular activo del directorio:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 max-h-44 overflow-y-auto pr-1">
                  {cuentasActivas.map((c) => (
                    <button
                      key={c.cuenta}
                      type="button"
                      onClick={() => setCuenta(c.cuenta)}
                      className={`flex items-center gap-2.5 rounded-2xl border p-2.5 text-left text-xs transition-all ${
                        cuenta === c.cuenta
                          ? "border-[#e11d48] bg-rose-500/15 text-white shadow-md shadow-rose-600/15"
                          : "border-[#172642] bg-[#08101f] text-slate-400 hover:text-white hover:border-[#243b66]"
                      }`}
                    >
                      <UserCheck className="h-4 w-4 shrink-0 text-rose-400" />
                      <div className="truncate">
                        <p className="font-semibold truncate text-white">{c.nombre}</p>
                        <p className="font-mono text-[10px] text-slate-400">{c.cuenta}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300">Valor en Efectivo a Consignar (COP) *</Label>
              <Input
                type="number"
                step="5000"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
                className="mt-1 font-mono text-lg font-bold bg-[#070d19] border-[#1d2e50] text-emerald-400 h-11"
              />

              <div className="mt-2 flex flex-wrap gap-1.5">
                {[50000, 100000, 200000, 500000, 1000000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMonto(v.toString())}
                    className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-all ${
                      monto === v.toString()
                        ? "bg-[#e11d48] text-white font-bold shadow-md shadow-rose-600/25"
                        : "border border-[#1a2b4a] bg-[#08101f] text-slate-300 hover:bg-[#111e36]"
                    }`}
                  >
                    {fmt(v)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300">Concepto del Depósito</Label>
              <Input
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="mt-1 text-xs bg-[#070d19] border-[#1d2e50] h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 h-11 rounded-2xl bg-[#e11d48] hover:bg-[#0b63d6] text-white font-semibold text-xs shadow-lg shadow-rose-600/25"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
              Acreditar Fondos en Cuenta
            </Button>
          </form>
        </div>

        {/* COMPROBANTE DE CONSIGNACIÓN */}
        <div className="lg:col-span-5 rounded-3xl border border-[#1b2c4d] bg-[#0a1324] p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          {recibo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#15223a] pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-display font-bold text-base">Comprobante de Caja</span>
                </div>
                <span className="font-mono text-xs text-slate-400">#{recibo.id_movimiento || "OK"}</span>
              </div>

              <div className="rounded-2xl bg-[#070d19] p-4 font-mono text-xs space-y-2.5 border border-[#172642]">
                <div className="flex justify-between">
                  <span className="text-slate-400">FECHA Y HORA:</span>
                  <span className="text-slate-200">{new Date().toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CUENTA DESTINO:</span>
                  <span className="text-rose-400 font-bold">{recibo.cuenta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TITULAR:</span>
                  <span className="text-white font-semibold">{recibo.titular}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CONCEPTO:</span>
                  <span className="text-slate-300 text-right">{recibo.concepto}</span>
                </div>
                <div className="border-t border-[#15223a] pt-2.5 flex justify-between text-sm">
                  <span className="text-slate-300 font-bold">VALOR CONSIGNADO:</span>
                  <span className="text-emerald-400 font-bold">+{fmt(recibo.valor_consignado)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">NUEVO SALDO EN CUENTA:</span>
                  <span className="text-amber-300 font-bold">{fmt(recibo.nuevo_saldo)}</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => window.print()}
                className="w-full gap-2 text-xs rounded-xl border-[#1e3154] bg-[#0d172b] hover:bg-[#132342]"
              >
                <Printer className="h-4 w-4" /> Imprimir Timbre de Caja
              </Button>
            </div>
          ) : (
            <div className="my-auto text-center py-12 space-y-3 text-slate-400">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#0e1b33] border border-[#1e3154] text-rose-400">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h4 className="font-display text-base font-bold text-slate-200">
                Terminal de Timbre Bancario
              </h4>
              <p className="text-xs max-w-xs mx-auto leading-relaxed">
                Seleccione o digite una cuenta activa a la izquierda para acreditar efectivo en tiempo real y emitir el soporte de ventanilla.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
