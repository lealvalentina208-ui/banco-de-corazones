import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AdminLogin } from "./AdminLogin";
import {
  Users, Wallet, History, UserPlus, Heart, ShieldAlert,
  CheckCircle2, LogOut, CreditCard, RefreshCw, Lock, Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function AdminPanelView() {
  const [autenticado, setAutenticado] = useState(false);
  const [activeTab, setActiveTab] = useState<"clientes" | "consignar" | "nuevo" | "historial">("clientes");

  const [kpis, setKpis] = useState({
    totalClientes: 0,
    cuentasActivas: 0,
    cuentasBloqueadas: 0,
    totalBoveda: 0,
  });

  const [clientes, setClientes] = useState<any[]>([]);
  const [auditoria, setAuditoria] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Formulario Consignar
  const [cuentaConsignar, setCuentaConsignar] = useState("");
  const [valorConsignar, setValorConsignar] = useState("");
  const [conceptoConsignar, setConceptoConsignar] = useState("");

  // Formulario Crear Asociado
  const [nuevo, setNuevo] = useState({
    numero_documento: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    saldo_inicial: "",
    password: "",
    pin_cajero: "",
  });

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

  const cargarClientes = async () => {
    const res = await fetch("/api/admin/clientes", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setClientes(data.clientes || []);
    }
  };

  const cargarAuditoria = async () => {
    const res = await fetch("/api/admin/movimientos-general", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setAuditoria(data.movimientos || []);
    }
  };

  const toggleEstadoCliente = async (cliente: any) => {
    const estadoActual = cliente.estado_cuenta || cliente.estado || "ACTIVO";
    const esActivo = estadoActual === "ACTIVO" || estadoActual === "ACTIVA";
    const nuevoEstadoId = esActivo ? 3 : 1;

    const res = await fetch("/api/admin/clientes/estado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id: cliente.id, nuevo_estado_id: nuevoEstadoId }),
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.mensaje);
      checkAdminSession();
    } else {
      toast.error(data.error || "Error al cambiar estado.");
    }
  };

  const handleConsignarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/consignar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero_cuenta: cuentaConsignar.trim(),
        valor: parseFloat(valorConsignar),
        concepto: conceptoConsignar.trim() || "Consignación en Caja — Banco de Corazones",
      }),
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Consignación acreditada exitosamente.");
      setValorConsignar("");
      setConceptoConsignar("");
      checkAdminSession();
      setActiveTab("clientes");
    } else {
      toast.error(data.error || "Error al consignar.");
    }
  };

  const handleCrearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo_documento_id: 1,
        ...nuevo,
        saldo_inicial: parseFloat(nuevo.saldo_inicial) || 0,
      }),
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Nuevo asociado creado con éxito.");
      setNuevo({
        numero_documento: "",
        nombres: "",
        apellidos: "",
        correo: "",
        telefono: "",
        saldo_inicial: "",
        password: "",
        pin_cajero: "",
      });
      checkAdminSession();
      setActiveTab("clientes");
    } else {
      toast.error(data.error || "No se pudo crear el asociado.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setAutenticado(false);
  };

  if (!autenticado) {
    return <AdminLogin onLoginSuccess={checkAdminSession} />;
  }

  const clientesFiltrados = clientes.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.nombres?.toLowerCase().includes(q) ||
      c.apellidos?.toLowerCase().includes(q) ||
      c.numero_documento?.includes(q) ||
      c.numero_cuenta?.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8f4f6] text-slate-800 font-sans">
      {/* CABECERA SUPERIOR ROJA (SIN SIDEBAR LATERAL) */}
      <header className="bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 fill-rose-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Administración — Banco de Corazones</h1>
              <p className="text-xs text-rose-100">Consola Central de Operaciones</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href="/" className="rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold">
              Sucursal Personas
            </a>
            <a href="/cajero" className="rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" /> Cajero
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-white text-rose-700 hover:bg-rose-50 px-3 py-1.5 text-xs font-bold flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>

        {/* BARRA HORIZONTAL DE OPCIONES */}
        <div className="bg-white border-b border-rose-100 text-slate-700">
          <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto gap-2 py-2">
            {[
              { id: "clientes", label: "Directorio de Asociados", icon: Users },
              { id: "consignar", label: "Caja y Consignaciones", icon: Wallet },
              { id: "nuevo", label: "Abrir Cuenta a Cliente", icon: UserPlus },
              { id: "historial", label: "Historial del Banco", icon: History },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                    active ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
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

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 4 INDICADORES BLANCOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-rose-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Fondo Total en Custodia</span>
            <strong className="text-2xl font-extrabold text-rose-600 mt-1 block">{fmt(kpis.totalBoveda)}</strong>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Asociados Registrados</span>
            <strong className="text-2xl font-extrabold text-slate-900 mt-1 block">{kpis.totalClientes}</strong>
          </div>
          <div className="rounded-2xl bg-white border border-emerald-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Cuentas Activas</span>
            <strong className="text-2xl font-extrabold text-emerald-600 mt-1 block">{kpis.cuentasActivas}</strong>
          </div>
          <div className="rounded-2xl bg-white border border-amber-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Cuentas Bloqueadas</span>
            <strong className="text-2xl font-extrabold text-amber-600 mt-1 block">{kpis.cuentasBloqueadas}</strong>
          </div>
        </div>

        {/* PESTAÑA 1: TABLA BLANCA DE CLIENTES */}
        {activeTab === "clientes" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Asociados de Banco de Corazones</h2>
                <p className="text-xs text-slate-500">Gestiona el estado de las cuentas o realiza abonos por caja</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, cédula o cuenta..."
                  className="h-9 w-64 bg-slate-50 border-slate-300 text-xs text-slate-900"
                />
                <Button variant="outline" size="sm" onClick={checkAdminSession}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                    <th className="py-3 px-3">Asociado</th>
                    <th className="py-3 px-3">Documento</th>
                    <th className="py-3 px-3">Cuenta</th>
                    <th className="py-3 px-3 text-right">Saldo</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientesFiltrados.map((c) => {
                    const est = c.estado_cuenta || c.estado || "ACTIVA";
                    const activo = est === "ACTIVO" || est === "ACTIVA";
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-3">
                          <strong className="text-slate-900 block">{c.nombres} {c.apellidos}</strong>
                          <span className="text-[11px] text-slate-500">{c.correo}</span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">{c.numero_documento}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-rose-600">{c.numero_cuenta}</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                          {fmt(Number(c.saldo) || 0)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              activo ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {activo ? "ACTIVA" : "BLOQUEADA"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCuentaConsignar(c.numero_cuenta);
                              setActiveTab("consignar");
                            }}
                            className="h-8 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            Consignar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleEstadoCliente(c)}
                            className={`h-8 text-xs ${
                              activo ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {activo ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                            {activo ? "Bloquear" : "Activar"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: CONSIGNAR EN CAJA */}
        {activeTab === "consignar" && (
          <div className="max-w-xl mx-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Caja de Consignaciones en Efectivo</h2>
            <form onSubmit={handleConsignarSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Cuenta Destino</Label>
                <Input
                  value={cuentaConsignar}
                  onChange={(e) => setCuentaConsignar(e.target.value)}
                  placeholder="700111223344"
                  required
                  className="mt-1 h-11 bg-slate-50 border-slate-300 font-mono text-slate-900"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Monto a Consignar (COP)</Label>
                <Input
                  type="number"
                  min="1000"
                  value={valorConsignar}
                  onChange={(e) => setValorConsignar(e.target.value)}
                  placeholder="100000"
                  required
                  className="mt-1 h-11 bg-slate-50 border-slate-300 font-mono text-slate-900"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Concepto</Label>
                <Input
                  value={conceptoConsignar}
                  onChange={(e) => setConceptoConsignar(e.target.value)}
                  placeholder="Abono por ventanilla"
                  className="mt-1 h-11 bg-slate-50 border-slate-300 text-slate-900"
                />
              </div>
              <Button type="submit" className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Acreditar Consignación
              </Button>
            </form>
          </div>
        )}

        {/* PESTAÑA 3: CREAR NUEVO ASOCIADO */}
        {activeTab === "nuevo" && (
          <div className="max-w-xl mx-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Vincular Nuevo Asociado</h2>
            <form onSubmit={handleCrearSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Nombres</Label>
                  <Input
                    value={nuevo.nombres}
                    onChange={(e) => setNuevo({ ...nuevo, nombres: e.target.value })}
                    required
                    className="mt-1 bg-slate-50 border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Apellidos</Label>
                  <Input
                    value={nuevo.apellidos}
                    onChange={(e) => setNuevo({ ...nuevo, apellidos: e.target.value })}
                    required
                    className="mt-1 bg-slate-50 border-slate-300 text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Documento (CC)</Label>
                  <Input
                    value={nuevo.numero_documento}
                    onChange={(e) => setNuevo({ ...nuevo, numero_documento: e.target.value })}
                    required
                    className="mt-1 bg-slate-50 border-slate-300 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Correo</Label>
                  <Input
                    type="email"
                    value={nuevo.correo}
                    onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })}
                    required
                    className="mt-1 bg-slate-50 border-slate-300 text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Saldo Inicial</Label>
                  <Input
                    type="number"
                    value={nuevo.saldo_inicial}
                    onChange={(e) => setNuevo({ ...nuevo, saldo_inicial: e.target.value })}
                    className="mt-1 bg-slate-50 border-slate-300 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Clave Web</Label>
                  <Input
                    value={nuevo.password}
                    onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })}
                    className="mt-1 bg-slate-50 border-slate-300 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">PIN Cajero</Label>
                  <Input
                    maxLength={4}
                    value={nuevo.pin_cajero}
                    onChange={(e) => setNuevo({ ...nuevo, pin_cajero: e.target.value })}
                    className="mt-1 bg-slate-50 border-slate-300 font-mono text-slate-900"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold mt-2">
                Registrar Asociado y Crear Cuenta
              </Button>
            </form>
          </div>
        )}

        {/* PESTAÑA 4: HISTORIAL GENERAL */}
        {activeTab === "historial" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Bitácora General de Operaciones</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Titular / Cuenta</th>
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditoria.map((a, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-500">{new Date(a.fecha).toLocaleString("es-CO")}</td>
                      <td className="py-3 px-3 font-mono text-slate-800">{a.numero_cuenta} · {a.titular}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{a.descripcion || a.tipo_operacion}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">{fmt(Number(a.valor))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
