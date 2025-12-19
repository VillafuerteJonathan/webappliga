"use client";

import { useEffect, useState } from "react";
import { DelegadosService } from "@/services/delegados.service";
import { Delegado } from "@/types/delegado";
import DelegadoForm from "@/components/usuarios/delegados/DelegadoForm";
import DelegadoTable from "@/components/usuarios/delegados/DelegadoTable";

export default function DelegadosPage() {
  const [delegados, setDelegados] = useState<Delegado[]>([]);
  const [editing, setEditing] = useState<Delegado | undefined>();
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // =============================
  // CARGAR DELEGADOS
  // =============================
  const cargarDelegados = async () => {
    try {
      setLoading(true);
      const data = await DelegadosService.listar();
      setDelegados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar delegados:", error);
      setDelegados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDelegados();
  }, []);

  // =============================
  // FORM HANDLERS
  // =============================
  const onSuccess = () => {
    setEditing(undefined);
    setIsFormOpen(false);
    cargarDelegados();
  };

  const handleNuevoDelegado = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const handleEditar = (delegado: Delegado) => {
    setEditing(delegado);
    setIsFormOpen(true);
  };

  const handleCancelar = () => {
    setEditing(undefined);
    setIsFormOpen(false);
  };

  // =============================
  // FILTROS SEGUROS
  // =============================
  const delegadosActivos = delegados.filter(d => !d.eliminado);
  const activos = delegadosActivos.filter(d => d.estado === true);
  const inactivos = delegadosActivos.filter(d => d.estado === false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* HEADER */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Delegados</h1>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-green-600">{activos.length} activos</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{inactivos.length} inactivos</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{delegadosActivos.length} total</span>
            </div>
          </div>

          <button
            onClick={handleNuevoDelegado}
            className="bg-[#00923F] hover:bg-[#007A34] text-white font-medium py-2 px-4 rounded-md text-sm"
          >
            + Nuevo Delegado
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* FORM */}
        {isFormOpen && (
          <div className="lg:w-1/3">
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="px-3 py-2.5 border-b bg-gray-50 flex justify-between">
                <div>
                  <h2 className="text-sm font-medium">
                    {editing ? "Editar Delegado" : "Nuevo Delegado"}
                  </h2>
                  {editing && (
                    <p className="text-xs text-gray-500">
                      {editing.nombre} {editing.apellido}
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

              <div className="p-3">
                <DelegadoForm delegado={editing} onSuccess={onSuccess} />
              </div>
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className={isFormOpen ? "lg:w-2/3" : "w-full"}>
          <div className="bg-white rounded-md border border-gray-200">
            <div className="p-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-xs text-gray-600">
                    Cargando delegados...
                  </p>
                </div>
              ) : delegadosActivos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0h.01" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    No hay delegados registrados
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Comienza registrando el primer delegado
                  </p>
                  <button
                    onClick={handleNuevoDelegado}
                    className="inline-flex items-center px-4 py-2 bg-[#00923F] hover:bg-[#007A34] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    + Agregar Primer Delegado
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <DelegadoTable
                    delegados={delegadosActivos}
                    recargar={cargarDelegados}
                    onEditar={handleEditar}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}