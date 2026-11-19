import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { bancaService } from "@/services/bancaService";
import { ApiError } from "@/lib/secureFetch";
import type { CorazonesTab, Cuenta, Movimiento, NotificacionBanco, Usuario } from "./types";
import { BancaLogin } from "./BancaLogin";
import { CorazonesHeader } from "./views/CorazonesHeader";
import { ResumenCuentaView } from "./views/ResumenCuentaView";
import { TransferirCorazonesView } from "./views/TransferirCorazonesView";
import { PinRetiroView } from "./views/PinRetiroView";
import { ExtractoView } from "./views/ExtractoView";
import { SeguridadClaveView } from "./views/SeguridadClaveView";

export function BancaVirtualView() {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cuentaActiva, setCuentaActiva] = useState<Cuenta | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [activeTab, setActiveTab] = useState<CorazonesTab>("resumen");
  const [loginLoading, setLoginLoading] = useState(false);

  const [notificaciones, setNotificaciones] = useState<NotificacionBanco[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const [codigoRetiro, setCodigoRetiro] = useState<string | null>(null);
  const [loadingCodigo, setLoadingCodigo] = useState(false);

  const agregarNotificacion = (title: string, detail: string) => {
    const item: NotificacionBanco = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      detail,
      time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    };
    setNotificaciones((prev) => [item, ...prev].slice(0, 20));
    setUnreadNotifs((prev) => prev + 1);
  };

  const cargarMovimientos = async (cuentaId: number) => {
    try {
      const data = await bancaService.getMovimientos(cuentaId);
      setMovimientos(data.movimientos || []);
    } catch {
      // Silencioso en precarga de historial
    }
  };

  const cargarResumen = async () => {
    try {
      setLoading(true);
      const data = await bancaService.getResumen();
      if (data.usuario) {
        setUsuario(data.usuario);
        setCuentas(data.cuentas || []);
        if (data.cuentas && data.cuentas.length > 0) {
          const cuentaActual =
            (cuentaActiva ? data.cuentas.find((c) => c.id === cuentaActiva.id) : undefined) ||
            data.cuentas[0];
          if (cuentaActual) {
            setCuentaActiva(cuentaActual);
            cargarMovimientos(cuentaActual.id);
          }
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUsuario(null);
      } else {
        toast.error("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  const handleLogin = async (identificador: string, pass: string) => {
    try {
      setLoginLoading(true);
      const data = await authService.loginCliente(identificador, pass);
      toast.success("Inicio de sesión exitoso", {
        description: `Hola de nuevo, ${data.usuario.nombres}.`,
      });
      agregarNotificacion(
        "Sesión iniciada",
        `Ingreso autorizado para ${data.usuario.nombres} ${data.usuario.apellidos}.`
      );
      cargarResumen();
    } catch (err: any) {
      toast.error(err?.message || "Credenciales incorrectas.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUsuario(null);
      setCuentas([]);
      setCuentaActiva(null);
      setMovimientos([]);
      setNotificaciones([]);
      setUnreadNotifs(0);
      setActiveTab("resumen");
      toast.success("Sesión cerrada con éxito", {
        description: "Has salido de tu sucursal virtual.",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerarPin = async () => {
    try {
      setLoadingCodigo(true);
      const data = await bancaService.generarCodigoRetiro(
        cuentaActiva?.id,
        cuentaActiva?.numero_cuenta
      );
      setCodigoRetiro(data.codigo);
      toast.success("PIN de retiro generado con éxito", {
        description: `Tu código temporal es ${data.codigo} (vigente ${data.expira_minutos || 30} minutos).`,
      });
      agregarNotificacion(
        "PIN de retiro generado",
        `Código ${data.codigo} listo para retiro sin tarjeta en cajero.`
      );
    } catch (err: any) {
      toast.error(err?.message || "No se pudo generar el pin.");
    } finally {
      setLoadingCodigo(false);
    }
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

  return (
    <div className="min-h-screen bg-[#f8f4f6] text-slate-800">
      <CorazonesHeader
        usuario={usuario}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRefresh={() => {
          cargarResumen();
          toast.success("Saldos y movimientos actualizados.");
        }}
        onLogout={handleLogout}
        notificaciones={notificaciones}
        unreadNotifs={unreadNotifs}
        onMarkNotificationsRead={() => setUnreadNotifs(0)}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab === "resumen" && (
          <ResumenCuentaView
            usuario={usuario}
            cuentaActiva={cuentaActiva}
            saldoActual={saldoActual}
            movimientos={movimientos}
            onRefresh={cargarResumen}
            onIrTransferir={() => setActiveTab("transferir")}
            onIrPinRetiro={() => {
              setActiveTab("pin");
              handleGenerarPin();
            }}
          />
        )}

        {activeTab === "transferir" && (
          <TransferirCorazonesView
            cuentaActiva={cuentaActiva}
            saldoActual={saldoActual}
            onTransferSuccess={cargarResumen}
            onNotify={agregarNotificacion}
          />
        )}

        {activeTab === "pin" && (
          <PinRetiroView
            cuentaActiva={cuentaActiva}
            codigoRetiro={codigoRetiro}
            loadingCodigo={loadingCodigo}
            onGenerarPin={handleGenerarPin}
          />
        )}

        {activeTab === "extracto" && (
          <ExtractoView cuentaActiva={cuentaActiva} movimientos={movimientos} />
        )}

        {activeTab === "seguridad" && (
          <SeguridadClaveView
            usuario={usuario}
            onTelefonoUpdated={(tel) => setUsuario({ ...usuario, telefono: tel })}
            onNotify={agregarNotificacion}
          />
        )}
      </main>
    </div>
  );
}
