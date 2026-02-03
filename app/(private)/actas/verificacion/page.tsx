"use client";
import React, { useState, useEffect } from "react";
import CampeonatosPendientes from "@/components//actas/CampeonatosPendientes";
import PartidosPendientes from "@/components//actas/PartidosPendientes";
import DetalleActa from "@/components/actas/DetalleActa";
import { ValidadorService } from "@/services/validador.service";
import { Campeonato, Partido } from "@/types/validador";
import type { RevisarActaResult } from "@/components/actas/DetalleActa";

export default function VerificacionPage() {
  // Estados
  const [campeonatoSeleccionado, setCampeonatoSeleccionado] = useState<Campeonato | null>(null);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Función para seleccionar campeonato
  const handleSelectCampeonato = (campeonato: Campeonato) => {
    console.log("🏆 Campeonato seleccionado:", campeonato);
    setCampeonatoSeleccionado(campeonato);
    setPartidoSeleccionado(null);
    setError(null);
  };

  // Función para seleccionar partido
  const handleSeleccionarPartido = (partido: Partido) => {
    console.log("⚽ Partido seleccionado:", partido);
    setPartidoSeleccionado(partido);
  };

  // Función para volver a campeonatos
  const handleVolverACampeonatos = () => {
    setCampeonatoSeleccionado(null);
    setPartidoSeleccionado(null);
    setError(null);
  };

  // Función para volver a partidos
  const handleVolverAPartidos = () => {
    setPartidoSeleccionado(null);
    setError(null);
  };

  // Función para verificar acta - CORREGIDA
  const handleVerificarActa = async (idPartido: string, comentarios: string): Promise<RevisarActaResult> => {
    if (!idPartido) {
      return {
        ok: false,
        type: "generic",
        message: "ID de partido no válido"
      };
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await ValidadorService.revisarActa(idPartido, comentarios);
      
      console.log("📋 Resultado de revisarActa:", resultado);
      
      // ✅ Si es exitoso
      if (resultado.ok) {
        // Actualizar la lista después de un breve delay
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
        }, 1000);
        
        return {
          ok: true,
          message: resultado.message || "Acta verificada exitosamente"
        };
      } 
      // 🚨 Error de integridad
      else if (resultado.type === "data_integrity") {
        return {
          ok: false,
          type: "data_integrity",
          message: resultado.message || "Error de integridad: Los datos no coinciden con blockchain"
        };
      }
      // ⚠️ Ya revisada
      else if (resultado.type === "already_reviewed") {
        return {
          ok: false,
          type: "already_reviewed",
          message: resultado.message || "Este acta ya ha sido revisada anteriormente"
        };
      }
      // ❌ Otros errores
      else {
        return {
          ok: false,
          type: resultado.type || "generic",
          message: resultado.message || "Error al aprobar el acta"
        };
      }
    } catch (err: any) {
      console.error("❌ Error en handleVerificarActa:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error al procesar la solicitud";
      
      // Manejar errores específicos de sesión
      if (errorMessage.includes("sesión") || errorMessage.includes("login") || err.response?.status === 401) {
        return {
          ok: false,
          type: "session_error",
          message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        };
      }
      
      return {
        ok: false,
        type: "server_error",
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar error
  const handleError = (mensaje: string) => {
    setError(mensaje);
  };

  // Efecto para limpiar errores al cambiar de vista
  useEffect(() => {
    setError(null);
  }, [campeonatoSeleccionado, partidoSeleccionado]);

  // Función para refrescar datos
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setError(null);
  };

  // Renderizar el estado actual
  const renderContent = () => {
    // 1. Si hay partido seleccionado, mostrar detalle del acta
    if (partidoSeleccionado) {
      return (
        <DetalleActa
          partido={partidoSeleccionado}
          onVerificarActa={handleVerificarActa}
          onVolver={handleVolverAPartidos}
        />
      );
    }

    // 2. Si hay campeonato seleccionado, mostrar partidos pendientes
    if (campeonatoSeleccionado) {
      return (
        <PartidosPendientes
          campeonato={campeonatoSeleccionado}
          onSeleccionarPartido={handleSeleccionarPartido}
          onVolver={handleVolverACampeonatos}
          key={`partidos-${refreshKey}`}
        />
      );
    }

    // 3. Por defecto, mostrar lista de campeonatos
    return (
      <CampeonatosPendientes
        onSelectCampeonato={handleSelectCampeonato}
        key={`campeonatos-${refreshKey}`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Validación de Actas
              </h1>
              <p className="text-gray-600 mt-1">
                {partidoSeleccionado 
                  ? "Validación de acta del partido" 
                  : campeonatoSeleccionado 
                  ? `Partidos pendientes - ${campeonatoSeleccionado.nombre}` 
                  : "Campeonatos con actas pendientes"}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className={`${!campeonatoSeleccionado ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                  📋 Campeonatos
                </span>
                
                {campeonatoSeleccionado && (
                  <>
                    <span className="text-gray-400">›</span>
                    <span className={`${!partidoSeleccionado ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                      ⚽ {campeonatoSeleccionado.nombre}
                    </span>
                  </>
                )}
                
                {partidoSeleccionado && (
                  <>
                    <span className="text-gray-400">›</span>
                    <span className="font-semibold text-blue-600">
                      📄 Acta #{partidoSeleccionado.id_partido.substring(0, 8)}
                    </span>
                  </>
                )}
              </div>
              
              {/* Botón de refrescar */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Actualizar datos"
                disabled={loading}
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Mensaje de error global */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-700 font-medium">Error en la operación</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow-2xl animate-fade-in">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-800 font-medium">Procesando solicitud...</p>
              <p className="text-gray-500 text-sm mt-1">Por favor, espera un momento</p>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>

        {/* Footer informativo - Solo mostrar en vista inicial */}
        {!partidoSeleccionado && !campeonatoSeleccionado && (
          <div className="mt-10 pt-8 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-gray-700">
                <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Información importante sobre la validación
                </p>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span>Las actas deben estar <strong>registradas en blockchain</strong> antes de poder aprobarlas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span>La validación es <strong>irreversible</strong> y queda registrada en el historial de auditoría</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span>Solo se muestran partidos <strong>finalizados</strong> con actas pendientes de validación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span>Puedes agregar <strong>comentarios opcionales</strong> en cada validación</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="text-sm font-medium text-gray-900 mb-2">📊 Estados de los partidos:</div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-800">Pendiente de validación</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-800">Registrado en blockchain</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-800">No registrado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Botón de ayuda flotante */}
      <button
        onClick={() => window.open('/ayuda/validacion', '_blank')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-30"
        title="Ayuda sobre validación"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}