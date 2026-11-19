import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCOP } from "@/lib/formatters";
import { bancaService } from "@/services/bancaService";
import type { Cuenta } from "../types";

interface TransferirCorazonesViewProps {
  cuentaActiva: Cuenta | null;
  saldoActual: number;
  onTransferSuccess: () => void;
  onNotify: (title: string, detail: string) => void;
}

export function TransferirCorazonesView({
  cuentaActiva,
  saldoActual,
  onTransferSuccess,
  onNotify,
}: TransferirCorazonesViewProps) {
  const [cuentaDestino, setCuentaDestino] = useState("");
  const [montoTransferir, setMontoTransferir] = useState("");
  const [conceptoTransferir, setConceptoTransferir] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [reciboTransferencia, setReciboTransferencia] = useState<any>(null);

  const valorNum = parseFloat(montoTransferir) || 0;
  const gmf4x1000 = Math.round(valorNum * 0.004);

  const handleTransferir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuentaDestino.trim() || isNaN(valorNum) || valorNum <= 0) {
      toast.error("Verifica la cuenta destino y el monto a enviar.");
      return;
    }

    try {
      setEnviando(true);
      const data = await bancaService.transferir({
        cuenta_origen_id: cuentaActiva?.id,
        numero_cuenta_destino: cuentaDestino.trim(),
        valor: valorNum,
        concepto: conceptoTransferir.trim() || "Envío Banco de Corazones",
      });
      const detalle = `Enviaste ${formatCOP(valorNum)} a la cuenta ${cuentaDestino.trim()}${
        data.comprobante?.titular_destino ? ` (${data.comprobante.titular_destino})` : ""
      }.`;
      toast.success("Transferencia exitosa", { description: detalle });
      onNotify("Transferencia exitosa", detalle);
      setReciboTransferencia(
        data.comprobante || {
          cuenta_destino: cuentaDestino.trim(),
          valor: valorNum,
          impuesto: gmf4x1000,
          fecha: new Date().toLocaleString("es-CO"),
        }
      );
      setMontoTransferir("");
      setConceptoTransferir("");
      onTransferSuccess();
    } catch (err: any) {
      toast.error(err?.message || "No se pudo realizar la transferencia.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">Enviar Dinero a Otra Cuenta</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Disponible en tu cuenta: <strong className="text-rose-600">{formatCOP(saldoActual)}</strong>
        </p>
      </div>

      {reciboTransferencia && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Comprobante de Transferencia Exitosa
          </div>
          {reciboTransferencia.numero_operacion && (
            <p>Operación: <strong className="font-mono">#{reciboTransferencia.numero_operacion}</strong></p>
          )}
          <p>
            Cuenta destino:{" "}
            <strong className="font-mono">
              {reciboTransferencia.cuenta_destino || reciboTransferencia.destino}
            </strong>
          </p>
          {reciboTransferencia.titular_destino && (
            <p>Destinatario: <strong>{reciboTransferencia.titular_destino}</strong></p>
          )}
          <p>Monto enviado: <strong>{formatCOP(reciboTransferencia.valor)}</strong></p>
          {reciboTransferencia.nuevo_saldo !== undefined && (
            <p>Nuevo saldo disponible: <strong className="text-emerald-700">{formatCOP(reciboTransferencia.nuevo_saldo)}</strong></p>
          )}
        </div>
      )}

      <form onSubmit={handleTransferir} className="space-y-4">
        <div>
          <Label className="text-xs font-semibold text-slate-700">Número de Cuenta Destino</Label>
          <Input
            value={cuentaDestino}
            onChange={(e) => setCuentaDestino(e.target.value)}
            placeholder="Ej: 700222334455"
            required
            className="mt-1.5 h-11 bg-slate-50 border-slate-300 font-mono text-sm text-slate-900"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold text-slate-700">Valor a Enviar (COP)</Label>
          <Input
            type="number"
            min="1000"
            step="1000"
            value={montoTransferir}
            onChange={(e) => setMontoTransferir(e.target.value)}
            placeholder="Ej: 50000"
            required
            className="mt-1.5 h-11 bg-slate-50 border-slate-300 font-mono text-sm text-slate-900"
          />
          {valorNum > 0 && (
            <p className="mt-1.5 text-[11px] text-slate-500">
              Gravamen 4x1000: <strong>{formatCOP(gmf4x1000)}</strong> · Total a descontar:{" "}
              <strong className="text-rose-600">{formatCOP(valorNum + gmf4x1000)}</strong>
            </p>
          )}
        </div>

        <div>
          <Label className="text-xs font-semibold text-slate-700">Concepto o Mensaje</Label>
          <Input
            value={conceptoTransferir}
            onChange={(e) => setConceptoTransferir(e.target.value)}
            placeholder="Ej: Pago de almuerzo / Ahorro"
            className="mt-1.5 h-11 bg-slate-50 border-slate-300 text-sm text-slate-900"
          />
        </div>

        <Button
          type="submit"
          disabled={enviando}
          className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm"
        >
          {enviando ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
          Confirmar Envío de Dinero
        </Button>
      </form>
    </div>
  );
}
