"use client";

import { useState, useEffect } from "react";
import { ArbitrosService } from "@/services/arbitros.service";
import { Arbitro } from "@/types/arbitro";

interface Props {
  arbitro?: Arbitro;
  onSuccess: () => void;
}

export default function ArbitroForm({ arbitro, onSuccess }: Props) {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    cedula: "",
    telefono: "",
    correo: "",
    direccion: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // =============================
  // CARGAR DATOS PARA EDICIÓN
  // =============================
  useEffect(() => {
    if (arbitro) {
      setForm({
        nombres: arbitro.nombres || "",
        apellidos: arbitro.apellidos || "",
        cedula: arbitro.cedula || "",
        telefono: arbitro.telefono || "",
        correo: arbitro.correo || "",
        direccion: arbitro.direccion || ""
      });
    } else {
      setForm({
        nombres: "",
        apellidos: "",
        cedula: "",
        telefono: "",
        correo: "",
        direccion: ""
      });
    }
    setErrors({});
  }, [arbitro]);

  // =============================
  // VALIDACIONES
  // =============================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.nombres.trim()) newErrors.nombres = "Los nombres son obligatorios";
    if (!form.apellidos.trim()) newErrors.apellidos = "Los apellidos son obligatorios";
    if (!form.cedula.trim()) newErrors.cedula = "La cédula es obligatoria";
    if (!form.direccion.trim()) newErrors.direccion = "La dirección es obligatoria";

    if (form.cedula && !/^\d{10}$/.test(form.cedula)) {
      newErrors.cedula = "La cédula debe tener 10 dígitos";
    }

    if (form.correo && !/\S+@\S+\.\S+/.test(form.correo)) {
      newErrors.correo = "Correo electrónico inválido";
    }

    if (form.telefono && !/^\d{10}$/.test(form.telefono)) {
      newErrors.telefono = "El teléfono debe tener 10 dígitos";
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
      let result;
      if (arbitro?.id_arbitro) {
        result = await ArbitrosService.editar(arbitro.id_arbitro, form);
      } else {
        result = await ArbitrosService.crear(form);
      }

      // 🟡 Manejo de errores de negocio desde el backend
      if (!result.success) {
        if (result.message.includes("cedula")) {
          setErrors(prev => ({ ...prev, cedula: result.message }));
        } else {
          setErrors(prev => ({ ...prev, general: result.message }));
        }
        return;
      }

      // Éxito
      onSuccess();

      if (!arbitro) {
        setForm({
          nombres: "",
          apellidos: "",
          cedula: "",
          telefono: "",
          correo: "",
          direccion: ""
        });
      }

    } catch (err: any) {
      console.error("Error crítico guardando árbitro:", err);
      setErrors(prev => ({ ...prev, general: "Error del servidor. Intente más tarde." }));
    } finally {
      setIsLoading(false);
    }
  }

  // =============================
  // RENDER
  // =============================
  return (
    <form onSubmit={submit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        {arbitro ? "Editar Árbitro" : "Nuevo Árbitro"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NOMBRES */}
        <Input
          label="Nombres *"
          value={form.nombres}
          error={errors.nombres}
          onChange={v => setForm({ ...form, nombres: v })}
        />

        {/* APELLIDOS */}
        <Input
          label="Apellidos *"
          value={form.apellidos}
          error={errors.apellidos}
          onChange={v => setForm({ ...form, apellidos: v })}
        />

        {/* CÉDULA */}
        <Input
          label="Cédula *"
          value={form.cedula}
          error={errors.cedula}
          onChange={v => setForm({ ...form, cedula: v.replace(/\D/g, "").slice(0, 10) })}
        />

        {/* TELÉFONO */}
        <Input
          label="Teléfono"
          value={form.telefono}
          error={errors.telefono}
          onChange={v => setForm({ ...form, telefono: v.replace(/\D/g, "").slice(0, 10) })}
        />

        {/* CORREO */}
        <Input
          label="Correo"
          value={form.correo}
          error={errors.correo}
          onChange={v => setForm({ ...form, correo: v })}
        />

        {/* DIRECCIÓN */}
        <Input
          label="Dirección *"
          value={form.direccion}
          error={errors.direccion}
          onChange={v => setForm({ ...form, direccion: v })}
          full
        />
      </div>

      {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#00923F] hover:bg-[#007A34] text-white py-3 rounded-lg disabled:opacity-70"
      >
        {isLoading ? "Guardando..." : arbitro ? "Actualizar Árbitro" : "Crear Árbitro"}
      </button>
    </form>
  );
}

// =============================
// INPUT REUTILIZABLE
// =============================
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
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
