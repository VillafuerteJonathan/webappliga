"use client";

import { useEffect, useState } from "react";
import { ArbitrosService } from "@/services/arbitros.service";
import { Arbitro } from "@/types/arbitro";
import ArbitroForm from "@/components/albitros/AlbitroFrom";
import ArbitroTable from "@/components/albitros/AlbitroTable";

export default function ArbitrosPage() {
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);
  const [editing, setEditing] = useState<Arbitro | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const cargarArbitros = async () => {
    try {
      setLoading(true);
      const data = await ArbitrosService.listar();
      setArbitros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar árbitros:", err);
      setArbitros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarArbitros();
  }, []);

  const onSuccess = () => {
    setEditing(undefined);
    setIsFormOpen(false);
    cargarArbitros();
  };

  const handleNuevoArbitro = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const handleEditar = (arbitro: Arbitro) => {
    setEditing(arbitro);
    setIsFormOpen(true);
  };

  const handleCancelar = () => {
    setEditing(undefined);
    setIsFormOpen(false);
  };

  // Filtrar árbitros activos (no eliminados)
  const arbitrosActivos = arbitros.filter(a => !a.eliminado);
  const arbitrosEliminados = arbitros.filter(a => a.eliminado);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header compacto */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gestión de Árbitros</h1>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-green-600 font-medium">
                {arbitrosActivos.filter(a => a.estado).length} activos
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                {arbitrosActivos.filter(a => !a.estado).length} inactivos
              </span>
            </div>
          </div>
          
          <button
            onClick={handleNuevoArbitro}
            className="bg-[#00923F] hover:bg-[#007A34] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            + Nuevo Árbitro
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel izquierdo - Formulario (solo cuando está abierto) */}
        {isFormOpen && (
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header compacto del formulario */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {editing ? "Editar Árbitro" : "Nuevo Árbitro"}
                    </h2>
                    {editing && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {editing.nombres} {editing.apellidos}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCancelar}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contenido del formulario */}
              <div className="p-4">
                <ArbitroForm arbitro={editing} onSuccess={onSuccess} />
              </div>
            </div>
          </div>
        )}

        {/* Panel derecho - Tabla */}
        <div className={`${isFormOpen ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Tabla sin header adicional */}
            <div className="p-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
                  <p className="mt-3 text-sm text-gray-600">Cargando árbitros...</p>
                </div>
              ) : (
                <>
                  {arbitrosActivos.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0h.01" />
                        </svg>
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        No hay árbitros registrados
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Comienza registrando el primer árbitro
                      </p>
                      <button
                        onClick={handleNuevoArbitro}
                        className="inline-flex items-center px-4 py-2 bg-[#00923F] hover:bg-[#007A34] text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        + Agregar Primer Árbitro
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <ArbitroTable
                        arbitros={arbitrosActivos}
                        recargar={cargarArbitros}
                        onEditar={handleEditar}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}