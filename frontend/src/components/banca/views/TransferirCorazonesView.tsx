import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, AlertCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCOP } from "@/lib/formatters";
import { bancaService } from "@/services/bancaService";
import type { Cuenta } from "../types";

interface PendingTransferConfirm {
  cuenta_origen_id: number;
  cuenta_origen_numero: string;
  numero_cuenta_destino: string;
  titular_destino: string;
  tipo_cuenta_destino: string;
  valor: number;
  impuesto: number;
  total_debitar: number;
  concepto: string;
}

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
  const [verificandoDestino, setVerificandoDestino] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingTransferConfirm | null>(null);
  const [reciboTransferencia, setReciboTransferencia] = useState<any>(null);

  const valorNum = parseFloat(montoTransferir) || 0;
  const gmf4x1000 = Math.round(valorNum * 0.004);

  const handleTransferir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuentaActiva) {
      toast.error("No hay una cuenta de origen activa.");
      return;
    }
    const destinoLimpio = cuentaDestino.trim().replace(/\D/g, "");
    if (!destinoLimpio || isNaN(valorNum) || valorNum <= 0) {
      toast.error("Verifica la cuenta destino y el monto a enviar.");
      return;
    }
    if (destinoLimpio === cuentaActiva.numero_cuenta) {
      toast.error("No puedes realizar una transferencia a tu misma cuenta de origen.");
      return;
    }
    if (valorNum > saldoActual) {
      toast.error(`Saldo insuficiente. Disponible en tu cuenta: ${formatCOP(saldoActual)}`);
      return;
    }

    try {
      setVerificandoDestino(true);
      const destinatario = await bancaService.consultarDestinatario(destinoLimpio, cuentaActiva.id);
      setPendingConfirm({
        cuenta_origen_id: cuentaActiva.id,
        cuenta_origen_numero: cuentaActiva.numero_cuenta,
        numero_cuenta_destino: destinatario.numero_cuenta,
        titular_destino: destinatario.titular,
        tipo_cuenta_destino: destinatario.tipo_cuenta,
        valor: valorNum,
        impuesto: gmf4x1000,
        total_debitar: valorNum + gmf4x1000,
        concepto: conceptoTransferir.trim() || "Envío Banco de Corazones",
      });
    } catch (err: any) {
      toast.error(err?.message || "No se pudo verificar la cuenta destino.");
    } finally {
      setVerificandoDestino(false);
    }
  };

  const handleConfirmarTransferencia = async () => {
    if (!pendingConfirm) return;
    try {
      setEnviando(true);
      const data = await bancaService.transferir({
        cuenta_origen_id: pendingConfirm.cuenta_origen_id,
        numero_cuenta_destino: pendingConfirm.numero_cuenta_destino,
        valor: pendingConfirm.valor,
        concepto: pendingConfirm.concepto,
      });
      const detalle = `Enviaste ${formatCOP(pendingConfirm.valor)} a ${pendingConfirm.titular_destino} (${pendingConfirm.numero_cuenta_destino}).`;
      toast.success("Transferencia exitosa", { description: detalle });
      setReciboTransferencia(
        data.comprobante || {
          cuenta_destino: pendingConfirm.numero_cuenta_destino,
          titular_destino: pendingConfirm.titular_destino,
          valor: pendingConfirm.valor,
          impuesto: pendingConfirm.impuesto,
          fecha: new Date().toLocaleString("es-CO"),
        }
      );
      setPendingConfirm(null);
      setCuentaDestino("");
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
          disabled={enviando || verificandoDestino}
          className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm"
        >
          {enviando || verificandoDestino ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {verificandoDestino ? "Verificando cuenta destino..." : "Continuar y Confirmar Envío"}
        </Button>
      </form>

      {/* DIÁLOGO DE CONFIRMACIÓN DE TRANSFERENCIA */}
      <Dialog
        open={Boolean(pendingConfirm)}
        onOpenChange={(open) => {
          if (!open && !enviando) setPendingConfirm(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Confirmar Transferencia
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Revisa los datos antes de autorizar el envío de dinero.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {pendingConfirm && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Destinatario:</span>
                <span className="font-bold text-slate-900 text-right">{pendingConfirm.titular_destino}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Cuenta destino:</span>
                <span className="font-mono font-semibold text-rose-700">
                  {pendingConfirm.numero_cuenta_destino} ({pendingConfirm.tipo_cuenta_destino})
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Cuenta origen:</span>
                <span className="font-mono text-slate-700">{pendingConfirm.cuenta_origen_numero}</span>
              </div>
              <div className="border-t border-rose-200/70 pt-2 flex justify-between gap-2 text-sm font-bold">
                <span className="text-slate-700">Monto a enviar:</span>
                <span className="font-mono text-emerald-700">{formatCOP(pendingConfirm.valor)}</span>
              </div>
              <div className="flex justify-between gap-2 text-[11px] text-slate-500">
                <span>Concepto:</span>
                <span className="text-slate-700">{pendingConfirm.concepto}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={enviando}
              onClick={() => {
                setPendingConfirm(null);
                toast.info("Transferencia cancelada.");
              }}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <X className="h-4 w-4 mr-1.5" />
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={enviando}
              onClick={handleConfirmarTransferencia}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {enviando ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
              Sí, Confirmar Envío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
