"use client";

import { useState, useEffect } from "react";
import { Categoria } from "@/types/categoria";
import { CategoriasService } from "@/services/categorias.service";

interface Props {
  categoria?: Categoria;
  onSuccess: () => void;
}

export default function CategoriaForm({ categoria, onSuccess }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    edad_minima: "",
    edad_maxima: "",
    descripcion: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // =============================
  // CARGAR DATOS PARA EDICIÓN
  // =============================
  useEffect(() => {
    if (categoria) {
      setForm({
        nombre: categoria.nombre ?? "",
        edad_minima: categoria.edad_minima?.toString() ?? "",
        edad_maxima: categoria.edad_maxima?.toString() ?? "",
        descripcion: categoria.descripcion ?? ""
      });
    } else {
      setForm({
        nombre: "",
        edad_minima: "",
        edad_maxima: "",
        descripcion: ""
      });
    }
    setErrors({});
  }, [categoria]);

  // =============================
  // VALIDACIONES
  // =============================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (form.edad_minima && isNaN(Number(form.edad_minima))) {
      newErrors.edad_minima = "Edad mínima inválida";
    }

    if (form.edad_maxima && isNaN(Number(form.edad_maxima))) {
      newErrors.edad_maxima = "Edad máxima inválida";
    }

    if (
      form.edad_minima &&
      form.edad_maxima &&
      Number(form.edad_minima) > Number(form.edad_maxima)
    ) {
      newErrors.edad_maxima = "La edad máxima debe ser mayor o igual a la mínima";
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
    const payload = {
      nombre: form.nombre.trim(),
      edad_minima: form.edad_minima ? Number(form.edad_minima) : null,
      edad_maxima: form.edad_maxima ? Number(form.edad_maxima) : null,
      descripcion: form.descripcion.trim()
    };

    const result: any = categoria?.id_categoria
      ? await CategoriasService.editar(categoria.id_categoria, payload)
      : await CategoriasService.crear(payload);

    // 🟡 ERROR DE NEGOCIO (400, 409, etc.)
    if (result?.success === false) {
      const message = result.message || "Error al guardar categoría";

      if (message.toLowerCase().includes("nombre")) {
        setErrors(prev => ({ ...prev, nombre: message }));
      } else {
        setErrors(prev => ({ ...prev, general: message }));
      }
      return;
    }

    // ✅ ÉXITO (cuando viene Categoria directa)
    onSuccess();

    if (!categoria) {
      setForm({
        nombre: "",
        edad_minima: "",
        edad_maxima: "",
        descripcion: ""
      });
    }

  } catch (err) {
    // 🔴 ERROR CRÍTICO (500+)
    console.error("Error crítico guardando categoría:", err);
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
        <Input
          label="Nombre *"
          value={form.nombre}
          error={errors.nombre}
          onChange={v => setForm({ ...form, nombre: v })}
          full
        />

        <Input
          label="Edad mínima"
          value={form.edad_minima}
          error={errors.edad_minima}
          onChange={v => setForm({ ...form, edad_minima: v.replace(/\D/g, "") })}
        />

        <Input
          label="Edad máxima"
          value={form.edad_maxima}
          error={errors.edad_maxima}
          onChange={v => setForm({ ...form, edad_maxima: v.replace(/\D/g, "") })}
        />

        <Textarea
          label="Descripción"
          value={form.descripcion}
          error={errors.descripcion}
          onChange={v => setForm({ ...form, descripcion: v })}
        />
      </div>

      {errors.general && (
        <p className="text-sm text-red-600">{errors.general}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#00923F] hover:bg-[#007A34] text-white py-3 rounded-lg disabled:opacity-70"
      >
        {isLoading
          ? "Guardando..."
          : categoria
          ? "Actualizar Categoría"
          : "Crear Categoría"}
      </button>
    </form>
  );
}

/* =============================
   INPUTS REUTILIZABLES
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

function Textarea({
  label,
  value,
  error,
  onChange
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg resize-none ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
