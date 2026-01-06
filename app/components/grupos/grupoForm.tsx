"use client";

import { useState, useEffect } from "react";
import { Grupo } from "@/types/grupo";
import { GruposService } from "@/services/grupos.service";

interface Props {
  grupo?: Grupo;
  onSuccess: () => void;
}

export default function GrupoForm({ grupo, onSuccess }: Props) {
  const [form, setForm] = useState({ nombre: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // =============================
  // CARGAR DATOS PARA EDICIÓN
  // =============================
  useEffect(() => {
    if (grupo) {
      setForm({ nombre: grupo.nombre ?? "" });
    } else {
      setForm({ nombre: "" });
    }
    setErrors({});
  }, [grupo]);

  // =============================
  // VALIDACIONES
  // =============================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================
  // SUBMIT
  // =============================
  async function submit(e: React.FormEvent) {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const payload = { nombre: form.nombre.trim() };

    const result: any = grupo?.id_grupo
      ? await GruposService.editar(grupo.id_grupo, payload)
      : await GruposService.crear(payload);

    // Manejo de error de negocio
    if (result?.success === false) {
      setErrors(prev => ({ ...prev, nombre: result.message }));
      return;
    }

    // Éxito
    onSuccess();
    if (!grupo) setForm({ nombre: "" });
  } catch (err: any) {
    console.error("Error crítico guardando grupo:", err);
    setErrors(prev => ({
      ...prev,
      general: "Error del servidor. Intente más tarde."
    }));
  } finally {
    setIsLoading(false);
  }

    try {
      const payload = { nombre: form.nombre.trim() };

      const result: any = grupo?.id_grupo
        ? await GruposService.editar(grupo.id_grupo, payload)
        : await GruposService.crear(payload);

      // 🔹 Manejo de errores de negocio devueltos por la API
      if (result?.success === false) {
        const message = result.error || result.message || "Error al guardar grupo";

        if (message.toLowerCase().includes("nombre")) {
          setErrors(prev => ({ ...prev, nombre: message }));
        } else {
          setErrors(prev => ({ ...prev, general: message }));
        }
        return;
      }

      // ✅ Éxito
      onSuccess();
      if (!grupo) setForm({ nombre: "" });
    } catch (err: any) {
      // 🔴 Error crítico
      console.error("Error crítico guardando grupo:", err);
      setErrors(prev => ({
        ...prev,
        general: err.message || "Error del servidor. Intente más tarde."
      }));
    } finally {
      setIsLoading(false);
    }
  }

  // =============================
  // RENDER
  // =============================
  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre *"
          value={form.nombre}
          error={errors.nombre}
          onChange={v => setForm({ ...form, nombre: v })}
          full
        />
      </div>

      {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#00923F] hover:bg-[#007A34] text-white py-3 rounded-lg disabled:opacity-70"
      >
        {isLoading
          ? "Guardando..."
          : grupo
          ? "Actualizar Grupo"
          : "Crear Grupo"}
      </button>
    </form>
  );
}

/* =============================
   INPUT REUTILIZABLE
============================= */
function Input({
  label,
  value,
  error,
  onChange,
  full = false
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
