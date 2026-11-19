import { useState } from "react";
import { toast } from "sonner";
import { User, Lock, CheckCircle2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isStrongPassword } from "@/lib/secureFetch";
import { bancaService } from "@/services/bancaService";
import type { Usuario } from "../types";

interface SeguridadClaveViewProps {
  usuario: Usuario;
  onTelefonoUpdated: (tel: string) => void;
  onNotify: (title: string, detail: string) => void;
}

export function SeguridadClaveView({
  usuario,
  onTelefonoUpdated,
  onNotify,
}: SeguridadClaveViewProps) {
  const [telefonoEdit, setTelefonoEdit] = useState(usuario.telefono || "");
  const [loadingTel, setLoadingTel] = useState(false);

  const [passActual, setPassActual] = useState("");
  const [pinSeguridad, setPinSeguridad] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [showPassActual, setShowPassActual] = useState(false);
  const [showPinSeguridad, setShowPinSeguridad] = useState(false);
  const [showPassNueva, setShowPassNueva] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [passUpdatedMsg, setPassUpdatedMsg] = useState<string | null>(null);

  const handleUpdateTelefono = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = telefonoEdit.trim();
    if (!limpio) {
      toast.error("Ingresa un número de teléfono válido.");
      return;
    }
    try {
      setLoadingTel(true);
      await bancaService.actualizarTelefono(limpio);
      onTelefonoUpdated(limpio);
      toast.success("Teléfono actualizado con éxito", {
        description: `Nuevo número registrado: ${limpio}.`,
      });
      onNotify("Contacto actualizado", `Teléfono actualizado a ${limpio}.`);
    } catch (err: any) {
      toast.error(err?.message || "No se pudo actualizar el teléfono.");
    } finally {
      setLoadingTel(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassUpdatedMsg(null);
    if (!passActual) {
      toast.error("Ingresa tu contraseña actual.");
      return;
    }
    if (!/^\d{4}$/.test(pinSeguridad.trim())) {
      toast.error("Para autenticar el cambio debes ingresar tu PIN de 4 dígitos.");
      return;
    }
    if (!isStrongPassword(passNueva)) {
      toast.error("La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula y número.");
      return;
    }
    if (passNueva === passActual) {
      toast.error("La nueva contraseña debe ser diferente a la actual.");
      return;
    }
    if (passNueva !== passConfirm) {
      toast.error("La confirmación de la nueva contraseña no coincide.");
      return;
    }

    try {
      setLoadingPass(true);
      await bancaService.cambiarPassword({
        password_actual: passActual,
        password_nuevo: passNueva,
        password_confirmacion: passConfirm,
        pin_cajero: pinSeguridad.trim(),
      });
      setPassActual("");
      setPinSeguridad("");
      setPassNueva("");
      setPassConfirm("");
      setPassUpdatedMsg(
        "Contraseña actualizada con verificación de clave actual + PIN de 4 dígitos y sesión rotada."
      );
      toast.success("¡Contraseña actualizada con éxito!", {
        description: "Tus credenciales cifradas fueron renovadas de forma segura.",
      });
      onNotify("Contraseña actualizada", "Cambio autenticado con clave actual + PIN ATM de 4 dígitos.");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="h-5 w-5 text-rose-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Perfil del Titular</h2>
            <p className="text-xs text-slate-500">Información verificada de tu sucursal virtual.</p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500">Titular:</span>
            <strong className="text-slate-900">{usuario.nombres} {usuario.apellidos}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500">Documento:</span>
            <strong className="font-mono text-slate-900">{usuario.numero_documento}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Correo:</span>
            <strong className="font-mono text-slate-900">{usuario.correo}</strong>
          </div>
        </div>

        <form onSubmit={handleUpdateTelefono} className="space-y-3 pt-1">
          <Label className="text-xs font-semibold text-slate-700">Celular de Notificaciones</Label>
          <div className="flex gap-2">
            <Input
              value={telefonoEdit}
              onChange={(e) => setTelefonoEdit(e.target.value)}
              placeholder="3101234567"
              required
              className="h-10 bg-slate-50 border-slate-300 font-mono text-sm text-slate-900"
            />
            <Button
              type="submit"
              disabled={loadingTel}
              className="h-10 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              {loadingTel ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Actualizar
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-rose-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cambio de Contraseña</h2>
              <p className="text-xs text-slate-500">Requiere clave actual + PIN de 4 dígitos.</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
            Cifrado E2E
          </span>
        </div>

        {passUpdatedMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{passUpdatedMsg}</span>
          </div>
        )}

        <form onSubmit={handleCambiarPassword} className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-slate-700">1. Contraseña Actual</Label>
            <div className="relative mt-1">
              <Input
                type={showPassActual ? "text" : "password"}
                value={passActual}
                onChange={(e) => {
                  setPassActual(e.target.value);
                  setPassUpdatedMsg(null);
                }}
                placeholder="Tu contraseña actual"
                required
                className="h-10 bg-slate-50 border-slate-300 font-mono text-sm text-slate-900 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassActual(!showPassActual)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
              >
                {showPassActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700">2. PIN de Seguridad de la Cuenta (4 dígitos)</Label>
            <div className="relative mt-1">
              <Input
                type={showPinSeguridad ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                value={pinSeguridad}
                onChange={(e) => setPinSeguridad(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                required
                className="h-10 bg-slate-50 border-slate-300 font-mono text-sm tracking-[0.4em] text-slate-900 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPinSeguridad(!showPinSeguridad)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
              >
                {showPinSeguridad ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">3. Nueva Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassNueva ? "text" : "password"}
                  value={passNueva}
                  onChange={(e) => setPassNueva(e.target.value)}
                  placeholder="Mín. 8 segura"
                  required
                  className="h-10 bg-slate-50 border-slate-300 font-mono text-sm text-slate-900 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassNueva(!showPassNueva)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  {showPassNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">4. Confirmar Clave</Label>
              <Input
                type={showPassNueva ? "text" : "password"}
                value={passConfirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                placeholder="Repetir nueva clave"
                required
                className="mt-1 h-10 bg-slate-50 border-slate-300 font-mono text-sm text-slate-900"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Mínimo 8 caracteres, incluyendo mayúscula, minúscula y número. Al guardar se rota tu sesión bancaria.
          </p>

          <Button
            type="submit"
            disabled={loadingPass || !passActual || !passNueva || !passConfirm || pinSeguridad.length !== 4}
            className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
          >
            {loadingPass ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            Autorizar y Cambiar Contraseña
          </Button>
        </form>
      </div>
    </div>
  );
}
