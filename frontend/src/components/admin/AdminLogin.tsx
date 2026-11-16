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
  onLogin?: (correo: string, pass: string) => Promise<void>;
  loading?: boolean;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [adminCorreo, setAdminCorreo] = useState("admin@banco.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCredencialesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCorreo.trim() || !adminPassword) {
      toast.error("Ingrese correo y contraseña de gerencia.");
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
        toast.error(data.error || "Credenciales de gerencia inválidas.");
        return;
      }

      toast.success("Acceso concedido a Dirección General — Banco de Corazones.");
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      toast.error("Error de conexión con el servidor bancario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16060b] via-[#240a13] to-[#120408] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4 flex items-center justify-between rounded-2xl border border-rose-500/25 bg-[#260b14]/90 p-2 text-xs">
        <span className="font-semibold text-rose-300 px-3 flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Dirección General
        </span>
        <div className="flex items-center gap-1">
          <a
            href="/"
            className="rounded-xl px-2.5 py-1 text-rose-200/75 hover:text-white hover:bg-rose-900/50 transition-colors flex items-center gap-1"
          >
            Sucursal Asociados
          </a>
          <a
            href="/cajero"
            className="rounded-xl px-2.5 py-1 text-rose-200/75 hover:text-white hover:bg-rose-900/50 transition-colors flex items-center gap-1"
          >
            <CreditCard className="h-3 w-3" /> Dispensador
          </a>
        </div>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#1f0911] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-rose-50">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-600/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Dirección General — Banco de Corazones</h2>
          <p className="mt-1 text-xs text-rose-200/75">
            Comité Directivo: Valentina Leal · Sergio Ramos · Dana Manrique
          </p>
        </div>

        <form onSubmit={handleCredencialesSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-xs text-rose-200">Correo de Gerencia</Label>
            <Input
              type="email"
              value={adminCorreo}
              onChange={(e) => setAdminCorreo(e.target.value)}
              placeholder="admin@banco.com"
              required
              className="mt-1.5 h-11 font-mono text-xs bg-[#14050a] border-rose-500/30 text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-rose-200">Clave Directiva</Label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-rose-300 hover:text-white flex items-center gap-1"
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
              className="mt-1.5 h-11 font-mono text-xs bg-[#14050a] border-rose-500/30 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 mt-2 h-11 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-600/25"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Ingresar al Panel Directivo
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setAdminCorreo("admin@banco.com");
                setAdminPassword("Banco123*");
                toast.info("Credenciales de Gerencia cargadas");
              }}
              className="text-[11px] text-rose-300/80 hover:text-rose-200 underline"
            >
              Autocompletar acceso de Gerencia (Valentina Leal)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
