import { useState } from "react";
import {
  Heart, RefreshCw, UserPlus, LogIn, Eye, EyeOff,
  CheckCircle2, CreditCard, ShieldCheck, Users, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BancaLoginProps {
  onLogin: (identificador: string, password: string) => Promise<void>;
  loading: boolean;
}

export function BancaLogin({ onLogin, loading }: BancaLoginProps) {
  const [tab, setTab] = useState<"login" | "registro">("login");

  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [regData, setRegData] = useState({
    tipo_documento_id: 1,
    numero_documento: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    tipo_cuenta_id: 1,
    saldo_inicial: "",
    password: "",
    password_confirm: "",
    pin_cajero: "",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [cuentaCreada, setCuentaCreada] = useState<any>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador.trim() || !password) {
      toast.error("Ingrese su documento o correo y contraseña.");
      return;
    }
    onLogin(identificador.trim(), password);
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.numero_documento.trim() || !regData.nombres.trim() || !regData.apellidos.trim() || !regData.correo.trim()) {
      toast.error("Complete todos los campos obligatorios.");
      return;
    }
    if (regData.password.length < 6) {
      toast.error("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }
    if (regData.password !== regData.password_confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    const pin = regData.pin_cajero.trim();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error("El PIN de cajero debe ser de 4 números.");
      return;
    }

    try {
      setRegLoading(true);
      const res = await fetch("/api/auth/registro-cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_documento_id: regData.tipo_documento_id,
          numero_documento: regData.numero_documento.trim(),
          nombres: regData.nombres.trim(),
          apellidos: regData.apellidos.trim(),
          correo: regData.correo.trim(),
          telefono: regData.telefono.trim(),
          tipo_cuenta_id: regData.tipo_cuenta_id,
          saldo_inicial: parseFloat(regData.saldo_inicial) || 0,
          password: regData.password,
          pin_cajero: pin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo abrir la cuenta.");
        return;
      }

      toast.success(data.mensaje);
      setCuentaCreada(data.cuenta);
      setIdentificador(regData.numero_documento.trim());
      setPassword(regData.password);
      setTab("login");
    } catch (err) {
      toast.error("Error de conexión.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-rose-50 via-[#fff9fa] to-slate-100 flex flex-col">
      {/* BARRA SUPERIOR INSTITUCIONAL ROJA / BLANCA */}
      <header className="bg-white border-b border-rose-100 shadow-sm px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 leading-none block">Banco de Corazones</span>
              <span className="text-[11px] text-rose-600 font-medium">Banca Personas & Ahorro Solidario</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/cajero"
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5" /> Cajero Automático
            </a>
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-rose-600" /> Administración
            </a>
          </div>
        </div>
      </header>

      {/* CUERPO EN 2 COLUMNAS (HERO IZQUIERDO + FORMULARIO DERECHO) */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* COLUMNA IZQUIERDA: BIENVENIDA E INTEGRANTES */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3.5 py-1 text-xs font-bold text-rose-700">
            <Heart className="h-3.5 w-3.5 fill-rose-600 text-rose-600" />
            <span>Plataforma Bancaria Web</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Tu dinero seguro, cercano y <span className="text-rose-600">con corazón.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            Bienvenido a la sucursal virtual de <strong>Banco de Corazones</strong>. Consulta tu saldo en línea, envía dinero sin filas y genera pines de retiro para nuestra red de cajeros.
          </p>
        </div>

        {/* COLUMNA DERECHA: TARJETA BLANCA DE LOGIN / REGISTRO */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            {/* CABECERA ROJA DEL FORMULARIO */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-5 text-white">
              <h2 className="text-lg font-bold">Sucursal Virtual Personas</h2>
              <p className="text-xs text-rose-100 mt-0.5">
                Ingresa tus datos o abre tu cuenta de ahorros en línea
              </p>
            </div>

            <div className="p-6">
              {/* PESTAÑAS */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-xs font-bold mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setCuentaCreada(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                    tab === "login"
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" /> Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setTab("registro")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                    tab === "registro"
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" /> Crear Cuenta
                </button>
              </div>

              {tab === "login" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {cuentaCreada && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> ¡Cuenta creada con éxito!
                      </div>
                      <p>Documento: <strong className="font-mono">{cuentaCreada.numero_documento}</strong></p>
                      <p>No. Cuenta: <strong className="font-mono">{cuentaCreada.numero_cuenta}</strong></p>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">
                      Número de Documento, Cuenta o Correo
                    </Label>
                    <Input
                      type="text"
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="Ej: 1001112233"
                      required
                      className="mt-1.5 h-11 bg-slate-50 border-slate-300 text-slate-900 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">Contraseña</Label>
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                      >
                        {showLoginPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        {showLoginPass ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                    <Input
                      type={showLoginPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="mt-1.5 h-11 bg-slate-50 border-slate-300 text-slate-900 font-mono text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Ingresar a mi Cuenta
                  </Button>
                </form>
              )}

              {tab === "registro" && (
                <form onSubmit={handleRegistroSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Tipo</Label>
                      <select
                        value={regData.tipo_documento_id}
                        onChange={(e) => setRegData({ ...regData, tipo_documento_id: Number(e.target.value) })}
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs text-slate-900"
                      >
                        <option value={1}>CC</option>
                        <option value={2}>CE</option>
                        <option value={3}>PAS</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[11px] font-semibold text-slate-700">Documento</Label>
                      <Input
                        value={regData.numero_documento}
                        onChange={(e) => setRegData({ ...regData, numero_documento: e.target.value })}
                        placeholder="1005678901"
                        required
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Nombres</Label>
                      <Input
                        value={regData.nombres}
                        onChange={(e) => setRegData({ ...regData, nombres: e.target.value })}
                        placeholder="Valentina"
                        required
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Apellidos</Label>
                      <Input
                        value={regData.apellidos}
                        onChange={(e) => setRegData({ ...regData, apellidos: e.target.value })}
                        placeholder="Leal"
                        required
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Correo</Label>
                      <Input
                        type="email"
                        value={regData.correo}
                        onChange={(e) => setRegData({ ...regData, correo: e.target.value })}
                        placeholder="cliente@corazones.com"
                        required
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Teléfono</Label>
                      <Input
                        value={regData.telefono}
                        onChange={(e) => setRegData({ ...regData, telefono: e.target.value })}
                        placeholder="3101234567"
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Tipo de Cuenta</Label>
                      <select
                        value={regData.tipo_cuenta_id}
                        onChange={(e) => setRegData({ ...regData, tipo_cuenta_id: Number(e.target.value) })}
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs text-slate-900"
                      >
                        <option value={1}>Ahorros</option>
                        <option value={2}>Corriente</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Saldo Inicial</Label>
                      <Input
                        type="number"
                        min="0"
                        value={regData.saldo_inicial}
                        onChange={(e) => setRegData({ ...regData, saldo_inicial: e.target.value })}
                        placeholder="500000"
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Clave</Label>
                      <Input
                        type="password"
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        placeholder="Mín. 6"
                        required
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Repetir</Label>
                      <Input
                        type="password"
                        value={regData.password_confirm}
                        onChange={(e) => setRegData({ ...regData, password_confirm: e.target.value })}
                        placeholder="Repetir"
                        required
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">PIN (4)</Label>
                      <Input
                        type="password"
                        maxLength={4}
                        value={regData.pin_cajero}
                        onChange={(e) => setRegData({ ...regData, pin_cajero: e.target.value.replace(/\D/g, "") })}
                        placeholder="1234"
                        required
                        className="mt-1 h-9 bg-slate-50 border-slate-300 text-slate-900 text-xs font-mono text-center"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={regLoading}
                    className="w-full h-10 mt-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    {regLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                    Confirmar Apertura de Cuenta
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
