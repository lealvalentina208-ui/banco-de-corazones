import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CreditCard, Heart, ShieldCheck, CheckCircle2, RefreshCw,
  LogOut, KeyRound, Printer, Wallet, ListOrdered
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export function CajeroAtmView() {
  const [autenticado, setAutenticado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cuentaNumero, setCuentaNumero] = useState("");
  const [pin, setPin] = useState("");
  const [cuentaInfo, setCuentaInfo] = useState<any>(null);

  const [pantalla, setPantalla] = useState<"menu" | "saldo" | "retirar" | "movimientos" | "recibo">("menu");
  const [otroValor, setOtroValor] = useState("");
  const [recibo, setRecibo] = useState<any>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);

  useEffect(() => {
    checkSesion();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cParam = params.get("cuenta");
      const codParam = params.get("codigo");
      if (cParam && cParam !== "null" && cParam !== "undefined") {
        setCuentaNumero(cParam.trim());
      }
      if (codParam && codParam !== "null" && codParam !== "undefined" && /^\d{4,6}$/.test(codParam.trim())) {
        setPin(codParam.trim());
        toast.info("Pin de retiro cargado automáticamente.");
      }
    }
  }, []);

  const checkSesion = async () => {
    try {
      const res = await fetch("/api/cajero/saldo", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCuentaInfo(data.cuenta || data);
        setAutenticado(true);
      }
    } catch (err) {
      // Sin sesión
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cuentaNumero.trim() || !pin.trim()) {
      toast.error("Ingrese su número de cuenta/documento y su PIN o código.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login-cajero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_cuenta: cuentaNumero.trim(), pin: pin.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Credenciales inválidas en cajero.");
        return;
      }
      toast.success("Bienvenido al Dispensador de Banco de Corazones.");
      setCuentaInfo(data.cuenta);
      setAutenticado(true);
      setPantalla("menu");
    } catch (err) {
      toast.error("Error de comunicación con el dispensador.");
    } finally {
      setLoading(false);
    }
  };

  const ejecutarRetiro = async (valor: number) => {
    if (!valor || valor <= 0 || valor % 10000 !== 0) {
      toast.error("El monto debe ser múltiplo de $10.000 COP.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/cajero/retirar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, codigoOtp: pin.trim() || "1234" }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo realizar el retiro.");
        return;
      }
      toast.success(data.mensaje || "Efectivo dispensado.");
      setRecibo(data.recibo);
      setCuentaInfo((prev: any) => ({ ...prev, saldo: data.recibo.nuevo_saldo }));
      setPantalla("recibo");
    } catch (err) {
      toast.error("Error al dispensar dinero.");
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cajero/movimientos", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMovimientos(data.movimientos || []);
        setPantalla("movimientos");
      }
    } catch (err) {
      toast.error("Error al consultar movimientos.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setAutenticado(false);
    setCuentaInfo(null);
    setPantalla("menu");
    setRecibo(null);
    toast.info("Sesión de cajero finalizada.");
  };

  return (
    <div className="min-h-screen bg-[#f8f4f6] text-slate-800 font-sans">
      {/* CABECERA ROJA CARMESÍ */}
      <header className="bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md px-4 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 fill-rose-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Dispensador de Efectivo — Banco de Corazones</h1>
              <p className="text-xs text-rose-100">Red Cooperativa · Valentina Leal · Sergio Ramos · Dana Manrique</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              Sucursal Personas
            </a>
            <a
              href="/admin"
              className="rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Administración
            </a>
            {autenticado && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-white text-rose-700 hover:bg-rose-50 px-3 py-1.5 text-xs font-bold flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" /> Salir
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!autenticado ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* GUÍA DE USO DEL DISPENSADOR */}
            <div className="md:col-span-5 rounded-2xl bg-white border border-rose-200 p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-rose-600 uppercase tracking-wider">
                Instrucciones de Retiro Seguro
              </h2>
              <p className="text-xs text-slate-500">
                Puedes retirar efectivo con tu tarjeta débito o mediante Pin temporal de 6 dígitos generado en la Sucursal Virtual:
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                  <strong className="block text-slate-900">1. Identificación de Cuenta</strong>
                  <span className="text-slate-500">Ingresa tu número de cuenta bancaria o documento de identidad.</span>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                  <strong className="block text-slate-900">2. Validación de Seguridad</strong>
                  <span className="text-slate-500">Digita tu PIN de 4 dígitos o tu Pin OTP de 6 dígitos en el teclado numérico.</span>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                  <strong className="block text-slate-900">3. Dispensación y Tirilla</strong>
                  <span className="text-slate-500">Selecciona el monto en múltiplos de $10.000 COP y conserva tu comprobante.</span>
                </div>
              </div>
            </div>

            {/* TERMINAL DE ACCESO CAJERO EN MODO CLARO */}
            <div className="md:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 shadow-lg">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Ingreso al Cajero Automático</h2>
                  <p className="text-xs text-slate-500">Digita tu cuenta y tu PIN de 4 dígitos (o Pin OTP de 6 dígitos)</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Número de Cuenta o Documento</Label>
                  <Input
                    value={cuentaNumero}
                    onChange={(e) => setCuentaNumero(e.target.value)}
                    placeholder="Ej: 700111223344"
                    className="mt-1.5 h-11 bg-slate-50 border-slate-300 font-mono text-center text-base text-slate-900"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">PIN de 4 dígitos o Pin de Retiro (6 dígitos)</Label>
                  <Input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="mt-1.5 h-11 bg-slate-50 border-slate-300 font-mono text-center text-xl tracking-[0.3em] text-rose-600 font-bold"
                  />
                </div>

                {/* TECLADO NUMÉRICO CLARO */}
                <div className="grid grid-cols-3 gap-2 pt-1 max-w-xs mx-auto">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => pin.length < 6 && setPin((p) => p + n)}
                      className="h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 font-mono text-base font-bold text-slate-800 transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPin("")}
                    className="h-11 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => pin.length < 6 && setPin((p) => p + "0")}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 font-mono text-base font-bold text-slate-800"
                  >
                    0
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white"
                  >
                    Entrar
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm mt-2"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                  Validar e Ingresar al Cajero
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-lg space-y-6">
            {/* CABECERA DE SESIÓN ACTIVA EN CAJERO */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-rose-600">Titular de la Cuenta</span>
                <h2 className="text-xl font-extrabold text-slate-900">{cuentaInfo?.titular}</h2>
                <p className="text-xs text-slate-500 font-mono">Cuenta No. {cuentaInfo?.numero_cuenta}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Disponible para Retiro</span>
                <strong className="text-2xl font-extrabold text-emerald-600">
                  {fmt(Number(cuentaInfo?.saldo) || 0)}
                </strong>
              </div>
            </div>

            {pantalla === "menu" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPantalla("retirar")}
                  className="rounded-2xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-100 p-6 text-left transition-all"
                >
                  <Wallet className="h-7 w-7 text-rose-600 mb-2" />
                  <strong className="block text-base text-slate-900">Retirar Efectivo</strong>
                  <span className="text-xs text-slate-600">Billetes en múltiplos de $10.000</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPantalla("saldo")}
                  className="rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 p-6 text-left transition-all"
                >
                  <CreditCard className="h-7 w-7 text-rose-600 mb-2" />
                  <strong className="block text-base text-slate-900">Consultar Saldo</strong>
                  <span className="text-xs text-slate-600">Ver detalle de tu cuenta</span>
                </button>

                <button
                  type="button"
                  onClick={cargarMovimientos}
                  className="rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 p-6 text-left transition-all"
                >
                  <ListOrdered className="h-7 w-7 text-rose-600 mb-2" />
                  <strong className="block text-base text-slate-900">Últimos Movimientos</strong>
                  <span className="text-xs text-slate-600">Ver las últimas 5 transacciones</span>
                </button>
              </div>
            )}

            {pantalla === "saldo" && (
              <div className="text-center py-6 space-y-4">
                <p className="text-xs uppercase font-bold text-slate-500">Saldo Disponible en Cuenta</p>
                <div className="text-4xl font-extrabold text-slate-900">{fmt(Number(cuentaInfo?.saldo) || 0)}</div>
                <Button onClick={() => setPantalla("menu")} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Volver al Menú Principal
                </Button>
              </div>
            )}

            {pantalla === "retirar" && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-slate-900">Selecciona el Monto a Retirar:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[20000, 50000, 100000, 150000, 250000, 400000].map((m) => (
                    <button
                      key={m}
                      type="button"
                      disabled={loading}
                      onClick={() => ejecutarRetiro(m)}
                      className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white py-3.5 px-4 font-mono text-sm font-bold text-rose-700 transition-all"
                    >
                      {fmt(m)}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                  <Input
                    type="number"
                    step="10000"
                    value={otroValor}
                    onChange={(e) => setOtroValor(e.target.value)}
                    placeholder="Otro valor (Ej: 80000)"
                    className="h-11 bg-slate-50 border-slate-300 font-mono text-sm text-slate-900"
                  />
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => ejecutarRetiro(Number(otroValor))}
                    className="h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold px-6"
                  >
                    Dispensar Dinero
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setPantalla("menu")} className="h-11">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {pantalla === "movimientos" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Últimos Movimientos de la Cuenta</h3>
                <div className="divide-y divide-slate-100">
                  {movimientos.map((m, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block">{m.descripcion || m.tipo_operacion}</strong>
                        <span className="text-slate-500">{new Date(m.fecha).toLocaleString("es-CO")}</span>
                      </div>
                      <span className={`font-mono font-bold ${m.sentido === "CREDITO" ? "text-emerald-600" : "text-rose-600"}`}>
                        {m.sentido === "CREDITO" ? "+" : "-"}
                        {fmt(Number(m.valor))}
                      </span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setPantalla("menu")} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Volver al Menú
                </Button>
              </div>
            )}

            {pantalla === "recibo" && recibo && (
              <div className="max-w-md mx-auto rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/40 p-6 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-extrabold text-slate-900">Tirilla de Retiro — Banco de Corazones</h3>
                <div className="text-xs text-slate-700 space-y-1 font-mono bg-white p-4 rounded-xl border border-rose-100 text-left">
                  <p>FECHA: {recibo.fecha || new Date().toLocaleString("es-CO")}</p>
                  <p>CUENTA: {recibo.numero_cuenta}</p>
                  <p>VALOR RETIRADO: {fmt(Number(recibo.valor_retirado))}</p>
                  <p>IMPUESTO 4x1000: {fmt(Number(recibo.impuesto_4x1000 || 0))}</p>
                  <p className="font-bold text-rose-700 pt-1 border-t border-slate-100">
                    NUEVO SALDO: {fmt(Number(recibo.nuevo_saldo))}
                  </p>
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <Button onClick={() => window.print()} variant="outline" className="text-xs">
                    <Printer className="h-3.5 w-3.5 mr-1.5" /> Imprimir
                  </Button>
                  <Button onClick={() => setPantalla("menu")} className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
                    Otro Servicio
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
