import { useState } from "react";
import {
  Heart, RefreshCw, UserPlus, LogIn, KeyRound, Eye, EyeOff,
  CheckCircle2, CreditCard, ShieldCheck, Users
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

  // Formulario de Login
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Formulario de Registro Público
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
  const [showRegPass, setShowRegPass] = useState(false);
  const [cuentaCreada, setCuentaCreada] = useState<any>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador.trim() || !password) {
      toast.error("Ingrese su documento o correo y contraseña.");
      return;
    }
    onLogin(identificador.trim(), password);
  };

  const cargarAsociadoDemo = (doc: string, nombre: string) => {
    setIdentificador(doc);
    setPassword("Banco123*");
    toast.info(`Datos cargados para ${nombre}`);
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regData.numero_documento.trim() || !regData.nombres.trim() || !regData.apellidos.trim() || !regData.correo.trim()) {
      toast.error("Por favor complete todos los datos requeridos.");
      return;
    }

    if (regData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (regData.password !== regData.password_confirm) {
      toast.error("Las contraseñas ingresadas no coinciden.");
      return;
    }

    const pin = regData.pin_cajero.trim();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error("El PIN del dispensador debe ser de 4 dígitos numéricos.");
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
        toast.error(data.error || "No se pudo crear la cuenta solidaria.");
        return;
      }

      toast.success(data.mensaje);
      setCuentaCreada(data.cuenta);
      setIdentificador(regData.numero_documento.trim());
      setPassword(regData.password);
      setTab("login");
    } catch (err) {
      toast.error("Error de conexión con Banco de Corazones.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16060b] via-[#240a13] to-[#120408] flex flex-col items-center justify-center p-4">
      {/* CABECERA DE NAVEGACIÓN ENTRE CANALES */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between rounded-2xl border border-rose-500/25 bg-[#260b14]/90 px-4 py-2.5 text-xs shadow-lg">
        <div className="flex items-center gap-2 font-bold text-rose-300">
          <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
          <span>Banco de Corazones</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/cajero"
            className="flex items-center gap-1 rounded-xl border border-rose-500/25 bg-rose-950/50 px-2.5 py-1 text-[11px] font-semibold text-rose-200 hover:bg-rose-900/60 transition-colors"
          >
            <CreditCard className="h-3 w-3 text-rose-400" /> Dispensador
          </a>
          <a
            href="/admin"
            className="flex items-center gap-1 rounded-xl border border-pink-500/25 bg-pink-950/50 px-2.5 py-1 text-[11px] font-semibold text-pink-200 hover:bg-pink-900/60 transition-colors"
          >
            <ShieldCheck className="h-3 w-3 text-pink-400" /> Gerencia
          </a>
        </div>
      </div>

      {/* TARJETA CENTRAL DE ACCESO */}
      <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#1f0911] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-rose-50">
        <div className="relative">
          {/* IDENTIDAD BANCO DE CORAZONES */}
          <div className="text-center pb-4 border-b border-rose-500/20">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-600/30">
              <Heart className="h-7 w-7 fill-white" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Banco de Corazones
            </h1>
            <p className="mt-1 text-xs text-rose-200/75">
              Sucursal Cooperativa Digital · Ahorro y Crédito Solidario
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-950/80 border border-rose-500/25 px-3 py-0.5 text-[10px] font-medium text-rose-300">
              <Users className="h-3 w-3 text-rose-400" />
              <span>Valentina Leal · Sergio Ramos · Dana Manrique</span>
            </div>
          </div>

          {/* PESTAÑAS: INGRESAR / VINCULARME */}
          <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-[#14050a] p-1.5 border border-rose-500/20 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setCuentaCreada(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all ${
                tab === "login"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
                  : "text-rose-200/60 hover:text-rose-100"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" /> Ingresar a mi Cuenta
            </button>
            <button
              type="button"
              onClick={() => setTab("registro")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all ${
                tab === "registro"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
                  : "text-rose-200/60 hover:text-rose-100"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Asociarme Ahora
            </button>
          </div>

          {/* FORMULARIO DE INGRESO */}
          {tab === "login" && (
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              {cuentaCreada && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> ¡Asociado registrado con éxito!
                  </div>
                  <p>Documento: <span className="font-mono font-bold text-white">{cuentaCreada.numero_documento}</span></p>
                  <p>Cuenta Corazón: <span className="font-mono font-bold text-white">{cuentaCreada.numero_cuenta}</span></p>
                </div>
              )}

              <div>
                <Label className="text-xs text-rose-200">Documento de Identidad, Cuenta o Correo</Label>
                <Input
                  type="text"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="Ej: 1001112233 o valentina@corazones.com"
                  required
                  className="mt-1.5 h-11 rounded-xl border-rose-500/30 bg-[#14050a] font-mono text-sm text-white placeholder:text-rose-200/35 focus-visible:ring-rose-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-rose-200">Clave Personal</Label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="text-[11px] text-rose-300/80 hover:text-white flex items-center gap-1"
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
                  className="mt-1.5 h-11 rounded-xl border-rose-500/30 bg-[#14050a] font-mono text-sm text-white placeholder:text-rose-200/35 focus-visible:ring-rose-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                Entrar a Banco de Corazones
              </Button>

              {/* ACCESO RÁPIDO PARA SUSTENTACIÓN DEL EQUIPO */}
              <div className="pt-3 border-t border-rose-500/20">
                <p className="text-[11px] text-rose-300/75 mb-2 text-center font-medium">
                  Cuentas de prueba del equipo (clic para autocompletar):
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => cargarAsociadoDemo("1001112233", "Valentina Leal")}
                    className="rounded-xl border border-rose-500/25 bg-[#14050a] px-2 py-2 text-center hover:border-rose-400 hover:bg-rose-950/50 transition-all"
                  >
                    <span className="block text-[11px] font-bold text-rose-200 truncate">Valentina Leal</span>
                    <span className="block text-[9px] font-mono text-rose-400">1001112233</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cargarAsociadoDemo("1002223344", "Sergio Ramos")}
                    className="rounded-xl border border-rose-500/25 bg-[#14050a] px-2 py-2 text-center hover:border-rose-400 hover:bg-rose-950/50 transition-all"
                  >
                    <span className="block text-[11px] font-bold text-rose-200 truncate">Sergio Ramos</span>
                    <span className="block text-[9px] font-mono text-rose-400">1002223344</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cargarAsociadoDemo("1003334455", "Dana Manrique")}
                    className="rounded-xl border border-rose-500/25 bg-[#14050a] px-2 py-2 text-center hover:border-rose-400 hover:bg-rose-950/50 transition-all"
                  >
                    <span className="block text-[11px] font-bold text-rose-200 truncate">Dana Manrique</span>
                    <span className="block text-[9px] font-mono text-rose-400">1003334455</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* FORMULARIO DE REGISTRO DE ASOCIADO */}
          {tab === "registro" && (
            <form onSubmit={handleRegistroSubmit} className="mt-5 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-rose-200">Tipo Doc.</Label>
                  <select
                    value={regData.tipo_documento_id}
                    onChange={(e) => setRegData({ ...regData, tipo_documento_id: Number(e.target.value) })}
                    className="mt-1 h-9 w-full rounded-xl border border-rose-500/30 bg-[#14050a] px-2 text-xs text-white"
                  >
                    <option value={1}>CC</option>
                    <option value={2}>CE</option>
                    <option value={3}>PAS</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label className="text-[11px] text-rose-200">Número de Documento</Label>
                  <Input
                    value={regData.numero_documento}
                    onChange={(e) => setRegData({ ...regData, numero_documento: e.target.value })}
                    placeholder="Ej: 1005678901"
                    required
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-rose-200">Nombres</Label>
                  <Input
                    value={regData.nombres}
                    onChange={(e) => setRegData({ ...regData, nombres: e.target.value })}
                    placeholder="Valentina"
                    required
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-rose-200">Apellidos</Label>
                  <Input
                    value={regData.apellidos}
                    onChange={(e) => setRegData({ ...regData, apellidos: e.target.value })}
                    placeholder="Leal"
                    required
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-rose-200">Correo Electrónico</Label>
                  <Input
                    type="email"
                    value={regData.correo}
                    onChange={(e) => setRegData({ ...regData, correo: e.target.value })}
                    placeholder="correo@corazones.com"
                    required
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-rose-200">Celular</Label>
                  <Input
                    value={regData.telefono}
                    onChange={(e) => setRegData({ ...regData, telefono: e.target.value })}
                    placeholder="3101234567"
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-rose-200">Modalidad de Cuenta</Label>
                  <select
                    value={regData.tipo_cuenta_id}
                    onChange={(e) => setRegData({ ...regData, tipo_cuenta_id: Number(e.target.value) })}
                    className="mt-1 h-9 w-full rounded-xl border border-rose-500/30 bg-[#14050a] px-2 text-xs text-white"
                  >
                    <option value={1}>Ahorro Corazón</option>
                    <option value={2}>Cuenta Corriente</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[11px] text-rose-200">Aporte Inicial (COP)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    value={regData.saldo_inicial}
                    onChange={(e) => setRegData({ ...regData, saldo_inicial: e.target.value })}
                    placeholder="500000"
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-rose-200">Clave Web</Label>
                  <Input
                    type={showRegPass ? "text" : "password"}
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Mín. 6 caract."
                    required
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-rose-200">Confirmar</Label>
                  <Input
                    type={showRegPass ? "text" : "password"}
                    value={regData.password_confirm}
                    onChange={(e) => setRegData({ ...regData, password_confirm: e.target.value })}
                    placeholder="Repetir clave"
                    required
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-rose-200">PIN Cajero (4)</Label>
                  <Input
                    type="password"
                    maxLength={4}
                    value={regData.pin_cajero}
                    onChange={(e) => setRegData({ ...regData, pin_cajero: e.target.value.replace(/\D/g, "") })}
                    placeholder="1234"
                    required
                    className="mt-1 h-9 rounded-xl border-rose-500/30 bg-[#14050a] text-xs font-mono text-center"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={regLoading}
                className="w-full h-10 mt-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25"
              >
                {regLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Heart className="h-3.5 w-3.5 mr-1.5 fill-white" />}
                Abrir mi Cuenta en Banco de Corazones
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
