import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar, AdminTab } from "./AdminSidebar";
import { AdminLogin } from "./AdminLogin";
import { AdminClientesTable } from "./AdminClientesTable";
import { AdminConsignacionModal } from "./AdminConsignacionModal";
import { AdminCrearClienteModal } from "./AdminCrearClienteModal";
import { AdminAuditoriaTable } from "./AdminAuditoriaTable";
import { AdminVentanillaView } from "./AdminVentanillaView";
import {
  LayoutDashboard, Users, Wallet, History,
  UserPlus, Heart, ShieldAlert, CheckCircle2, ArrowLeft
} from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function AdminPanelView() {
  const [autenticado, setAutenticado] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const [kpis, setKpis] = useState({
    totalClientes: 0,
    cuentasActivas: 0,
    cuentasBloqueadas: 0,
    totalBoveda: 0,
  });

  const [clientes, setClientes] = useState<any[]>([]);
  const [auditoria, setAuditoria] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [openCrearCliente, setOpenCrearCliente] = useState(false);
  const [openConsignar, setOpenConsignar] = useState(false);
  const [cuentaVentanilla, setCuentaVentanilla] = useState("");

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setKpis({
          totalClientes: Number(data.total_clientes) || 0,
          cuentasActivas: Number(data.cuentas_activas) || 0,
          cuentasBloqueadas: Number(data.cuentas_bloqueadas) || 0,
          totalBoveda: Number(data.saldo_total_banco) || 0,
        });
        setAutenticado(true);
        cargarClientes();
        cargarAuditoria();
      }
    } catch (err) {
      // Sin sesión
    }
  };

  const cargarDashboard = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setKpis({
          totalClientes: Number(data.total_clientes) || 0,
          cuentasActivas: Number(data.cuentas_activas) || 0,
          cuentasBloqueadas: Number(data.cuentas_bloqueadas) || 0,
          totalBoveda: Number(data.saldo_total_banco) || 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await fetch("/api/admin/clientes", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setClientes(data.clientes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cargarAuditoria = async () => {
    try {
      const res = await fetch("/api/admin/movimientos-general", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAuditoria(data.movimientos || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEstadoCliente = async (cliente: any) => {
    const estadoActual =
      cliente.estado_cuenta ||
      cliente.estado ||
      cliente.estado_cliente ||
      (cliente.estado_id === 1 ? "ACTIVO" : "BLOQUEADO");
    const esActivo = estadoActual === "ACTIVO" || estadoActual === "ACTIVA";
    const nuevoEstadoId = esActivo ? 3 : 1;

    try {
      const res = await fetch("/api/admin/clientes/estado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: cliente.id, nuevo_estado_id: nuevoEstadoId }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo cambiar el estado.");
        return;
      }

      toast.success(data.mensaje);
      cargarDashboard();
      cargarClientes();
    } catch (err) {
      toast.error("Error al actualizar estado del asociado.");
    }
  };

  const handleConsignar = async (numero_cuenta: string, valorStr: string, concepto: string) => {
    const valor = parseFloat(valorStr);
    if (isNaN(valor) || valor <= 0) {
      toast.error("El monto a consignar debe ser mayor a $0.");
      return null;
    }

    try {
      const res = await fetch("/api/admin/consignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero_cuenta: numero_cuenta.trim(),
          valor,
          concepto: concepto.trim(),
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al procesar consignación.");
        return null;
      }

      cargarDashboard();
      cargarClientes();
      cargarAuditoria();
      return data.recibo;
    } catch (err) {
      toast.error("Error al conectar con caja.");
      return null;
    }
  };

  const handleCrearCliente = async (nuevoCliente: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_documento_id: nuevoCliente.tipo_documento_id || 1,
          numero_documento: nuevoCliente.numero_documento.trim(),
          nombres: nuevoCliente.nombres.trim(),
          apellidos: nuevoCliente.apellidos.trim(),
          correo: nuevoCliente.correo.trim(),
          telefono: nuevoCliente.telefono ? nuevoCliente.telefono.trim() : null,
          password: nuevoCliente.password,
          pin_cajero: nuevoCliente.pin_cajero,
          tipo_cuenta_id: nuevoCliente.tipo_cuenta_id || 1,
          saldo_inicial: parseFloat(nuevoCliente.saldo_inicial) || 0,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al vincular asociado.");
        return false;
      }

      toast.success("Asociado y cuenta creados exitosamente.");
      cargarDashboard();
      cargarClientes();
      return true;
    } catch (err) {
      toast.error("Error de comunicación.");
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setAutenticado(false);
      toast.info("Sesión directiva finalizada.");
    } catch (err) {
      console.error(err);
    }
  };

  if (!autenticado) {
    return <AdminLogin onLoginSuccess={checkAdminSession} />;
  }

  return (
    <div className="min-h-screen bg-[#14050a] text-rose-50 font-sans flex flex-col">
      <div className="flex flex-1">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenCrearModal={() => setOpenCrearCliente(true)}
        />

        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
          <AdminHeader
            onRefresh={() => {
              cargarDashboard();
              cargarClientes();
              cargarAuditoria();
              toast.success("Datos de Banco de Corazones actualizados.");
            }}
            onLogout={handleLogout}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 w-full max-w-6xl mx-auto">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* BANNER COOPERATIVO DE BANCO DE CORAZONES */}
                <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-[#2c0b16] via-[#3d0e1e] to-[#220810] p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-0.5 text-[11px] font-semibold text-rose-200 mb-2">
                      <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />
                      <span>Fondo Cooperativo Solidario</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      Dirección General — Banco de Corazones
                    </h2>
                    <p className="text-xs text-rose-200/80 mt-1">
                      Equipo Directivo: Valentina Leal · Sergio Ramos · Dana Manrique
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("ventanilla")}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all"
                    >
                      <Wallet className="h-4 w-4" /> Caja de Aportes
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenCrearCliente(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-950/60 hover:bg-rose-900/60 px-4 py-2.5 text-xs font-bold text-rose-100 transition-all"
                    >
                      <UserPlus className="h-4 w-4 text-rose-400" /> Vincular Asociado
                    </button>
                  </div>
                </div>

                {/* 4 TARJETAS DE INDICADORES FINANCIEROS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-rose-500/25 bg-[#1f0911] p-5 shadow-lg">
                    <div className="flex items-center justify-between text-xs text-rose-300/80 mb-2">
                      <span>Fondo Total en Custodia</span>
                      <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                    </div>
                    <div className="font-display text-2xl font-bold text-white">
                      {fmt(kpis.totalBoveda)}
                    </div>
                    <p className="mt-1 text-[11px] text-rose-300/60">Ahorros totales del banco</p>
                  </div>

                  <div className="rounded-2xl border border-rose-500/25 bg-[#1f0911] p-5 shadow-lg">
                    <div className="flex items-center justify-between text-xs text-rose-300/80 mb-2">
                      <span>Total Asociados</span>
                      <Users className="h-4 w-4 text-pink-400" />
                    </div>
                    <div className="font-mono text-2xl font-bold text-white">
                      {String(kpis.totalClientes).padStart(2, "0")}
                    </div>
                    <p className="mt-1 text-[11px] text-rose-300/60">Titulares vinculados</p>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/25 bg-[#1f0911] p-5 shadow-lg">
                    <div className="flex items-center justify-between text-xs text-emerald-300/80 mb-2">
                      <span>Cuentas Habilitadas</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="font-mono text-2xl font-bold text-emerald-400">
                      {String(kpis.cuentasActivas).padStart(2, "0")}
                    </div>
                    <p className="mt-1 text-[11px] text-rose-300/60">Operando con normalidad</p>
                  </div>

                  <div className="rounded-2xl border border-amber-500/25 bg-[#1f0911] p-5 shadow-lg">
                    <div className="flex items-center justify-between text-xs text-amber-300/80 mb-2">
                      <span>Cuentas Restringidas</span>
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="font-mono text-2xl font-bold text-amber-400">
                      {String(kpis.cuentasBloqueadas).padStart(2, "0")}
                    </div>
                    <p className="mt-1 text-[11px] text-rose-300/60">Con bloqueo preventivo</p>
                  </div>
                </div>

                {/* DIRECTORIO DE ASOCIADOS */}
                <AdminClientesTable
                  clientes={clientes}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onToggleEstado={toggleEstadoCliente}
                  onQuickConsignar={(numCuenta) => {
                    setCuentaVentanilla(numCuenta);
                    setOpenConsignar(true);
                  }}
                  onOpenCrearModal={() => setOpenCrearCliente(true)}
                />
              </div>
            )}

            {activeTab === "clientes" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver al Resumen General
                  </button>
                </div>
                <AdminClientesTable
                  clientes={clientes}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onToggleEstado={toggleEstadoCliente}
                  onQuickConsignar={(numCuenta) => {
                    setCuentaVentanilla(numCuenta);
                    setOpenConsignar(true);
                  }}
                  onOpenCrearModal={() => setOpenCrearCliente(true)}
                />
              </div>
            )}

            {activeTab === "ventanilla" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver al Resumen General
                  </button>
                </div>
                <AdminVentanillaView
                  clientes={clientes}
                  cuentaInicial={cuentaVentanilla}
                  onConsignar={handleConsignar}
                />
              </div>
            )}

            {activeTab === "auditoria" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver al Resumen General
                  </button>
                </div>
                <AdminAuditoriaTable
                  auditoria={auditoria}
                  onRefresh={cargarAuditoria}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* BARRA MÓVIL */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-rose-500/20 bg-[#1a070d]/95 backdrop-blur px-2 py-2 flex items-center justify-around">
        {[
          { id: "dashboard" as AdminTab, label: "Resumen", icon: LayoutDashboard },
          { id: "clientes" as AdminTab, label: "Asociados", icon: Users },
          { id: "ventanilla" as AdminTab, label: "Caja", icon: Wallet },
          { id: "auditoria" as AdminTab, label: "Bitácora", icon: History },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-semibold transition-all ${
                isActive ? "text-rose-400" : "text-rose-200/50 hover:text-rose-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <AdminCrearClienteModal
        open={openCrearCliente}
        onClose={() => setOpenCrearCliente(false)}
        onSubmit={handleCrearCliente}
      />

      <AdminConsignacionModal
        open={openConsignar}
        onClose={() => setOpenConsignar(false)}
        cuentaInicial={cuentaVentanilla}
        onSubmit={async (cuenta, valor, concepto) => {
          const r = await handleConsignar(cuenta, valor, concepto);
          return !!r;
        }}
      />
    </div>
  );
}
