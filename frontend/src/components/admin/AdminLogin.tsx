import { useState } from "react";
import {
  Heart, RefreshCw, CreditCard, Eye, EyeOff, KeyRound, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [adminCorreo, setAdminCorreo] = useState("admin@banco.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCredencialesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCorreo.trim() || !adminPassword) {
      toast.error("Ingrese correo y contraseña de administración.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: adminCorreo.trim(), password: adminPassword }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Credenciales inválidas.");
        return;
      }

      toast.success("Bienvenido al Panel Administrativo — Banco de Corazones.");
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs shadow-sm">
        <span className="font-bold text-rose-600 flex items-center gap-1.5">
          <Heart className="h-4 w-4 fill-rose-600" /> Banco de Corazones
        </span>
        <div className="flex items-center gap-2">
          <a href="/" className="text-slate-600 hover:text-rose-600 font-semibold">
            Sucursal Personas
          </a>
          <a href="/cajero" className="text-slate-600 hover:text-rose-600 font-semibold flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" /> Cajero
          </a>
        </div>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6 text-white text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold">Dirección General</h2>
          <p className="text-xs text-rose-100 mt-0.5">
            Valentina Leal · Sergio Ramos · Dana Manrique
          </p>
        </div>

        <form onSubmit={handleCredencialesSubmit} className="p-6 space-y-4">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Correo de Administración</Label>
            <Input
              type="email"
              value={adminCorreo}
              onChange={(e) => setAdminCorreo(e.target.value)}
              placeholder="admin@banco.com"
              required
              className="mt-1.5 h-11 font-mono text-xs bg-slate-50 border-slate-300 text-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">Contraseña</Label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1.5 h-11 font-mono text-xs bg-slate-50 border-slate-300 text-slate-900"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
            Entrar al Panel de Administración
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setAdminCorreo("admin@banco.com");
                setAdminPassword("Banco123*");
                toast.info("Datos de administrador cargados");
              }}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Cargar credenciales de Gerencia (Valentina Leal)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
