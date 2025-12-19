"use client";

import { useState, useEffect } from "react";
import { DelegadosService } from "@/services/delegados.service";
import { Delegado} from "@/types/delegado";

interface Props {
  delegado?: Delegado;
  onSuccess: () => void;
}

export default function DelegadoForm({ delegado, onSuccess }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    correo: "",
    estado: true // ✅ ACTIVO POR DEFECTO
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // =============================
  // CARGAR DATOS PARA EDICIÓN
  // =============================
  useEffect(() => {
    if (delegado) {
      setForm({
        nombre: delegado.nombre || "",
        apellido: delegado.apellido || "",
        cedula: delegado.cedula || "",
        telefono: delegado.telefono || "",
        correo: delegado.correo || "",
        estado: delegado.estado ?? true
      });
    } else {
      setForm({
        nombre: "",
        apellido: "",
        cedula: "",
        telefono: "",
        correo: "",
        estado: true
      });
    }
    setErrors({});
  }, [delegado]);

  // =============================
  // VALIDACIONES
  // =============================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) newErrors.apellido = "El apellido es obligatorio";
    if (!form.cedula.trim()) newErrors.cedula = "La cédula es obligatoria";
    

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

      if (delegado?.id_usuario) {
        result = await DelegadosService.editarDelegado(delegado.id_usuario, form);
      } else {
        result = await DelegadosService.crearDelegado(form);
      }

      if (!result.success) {
        if (result.message.includes("cedula")) {
          setErrors(prev => ({ ...prev, cedula: result.message }));
        } else {
          setErrors(prev => ({ ...prev, general: result.message }));
        }
        return;
      }

      onSuccess();

      if (!delegado) {
        setForm({
          nombre: "",
          apellido: "",
          cedula: "",
          telefono: "",
          correo: "",
          estado: true
        });
      }

    } catch (err) {
      console.error("Error crítico guardando árbitro:", err);
      setErrors(prev => ({
        ...prev,
        general: "Error del servidor. Intente más tarde."
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
      <h2 className="text-xl font-semibold text-gray-800">
        {delegado ? "Editar Delegado" : "Nuevo Delegado"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombres *"
          value={form.nombre}
          error={errors.nombre}
          onChange={v => setForm({ ...form, nombre: v })}
        />

        <Input
          label="Apellidos *"
          value={form.apellido}
          error={errors.apellido}
          onChange={v => setForm({ ...form, apellido: v })}
        />

        <Input
          label="Cédula *"
          value={form.cedula}
          error={errors.cedula}
          onChange={v => setForm({ ...form, cedula: v.replace(/\D/g, "").slice(0, 10) })}
        />

        <Input
          label="Teléfono"
          value={form.telefono}
          error={errors.telefono}
          onChange={v => setForm({ ...form, telefono: v.replace(/\D/g, "").slice(0, 10) })}
        />

        <Input
          label="Correo"
          value={form.correo}
          error={errors.correo}
          onChange={v => setForm({ ...form, correo: v })}
        />

      </div>

      {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#00923F] hover:bg-[#007A34] text-white py-3 rounded-lg disabled:opacity-70"
      >
        {isLoading ? "Guardando..." : delegado ? "Actualizar Delegado" : "Crear Delegado"}
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
