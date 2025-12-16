"use client";

import { useEffect, useState } from "react";
import { CanchasService } from "@/services/canchas.service";
import { Cancha } from "@/types/cancha";
import CanchaForm from "@/components/canchas/CanchaForm";
import CanchaTable from "@/components/canchas/CanchaTable";

export default function CanchasPage() {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [editing, setEditing] = useState<Cancha | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const cargarCanchas = async () => {
    try {
      setLoading(true);
      const data = await CanchasService.listar();
      setCanchas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar canchas:", err);
      setCanchas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCanchas();
  }, []);

  const onSuccess = () => {
    setEditing(undefined);
    setIsFormOpen(false);
    cargarCanchas();
  };

  const handleNuevaCancha = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const handleEditar = (cancha: Cancha) => {
    setEditing(cancha);
    setIsFormOpen(true);
  };

  const handleCancelar = () => {
    setEditing(undefined);
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Canchas</h1>
          <p className="mt-2 text-gray-600">
            Administra las canchas deportivas del sistema
          </p>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel izquierdo - Formulario */}
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header del formulario */}
                <div className="bg-[#004C97] px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    {editing ? "Editar Cancha" : "Nueva Cancha"}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {editing 
                      ? `Editando: ${editing.nombre}` 
                      : "Completa los datos para registrar una nueva cancha"}
                  </p>
                </div>

                {/* Contenido del formulario */}
                <div className="p-6">
                  {isFormOpen ? (
                    <>
                      <CanchaForm cancha={editing} onSuccess={onSuccess} />
                      <button
                        onClick={handleCancelar}
                        className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 border border-gray-300"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Agregar Cancha
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Haz clic en el botón para registrar una nueva cancha deportiva
                      </p>
                      <button
                        onClick={handleNuevaCancha}
                        className="w-full bg-[#00923F] hover:bg-[#007A34] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Nueva Cancha
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
             
            </div>
          </div>

          {/* Panel derecho - Tabla */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header de la tabla */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Lista de Canchas</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {canchas.length} canchas registradas
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                   
                  </div>
                </div>
              </div>

              {/* Cargando o Tabla */}
              <div className="p-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Cargando canchas...</p>
                  </div>
                ) : (
                  <>
                    {canchas.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No hay canchas registradas
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Comienza agregando tu primera cancha
                        </p>
                        <button
                          onClick={handleNuevaCancha}
                          className="inline-flex items-center px-4 py-2 bg-[#00923F] hover:bg-[#007A34] text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Agregar Primera Cancha
                        </button>
                      </div>
                    ) : (
                      <CanchaTable
                        canchas={canchas}
                        recargar={cargarCanchas}
                        onEditar={handleEditar}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}