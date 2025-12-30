"use client";

import { useEffect, useState } from "react";
import { EquiposService } from "@/services/equipos.service";
import { Equipo } from "@/types/equipo";
import EquipoForm from "@/components/equipos/EquipoForm";
import EquipoTable from "@/components/equipos/EquipoTabla";
import { CategoriasService } from "@/services/categorias.service"; // Asegúrate de tener este servicio
import { Categoria } from "@/types/categoria";


// Tipo para categorías (ajústalo según tu proyecto)


export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editing, setEditing] = useState<Equipo | undefined>();
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const data = await EquiposService.listar();
      setEquipos(data);
    } catch (err) {
      console.error("Error al cargar equipos:", err);
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar categorías (debes implementar tu servicio)

const cargarCategorias = async () => {
  try {
    const data = await CategoriasService.listar();
    setCategorias(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error al cargar categorías:", err);
    setCategorias([]);
  }
};

  useEffect(() => {
    cargarEquipos();
    cargarCategorias();
  }, []);

  const onSuccess = () => {
    setEditing(undefined);
    setIsFormOpen(false);
    cargarEquipos(); // 🔄 RECARGA REAL
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
            <p className="text-gray-600 mt-1">
              Administra los equipos registrados en el sistema
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(undefined);
              setIsFormOpen(true);
            }}
            className="bg-[#00923F] hover:bg-[#007A34] text-white px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Equipo
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Formulario (sidebar) */}
          {isFormOpen && (
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editing ? "Editar Equipo" : "Nuevo Equipo"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditing(undefined);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <EquipoForm 
                  equipo={editing} 
                  onSuccess={onSuccess} 
                  categorias={categorias}
                />
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className={`${isFormOpen ? "lg:w-2/3" : "w-full"}`}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00923F] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando equipos...</p>
                  </div>
                </div>
              ) : (
                <EquipoTable
                  equipos={equipos.filter(e => !e.eliminado)}
                  onEditar={(equipo) => {
                    setEditing(equipo);
                    setIsFormOpen(true);
                  }}
                  recargar={cargarEquipos}
                  categorias={categorias}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}