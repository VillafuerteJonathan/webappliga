"use client";

import { useState, useEffect } from "react";
import { EquiposService } from "@/services/equipos.service";
import { Equipo } from "@/types/equipo";


interface Props {
  equipo?: Equipo;
  onSuccess: () => void;
  categorias: Array<{ id_categoria: string; nombre: string }>; // Asegúrate de tener este tipo
  canchas: Array<{ id_cancha: string; nombre: string }>; // Tipo para canchas
}

export default function EquipoForm({ equipo, onSuccess, categorias, canchas }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria_id: "",
    cancha_id: "",
    logo_url: "",
    nombre_representante: "",
    celular_representante: "",
    estado: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // =============================
  // CARGAR DATOS PARA EDICIÓN
  // =============================
  useEffect(() => {
    if (equipo) {
      setForm({
        nombre: equipo.nombre ?? "",
        descripcion: equipo.descripcion ?? "",
        categoria_id: equipo.categoria_id ?? "",
        cancha_id: equipo.cancha_id ?? "",
        logo_url: equipo.logo_url ?? "",
        nombre_representante: equipo.nombre_representante ?? "",
        celular_representante: equipo.celular_representante ?? "",
        estado: equipo.estado ?? true
      });
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        categoria_id: "",
        cancha_id: "",
        logo_url: "",
        nombre_representante: "",
        celular_representante: "",
        estado: true
      });
    }
    setErrors({});
  }, [equipo]);

  // =============================
  // VALIDACIONES
  // =============================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.categoria_id.trim()) newErrors.categoria_id = "La categoría es obligatoria";
    if (!form.nombre_representante.trim()) newErrors.nombre_representante = "El nombre del representante es obligatorio";
    if (!form.celular_representante.trim()) newErrors.celular_representante = "El celular es obligatorio";

    if (form.celular_representante && !/^\d{10}$/.test(form.celular_representante)) {
      newErrors.celular_representante = "El celular debe tener 10 dígitos";
    }

    if (form.logo_url && !/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i.test(form.logo_url)) {
      newErrors.logo_url = "URL de imagen inválida";
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
      const result = equipo?.id_equipo
        ? await EquiposService.editar(equipo.id_equipo, form)
        : await EquiposService.crear(form);

      // 🟡 MANEJO DE ERRORES SEGURO
      if (!result.success) {
        const message = result?.message || "Error al guardar equipo";

        if (message.toLowerCase().includes("nombre")) {
          setErrors(prev => ({ ...prev, nombre: message }));
        } else {
          setErrors(prev => ({ ...prev, general: message }));
        }
        return;
      }

      // ✅ ÉXITO
      onSuccess();

      if (!equipo) {
        setForm({
          nombre: "",
          descripcion: "",
          categoria_id: "",
          cancha_id: "",
          logo_url: "",
          nombre_representante: "",
          celular_representante: "",
          estado: true
        });
      }

    } catch (err) {
      console.error("Error crítico guardando equipo:", err);
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
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* NOMBRE (arriba, ancho completo) */}
  <div className="md:col-span-2">
    <Input
      label="Nombre del Equipo *"
      value={form.nombre}
      error={errors.nombre}
      onChange={v => setForm({ ...form, nombre: v })}
    />
  </div>

  {/* CATEGORÍA (abajo izquierda) */}
   <div>
    <label className="block text-sm font-medium mb-1">
      Categoría *
    </label>
    <select
      value={form.categoria_id}
      onChange={e => setForm({ ...form, categoria_id: e.target.value })}
      className={`w-full px-4 py-2 border rounded-lg ${
        errors.categoria_id ? "border-red-300" : "border-gray-300"
      }`}
    >
      <option value="">Seleccionar categoría</option>
      {(categorias ?? []).map(cat => (
        <option key={cat.id_categoria} value={cat.id_categoria}>
          {cat.nombre}
        </option>
      ))}
    </select>
    {errors.categoria_id && (
      <p className="text-xs text-red-600 mt-1">{errors.categoria_id}</p>
    )}
  </div>

  {/* CANCHA */}
  <div>
    <label className="block text-sm font-medium mb-1">
      Cancha *
    </label>
    <select
      value={form.cancha_id}
      onChange={e => setForm({ ...form, cancha_id: e.target.value })}
      className={`w-full px-4 py-2 border rounded-lg ${
        errors.cancha_id ? "border-red-300" : "border-gray-300"
      }`}
    >
      <option value="">Seleccionar cancha</option>
      {(canchas ?? []).map(cancha => (
        <option key={cancha.id_cancha} value={cancha.id_cancha}>
          {cancha.nombre}
        </option>
      ))}
    </select>
    {errors.cancha_id && (
      <p className="text-xs text-red-600 mt-1">{errors.cancha_id}</p>
    )}
  </div>


        <Input label="URL del Logo" value={form.logo_url} error={errors.logo_url}
          onChange={v => setForm({ ...form, logo_url: v })} full />

        <TextArea label="Descripción" value={form.descripcion} error={errors.descripcion}
          onChange={v => setForm({ ...form, descripcion: v })} full />

        <Input label="Nombre del Representante *" value={form.nombre_representante} error={errors.nombre_representante}
          onChange={v => setForm({ ...form, nombre_representante: v })} />

        <Input label="Celular del Representante *" value={form.celular_representante} error={errors.celular_representante}
          onChange={v => setForm({ ...form, celular_representante: v.replace(/\D/g, "").slice(0, 10) })} />
      </div>

      {errors.general && (
        <p className="text-sm text-red-600">{errors.general}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#00923F] hover:bg-[#007A34] text-white py-3 rounded-lg disabled:opacity-70"
      >
        {isLoading ? "Guardando..." : equipo ? "Actualizar Equipo" : "Crear Equipo"}
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
        className={`w-full px-4 py-2 border rounded-lg ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function TextArea({
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
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className={`w-full px-4 py-2 border rounded-lg ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}