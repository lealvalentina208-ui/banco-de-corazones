import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Cuenta, Movimiento, Usuario } from "./types";
import { BancaLogin } from "./BancaLogin";
import {
  Heart, Wallet, ArrowLeftRight, CreditCard, KeyRound,
  LogOut, Copy, Check, RefreshCw, ShieldCheck, ArrowUpRight,
  ArrowDownLeft, Search, CheckCircle2, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export function BancaVirtualView() {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cuentaActiva, setCuentaActiva] = useState<Cuenta | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"resumen" | "transferir" | "pin" | "extracto">("resumen");
  const [loginLoading, setLoginLoading] = useState(false);

  // Estado de Transferencia
  const [cuentaDestino, setCuentaDestino] = useState("");
  const [montoTransferir, setMontoTransferir] = useState("");
  const [conceptoTransferir, setConceptoTransferir] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [reciboTransferencia, setReciboTransferencia] = useState<any>(null);

  // Estado de Pin de Retiro
  const [codigoRetiro, setCodigoRetiro] = useState<string | null>(null);
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/banca/resumen", { credentials: "include" });
      if (res.status === 401) {
        setUsuario(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.usuario) {
        setUsuario(data.usuario);
        setCuentas(data.cuentas || []);
        if (data.cuentas && data.cuentas.length > 0) {
          const cuentaActual = data.cuentas[0];
          setCuentaActiva(cuentaActual);
          cargarMovimientos(cuentaActual.id);
        }
      }
    } catch (err) {
      toast.error("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async (cuentaId: number) => {
    try {
      const res = await fetch(`/api/banca/movimientos?cuenta_id=${cuentaId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMovimientos(data.movimientos || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  const handleLogin = async (identificador: string, pass: string) => {
    try {
      setLoginLoading(true);
      const res = await fetch("/api/auth/login-cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador, password: pass }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Credenciales incorrectas.");
        return;
      }
      toast.success(`Hola de nuevo, ${data.usuario.nombres}`);
      cargarResumen();
    } catch (err) {
      toast.error("Error al iniciar sesión.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUsuario(null);
      setCuentas([]);
      setCuentaActiva(null);
      setMovimientos([]);
      setActiveTab("resumen");
      toast.info("Has salido de tu sucursal virtual.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransferir = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(montoTransferir);
    if (!cuentaDestino.trim() || isNaN(valorNum) || valorNum <= 0) {
      toast.error("Verifica la cuenta destino y el monto a enviar.");
      return;
    }

    try {
      setEnviando(true);
      const res = await fetch("/api/banca/transferir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuenta_origen_id: cuentaActiva?.id,
          numero_cuenta_destino: cuentaDestino.trim(),
          valor: valorNum,
          descripcion: conceptoTransferir.trim() || "Envío Banco de Corazones",
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo realizar la transferencia.");
        return;
      }
      toast.success("¡Transferencia enviada con éxito!");
      setReciboTransferencia(data.comprobante || {
        destino: cuentaDestino,
        valor: valorNum,
        impuesto: Math.round(valorNum * 0.004),
        fecha: new Date().toLocaleString("es-CO"),
      });
      setMontoTransferir("");
      setConceptoTransferir("");
      cargarResumen();
    } catch (err) {
      toast.error("Error de red al transferir.");
    } finally {
      setEnviando(false);
    }
  };

  const handleGenerarPin = async () => {
    try {
      setLoadingCodigo(true);
      const res = await fetch("/api/banca/generar-codigo-retiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuenta_id: cuentaActiva?.id,
          numero_cuenta: cuentaActiva?.numero_cuenta,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.codigo) {
        setCodigoRetiro(data.codigo);
        toast.success("Pin de retiro generado por 30 minutos.");
      } else {
        toast.error(data.error || "No se pudo generar el pin.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoadingCodigo(false);
    }
  };

  const copiarTexto = (txt: string) => {
    navigator.clipboard?.writeText(txt);
    setCopiado(true);
    toast.success(`Copiado: ${txt}`);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50/50 flex flex-col items-center justify-center text-slate-600">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-rose-600 border-t-transparent" />
        <span className="mt-3 text-xs font-semibold text-rose-700">Cargando Banco de Corazones...</span>
      </div>
    );
  }

  if (!usuario) {
    return <BancaLogin onLogin={handleLogin} loading={loginLoading} />;
  }

  const saldoActual = Number(cuentaActiva?.saldo) || 0;
  const valorNum = parseFloat(montoTransferir) || 0;
  const gmf4x1000 = Math.round(valorNum * 0.004);

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
    <div className="min-h-screen bg-[#f8f4f6] text-slate-800">
      {/* CABECERA SUPERIOR ROJA CARMESÍ (SIN SIDEBAR LATERAL) */}
      <header className="bg-gradient-to-r from-rose-600 via-rose-600 to-pink-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 fill-rose-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Banco de Corazones</h1>
              <p className="text-xs text-rose-100">
                Sucursal Personas · {usuario.nombres} {usuario.apellidos}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/cajero"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5" /> Cajero ATM
            </a>
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white text-rose-700 hover:bg-rose-50 px-3 py-1.5 text-xs font-bold shadow-sm transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>

        {/* BARRA DE PESTAÑAS HORIZONTAL */}
        <div className="bg-white border-b border-rose-100 text-slate-700">
          <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto gap-2 py-2">
            {[
              { id: "resumen", label: "Mi Cuenta y Resumen", icon: Wallet },
              { id: "transferir", label: "Enviar Dinero", icon: ArrowLeftRight },
              { id: "pin", label: "Pin de Retiro Cajero", icon: KeyRound },
              { id: "extracto", label: "Historial de Movimientos", icon: Search },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ============================================================ */}
        {/* PESTAÑA 1: RESUMEN GENERAL EN 2 COLUMNAS                     */}
        {/* ============================================================ */}
        {activeTab === "resumen" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COLUMNA IZQUIERDA: TARJETA DE CUENTA Y ACCESOS */}
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
                    {fmt(saldoActual)}
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

              {/* DATOS DEL TITULAR */}
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
                    onClick={() => setActiveTab("transferir")}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-10 rounded-xl"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" /> Enviar Dinero
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActiveTab("pin");
                      handleGenerarPin();
                    }}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold h-10 rounded-xl"
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Retirar en Cajero
                  </Button>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: ÚLTIMOS MOVIMIENTOS DE LA CUENTA */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Movimientos Recientes</h2>
                    <p className="text-xs text-slate-500">Últimas operaciones registradas en tu cuenta</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => cargarResumen()}
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
                                {new Date(m.fecha).toLocaleString("es-CO")} · {m.canal}
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
                              {fmt(Number(m.valor))}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              Saldo: {fmt(Number(m.saldo_resultante))}
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
        )}

        {/* ============================================================ */}
        {/* PESTAÑA 2: ENVIAR DINERO / TRANSFERENCIAS                    */}
        {/* ============================================================ */}
        {activeTab === "transferir" && (
          <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Enviar Dinero a Otra Cuenta</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Disponible en tu cuenta: <strong className="text-rose-600">{fmt(saldoActual)}</strong>
              </p>
            </div>

            {reciboTransferencia && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Comprobante de Envío Exitoso
                </div>
                <p>Cuenta destino: <strong className="font-mono">{reciboTransferencia.destino}</strong></p>
                <p>Monto enviado: <strong>{fmt(reciboTransferencia.valor)}</strong></p>
                <p>Impuesto 4x1000: <strong>{fmt(reciboTransferencia.impuesto)}</strong></p>
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
                    Gravamen 4x1000: <strong>{fmt(gmf4x1000)}</strong> · Total a descontar:{" "}
                    <strong className="text-rose-600">{fmt(valorNum + gmf4x1000)}</strong>
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
        )}

        {/* ============================================================ */}
        {/* PESTAÑA 3: PIN DE RETIRO PARA CAJERO                         */}
        {/* ============================================================ */}
        {activeTab === "pin" && (
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
                onClick={handleGenerarPin}
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
                  if (!codigoRetiro) return;
                  window.location.href = `/cajero?cuenta=${encodeURIComponent(
                    cuentaActiva?.numero_cuenta || ""
                  )}&codigo=${encodeURIComponent(codigoRetiro)}`;
                }}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Ir al Cajero con este Pin
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PESTAÑA 4: HISTORIAL COMPLETO DE MOVIMIENTOS                 */}
        {/* ============================================================ */}
        {activeTab === "extracto" && (
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
                            {new Date(m.fecha).toLocaleString("es-CO")}
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
                            {fmt(Number(m.valor))}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            {fmt(Number(m.saldo_resultante))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
