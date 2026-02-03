"use client";
import React, { useEffect, useState } from "react";
import { ValidadorService } from "@/services/validador.service";
import { Campeonato, Partido } from "@/types/validador";

interface Props {
  campeonato: Campeonato | null;
  onSeleccionarPartido: (partido: Partido) => void;
  onVolver?: () => void;
}

const PartidosPendientes: React.FC<Props> = ({ campeonato, onSeleccionarPartido, onVolver }) => {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartidos = async () => {
      if (!campeonato?.id_campeonato) {
        setError("Campeonato no seleccionado");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await ValidadorService.obtenerPartidosPendientes(campeonato.id_campeonato);
        console.log("📋 Partidos recibidos del backend:", data);
        
        // 🔍 DEPURACIÓN: Verificar estructura de datos
        if (data && data.length > 0) {
          console.log("Primer partido recibido:", {
            id: data[0].id_partido,
            actas: data[0].actas,
            hash_acta: data[0].hash_acta,
            arbitro: data[0].nombre_arbitro,
            vocal: data[0].nombre_vocal
          });
        }
        
        setPartidos(data);
      } catch (err: any) {
        console.error("❌ Error cargando partidos:", err);
        
        // Manejo específico de errores de autenticación
        if (err?.status === 401 || err?.status === 403) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          // Opcional: redirigir al login
          // window.location.href = '/login';
        } else {
          setError(err.message || "Error al cargar los partidos pendientes");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (campeonato?.id_campeonato) {
      fetchPartidos();
    }
  }, [campeonato]);

  // Función para obtener resultado segura (maneja null/undefined)
  const getResultado = (partido: Partido) => {
    const golesLocal = partido.goles_local ?? 0;
    const golesVisitante = partido.goles_visitante ?? 0;
    return `${golesLocal} - ${golesVisitante}`;
  };

  // Función para verificar si un equipo no se presentó
  const equipoNoPresento = (partido: Partido) => {
    return partido.goles_local === null || partido.goles_visitante === null;
  };

  // Función para obtener el mensaje de resultado
  const getMensajeResultado = (partido: Partido) => {
    if (partido.goles_local === null && partido.goles_visitante === null) {
      return "Ambos equipos no se presentaron";
    } else if (partido.goles_local === null) {
      return `${partido.equipo_local} no se presentó`;
    } else if (partido.goles_visitante === null) {
      return `${partido.equipo_visitante} no se presentó`;
    }
    return "Resultado Final";
  };

  const formatFecha = (fecha: string) => {
    if (!fecha || fecha === "Por definir") return "Por definir";
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  const renderLogoEquipo = (logoUrl: string | undefined, equipoNombre: string) => {
    const urlCompleta = logoUrl 
      ? ValidadorService.construirUrlArchivo(logoUrl)
      : null;

    if (urlCompleta) {
      return (
        <div className="w-12 h-12 mx-auto mb-2 relative">
          <img
            src={urlCompleta}
            alt={`Logo ${equipoNombre}`}
            className="w-full h-full object-contain rounded-full"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              
              // Mostrar placeholder
              const placeholder = target.parentElement?.querySelector('.logo-placeholder');
              if (placeholder) {
                placeholder.classList.remove('hidden');
              }
            }}
          />
          <div className="logo-placeholder w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2 absolute top-0 left-0 hidden">
            <span className="text-gray-700 font-bold text-sm">
              {(equipoNombre || "EQ").substring(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      );
    }
    
    const iniciales = (equipoNombre || "EQ").substring(0, 2).toUpperCase();
    return (
      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
        <span className="text-gray-700 font-bold text-sm">{iniciales}</span>
      </div>
    );
  };

  // Contar actas disponibles (solo las que existen)
  const contarActas = (partido: Partido) => {
    if (!partido.actas || !Array.isArray(partido.actas)) return 0;
    return partido.actas.filter(acta => 
      acta && acta.ruta && acta.ruta.trim() !== ''
    ).length || 0;
  };

  // Determinar si hay actas para revisar
  const tieneActas = (partido: Partido) => {
    return contarActas(partido) > 0;
  };

  // Obtener el mensaje de estado de actas
  const getMensajeActas = (partido: Partido) => {
    const count = contarActas(partido);
    if (count === 0) {
      return "Sin actas disponibles";
    } else if (count === 1) {
      return "1 acta disponible";
    } else {
      return `${count} actas disponibles`;
    }
  };

  // Verificar estado blockchain
  const getEstadoBlockchain = (partido: Partido) => {
    return ValidadorService.verificarActaBlockchain(partido);
  };

  // Determinar si se puede revisar el acta
  const puedeRevisar = (partido: Partido) => {
    const estadoBlockchain = getEstadoBlockchain(partido);
    const tieneArchivos = tieneActas(partido);
    
    return estadoBlockchain.valida && tieneArchivos;
  };

  if (!campeonato) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Selecciona un campeonato primero</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando partidos pendientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-600 font-medium">{error}</p>
            {onVolver && (
              <button
                onClick={onVolver}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                ← Volver a campeonatos
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (partidos.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 inline-block">
          <svg className="w-12 h-12 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-green-800 mb-2">¡Todo verificado!</h3>
          <p className="text-green-600">
            No hay partidos pendientes en este campeonato
          </p>
          {onVolver && (
            <button
              onClick={onVolver}
              className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              ← Volver a campeonatos
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          {onVolver && (
            <button
              onClick={onVolver}
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <span>←</span>
              <span>Volver a campeonatos</span>
            </button>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">{campeonato.nombre}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              {partidos.length} partido{partidos.length !== 1 ? 's' : ''} pendiente{partidos.length !== 1 ? 's' : ''}
            </span>
            
            {campeonato.fecha_inicio && (
              <span className="text-xs text-gray-500">
                📅 {formatFecha(campeonato.fecha_inicio)}
                {campeonato.fecha_fin && ` - ${formatFecha(campeonato.fecha_fin)}`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {partidos.map((partido) => {
          const noSePresento = equipoNoPresento(partido);
          const cantidadActas = contarActas(partido);
          const tieneActa = tieneActas(partido);
          const estadoBlockchain = getEstadoBlockchain(partido);
          const puede = puedeRevisar(partido);
          
          return (
            <div 
              key={partido.id_partido} 
              className={`bg-white border ${noSePresento ? 'border-red-200' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 group`}
              onClick={() => onSeleccionarPartido(partido)}
            >
              <div className="text-center mb-4 pb-3 border-b border-gray-100">
                <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {formatFecha(partido.fecha_encuentro)} • {partido.hora_encuentro}
                  </span>
                </div>
                {partido.cancha && (
                  <div className="mt-2 text-xs text-gray-500">
                    📍 {partido.cancha}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  {renderLogoEquipo(partido.logo_local, partido.equipo_local)}
                  <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base px-2">
                    {partido.equipo_local}
                  </h3>
                  {partido.goles_local === null && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      No se presentó
                    </span>
                  )}
                </div>

                <div className="mx-4 text-center">
                  <div className={`text-xl md:text-2xl font-bold ${
                    noSePresento ? 'text-red-600' : 'text-gray-800'
                  }`}>
                    {getResultado(partido)}
                  </div>
                  <p className={`text-xs mt-1 ${
                    noSePresento ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {getMensajeResultado(partido)}
                  </p>
                </div>

                <div className="text-center flex-1">
                  {renderLogoEquipo(partido.logo_visitante, partido.equipo_visitante)}
                  <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base px-2">
                    {partido.equipo_visitante}
                  </h3>
                  {partido.goles_visitante === null && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      No se presentó
                    </span>
                  )}
                </div>
              </div>

              {/* Información de árbitros */}
              {(partido.nombre_arbitro || partido.nombre_vocal) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    {partido.nombre_arbitro && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Árbitro: {ValidadorService.obtenerNombreArbitro(partido)}</span>
                      </div>
                    )}
                    {partido.nombre_vocal && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Vocal: {ValidadorService.obtenerNombreVocal(partido)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estado Blockchain */}
              {partido.hash_acta && (
                <div className="mt-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    estadoBlockchain.valida 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {estadoBlockchain.valida ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    <span className="truncate max-w-[200px]">
                      {estadoBlockchain.mensaje}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 ${
                    tieneActa ? 'text-blue-600' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className={`text-sm ${
                    tieneActa ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {getMensajeActas(partido)}
                  </span>
                </div>
                
                <button 
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    puede
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 group-hover:gap-3' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!puede}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (puede) {
                      onSeleccionarPartido(partido);
                    }
                  }}
                  title={!puede ? "No se puede revisar: falta acta o registro blockchain" : "Verificar acta"}
                >
                  <span>{puede ? 'Verificar Acta' : 'No revisable'}</span>
                  {puede && (
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartidosPendientes;