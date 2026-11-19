import { useState, useRef, useEffect } from "react";
import {
  Heart, Wallet, ArrowLeftRight, CreditCard, KeyRound,
  LogOut, RefreshCw, ShieldCheck, Search, CheckCircle2, Bell, Lock,
} from "lucide-react";
import type { CorazonesTab, NotificacionBanco, Usuario } from "../types";

interface CorazonesHeaderProps {
  usuario: Usuario;
  activeTab: CorazonesTab;
  onSelectTab: (tab: CorazonesTab) => void;
  onRefresh: () => void;
  onLogout: () => void;
  notificaciones: NotificacionBanco[];
  unreadNotifs: number;
  onMarkNotificationsRead: () => void;
}

const TABS: { id: CorazonesTab; label: string; icon: any }[] = [
  { id: "resumen", label: "Mi Cuenta y Resumen", icon: Wallet },
  { id: "transferir", label: "Enviar Dinero", icon: ArrowLeftRight },
  { id: "pin", label: "Pin de Retiro Cajero", icon: KeyRound },
  { id: "extracto", label: "Historial de Movimientos", icon: Search },
  { id: "seguridad", label: "Seguridad y Clave", icon: Lock },
];

export function CorazonesHeader({
  usuario,
  activeTab,
  onSelectTab,
  onRefresh,
  onLogout,
  notificaciones,
  unreadNotifs,
  onMarkNotificationsRead,
}: CorazonesHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
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
          <button
            type="button"
            onClick={onRefresh}
            title="Actualizar saldo"
            className="inline-flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 p-1.5 text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={() => {
                const next = !notifOpen;
                setNotifOpen(next);
                if (next) onMarkNotificationsRead();
              }}
              className="relative inline-flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 p-1.5 text-white transition-colors"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadNotifs > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[9px] font-bold text-slate-950">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 z-50 w-72 sm:w-80 rounded-2xl border border-rose-200 bg-white p-3 text-slate-800 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-rose-600" /> Notificaciones de Sesión
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {notificaciones.length} eventos
                  </span>
                </div>
                {notificaciones.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-500">
                    Aún no hay notificaciones registradas.
                  </p>
                ) : (
                  <ul className="max-h-60 space-y-2 overflow-y-auto pr-1">
                    {notificaciones.map((n) => (
                      <li key={n.id} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5 text-xs">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 leading-tight">{n.title}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5">{n.detail}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

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
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white text-rose-700 hover:bg-rose-50 px-3 py-1.5 text-xs font-bold shadow-sm transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Salir
          </button>
        </div>
      </div>

      {/* BARRA DE PESTAÑAS HORIZONTAL */}
      <div className="bg-white border-b border-rose-100 text-slate-700">
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto gap-2 py-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTab(t.id)}
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
  );
}
