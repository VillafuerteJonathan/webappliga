"use client";

import { useState, useEffect } from "react";
import { CanchasService } from "@/services/canchas.service";
import { Cancha } from "@/types/cancha";

interface Props {
  cancha?: Cancha;
  onSuccess: () => void;
}

export default function CanchaForm({ cancha, onSuccess }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    tipo_deporte: "",
    ubicacion: ""
  });

  // Efecto para cargar datos de la cancha cuando se pasa por props
  useEffect(() => {
    if (cancha) {
      setForm({
        nombre: cancha.nombre || "",
        tipo_deporte: cancha.tipo_deporte || "",
        ubicacion: cancha.ubicacion || ""
      });
    } else {
      // Si no hay cancha (creación), limpiar el formulario
      setForm({ nombre: "", tipo_deporte: "", ubicacion: "" });
    }
  }, [cancha]);

  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (cancha && cancha.id_cancha) {
        await CanchasService.editar(cancha.id_cancha, form);
      } else {
        await CanchasService.crear(form);
      }
      onSuccess();
      // Solo limpiar si estamos creando una nueva cancha
      if (!cancha) {
        setForm({ nombre: "", tipo_deporte: "", ubicacion: "" });
      }
    } catch (err) {
      console.error("Error guardando cancha:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {cancha ? "Editar Cancha" : "Nueva Cancha"}
        </h2>
        {cancha && (
          <p className="text-sm text-gray-500 mb-4">
            Editando: {cancha.nombre}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Cancha *
          </label>
          <input
            id="nombre"
            placeholder="Ej: Cancha Principal"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 bg-white"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            required
            style={{ color: "#111827" }} // Color gris oscuro para mejor visibilidad
          />
        </div>

       <div>
  <label htmlFor="tipo_deporte" className="block text-sm font-medium text-gray-700 mb-2">
    Tipo de Deporte *
  </label>
  <div className="relative">
    <select
      id="tipo_deporte"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none bg-white text-gray-900 hover:border-gray-400 cursor-pointer shadow-sm"
      value={form.tipo_deporte}
      onChange={e => setForm({ ...form, tipo_deporte: e.target.value })}
      required
    >
      <option value="" disabled className="text-gray-400 py-2">
        Seleccione un deporte
      </option>
      <option value="Fútbol" className="py-3 text-gray-700 hover:bg-blue-50">
        Fútbol
      </option>
      <option value="Básquet" className="py-3 text-gray-700 hover:bg-blue-50">
        Básquet
      </option>
    </select>
    
    {/* Icono de flecha personalizado */}
    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

</div>


        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <input
            id="ubicacion"
            placeholder="Ej: Zona Norte, Pabellón A"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 bg-white"
            value={form.ubicacion}
            onChange={e => setForm({ ...form, ubicacion: e.target.value })}
            style={{ color: "#111827" }}
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#00923F] hover:bg-[#007A34] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {cancha ? "Actualizando..." : "Creando..."}
            </span>
          ) : (
            <span>{cancha ? "Actualizar Cancha" : "Crear Cancha"}</span>
          )}
        </button>
      </div>

      {cancha && (
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
          <p>ID: {cancha.id_cancha}</p>
          <p>Estado: {cancha.estado ? "Activa" : "Inactiva"}</p>
        </div>
      )}
    </form>
  );
}