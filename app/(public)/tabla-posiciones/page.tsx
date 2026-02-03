"use client";
import React, { useState, useEffect } from "react";
import { PosicionesService, CampeonatoPosiciones, GrupoPosiciones, Posicion } from "@/services/posiciones.service";

export default function PosicionesPage() {
  const [campeonatos, setCampeonatos] = useState<CampeonatoPosiciones[]>([]);
  const [campeonatoSeleccionado, setCampeonatoSeleccionado] = useState<CampeonatoPosiciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grupoExpandido, setGrupoExpandido] = useState<string | null>(null);

  useEffect(() => {
    cargarCampeonatos();
  }, []);

  const cargarCampeonatos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando campeonatos...");
      
      const data = await PosicionesService.listarCampeonatos();
      console.log("📋 Datos recibidos:", data);
      
      if (data && Array.isArray(data)) {
        setCampeonatos(data);
        
        // Seleccionar el primer campeonato por defecto si hay datos
        if (data.length > 0) {
          const primerCampeonato = data[0];
          console.log("🏆 Primer campeonato:", primerCampeonato);
          setCampeonatoSeleccionado(primerCampeonato);
          
          // Expandir el primer grupo si existe
          if (primerCampeonato.grupos && primerCampeonato.grupos.length > 0) {
            setGrupoExpandido(primerCampeonato.grupos[0].id_grupo);
          }
        } else {
          console.log("ℹ️ No hay campeonatos disponibles");
        }
      } else {
        console.warn("⚠️ Datos no válidos recibidos:", data);
        setCampeonatos([]);
        setError("Los datos recibidos no son válidos.");
      }
    } catch (err) {
      console.error("❌ Error cargando campeonatos:", err);
      setError("No se pudieron cargar las posiciones. Intenta nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarCampeonato = (idCampeonato: string) => {
    const campeonato = campeonatos.find(c => c.id_campeonato === idCampeonato);
    if (campeonato) {
      console.log("🎯 Campeonato seleccionado:", campeonato.nombre);
      setCampeonatoSeleccionado(campeonato);
      
      // Expandir el primer grupo del campeonato seleccionado
      if (campeonato.grupos && campeonato.grupos.length > 0) {
        setGrupoExpandido(campeonato.grupos[0].id_grupo);
      } else {
        setGrupoExpandido(null);
      }
    }
  };

  const toggleGrupo = (idGrupo: string) => {
    if (grupoExpandido === idGrupo) {
      setGrupoExpandido(null);
    } else {
      setGrupoExpandido(idGrupo);
    }
  };

  const renderTablaPosiciones = (grupo: GrupoPosiciones) => {
    // Verificar que el grupo tiene tabla_posiciones
    if (!grupo.tabla_posiciones || grupo.tabla_posiciones.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-4">📭</div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">No hay datos disponibles</h4>
          <p className="text-gray-500">Aún no se han registrado posiciones para este grupo.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold w-12 text-center">#</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Equipo</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-center">PJ</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-center">PG</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-center">PE</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-center">PP</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-center">GF</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-center">GC</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-center">DG</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-center bg-blue-600">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {grupo.tabla_posiciones.map((equipo, index) => (
              <tr 
                key={equipo.id_equipo} 
                className={`hover:bg-gray-50 transition-colors ${
                  index < 4 ? "bg-green-50" : // Primeros 4: clasificación
                  index >= grupo.tabla_posiciones.length - 2 ? "bg-red-50" : // Últimos 2: descenso
                  "bg-white"
                }`}
              >
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    index === 0 ? "bg-yellow-100 text-yellow-800" :
                    index === 1 ? "bg-gray-100 text-gray-800" :
                    index === 2 ? "bg-orange-100 text-orange-800" :
                    "bg-gray-50 text-gray-600"
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {equipo.logo_url ? (
                      <img 
                        src={equipo.logo_url} 
                        alt={equipo.equipo}
                        className="w-8 h-8 object-contain rounded-full bg-gray-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/32/6B7280/FFFFFF?text=⚽";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">⚽</span>
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{equipo.equipo}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-gray-700 font-medium">{equipo.pj || 0}</td>
                <td className="py-3 px-4 text-center text-green-600 font-bold">{equipo.pg || 0}</td>
                <td className="py-3 px-4 text-center text-yellow-600 font-bold">{equipo.pe || 0}</td>
                <td className="py-3 px-4 text-center text-red-600 font-bold">{equipo.pp || 0}</td>
                <td className="py-3 px-4 text-center text-blue-600 font-bold">{equipo.gf || 0}</td>
                <td className="py-3 px-4 text-center text-red-500 font-bold">{equipo.gc || 0}</td>
                <td className="py-3 px-4 text-center font-bold">
                  <span className={`px-2 py-1 rounded ${
                    (equipo.dg || 0) > 0 ? "bg-green-100 text-green-800" :
                    (equipo.dg || 0) < 0 ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {(equipo.dg || 0) > 0 ? "+" : ""}{equipo.dg || 0}
                  </span>
                </td>
                <td className="py-3 px-4 text-center bg-blue-50 font-extrabold text-blue-700 text-lg">
                  {equipo.pts || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLeyenda = () => (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Leyenda de colores:</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-gray-600">1° Lugar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 rounded-full"></div>
          <span className="text-sm text-gray-600">Zona de Clasificación</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
          <span className="text-sm text-gray-600">Zona Intermedia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 rounded-full"></div>
          <span className="text-sm text-gray-600">Zona de Descenso</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>PJ:</strong> Partidos Jugados • <strong>PG:</strong> Partidos Ganados • 
          <strong> PE:</strong> Partidos Empatados • <strong>PP:</strong> Partidos Perdidos • 
          <strong> GF:</strong> Goles a Favor • <strong>GC:</strong> Goles en Contra • 
          <strong> DG:</strong> Diferencia de Goles • <strong>PTS:</strong> Puntos
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🏆 Cargando Tablas de Posiciones</h1>
            <p className="text-gray-600">Obteniendo la información más actualizada...</p>
          </div>
          
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">🏆 Tabla de Posiciones</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Consulta pública de las posiciones de todos los equipos organizados por campeonato
          </p>
        </div>

        {/* Selector de Campeonato */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Selecciona un campeonato:</h2>
              <p className="text-sm text-gray-600">Elige el campeonato para ver sus posiciones</p>
            </div>
            
            <div className="flex-1 max-w-md">
              <select
                value={campeonatoSeleccionado?.id_campeonato || ""}
                onChange={(e) => handleSeleccionarCampeonato(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={campeonatos.length === 0}
              >
                {campeonatos.length === 0 ? (
                  <option value="">No hay campeonatos disponibles</option>
                ) : (
                  <>
                    <option value="">Selecciona un campeonato</option>
                    {campeonatos.map((camp) => (
                      <option key={camp.id_campeonato} value={camp.id_campeonato}>
                        {camp.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
              
              {campeonatos.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{campeonatos.length} campeonato{campeonatos.length !== 1 ? 's' : ''} activo{campeonatos.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center animate-fade-in">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar posiciones</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={cargarCampeonatos}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Contenido del Campeonato Seleccionado */}
        {campeonatoSeleccionado ? (
          <>
            {/* Información del campeonato */}
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{campeonatoSeleccionado.nombre}</h2>
                    <div className="flex items-center gap-4 mt-2 text-blue-100">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {campeonatoSeleccionado.grupos?.reduce((total, grupo) => 
                          total + (grupo.tabla_posiciones?.length || 0), 0
                        ) || 0} equipos
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {campeonatoSeleccionado.grupos?.length || 0} {campeonatoSeleccionado.grupos?.length === 1 ? 'grupo' : 'grupos'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Última actualización</p>
                  <p className="font-semibold">{new Date().toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>

            {/* Leyenda */}
            {renderLeyenda()}

            {/* Grupos del Campeonato */}
            <div className="space-y-6">
              {campeonatoSeleccionado.grupos && campeonatoSeleccionado.grupos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="text-gray-400 text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin grupos asignados</h3>
                  <p className="text-gray-500">Este campeonato aún no tiene grupos configurados.</p>
                </div>
              ) : campeonatoSeleccionado.grupos && campeonatoSeleccionado.grupos.length === 1 ? (
                // Si solo hay un grupo, mostrar directamente
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">
                      Grupo: {campeonatoSeleccionado.grupos[0].nombre}
                    </h3>
                  </div>
                  <div className="p-6">
                    {renderTablaPosiciones(campeonatoSeleccionado.grupos[0])}
                  </div>
                </div>
              ) : campeonatoSeleccionado.grupos && campeonatoSeleccionado.grupos.length > 1 ? (
                // Si hay múltiples grupos, mostrar acordeón
                campeonatoSeleccionado.grupos.map((grupo) => {
                  const isExpanded = grupoExpandido === grupo.id_grupo;
                  return (
                    <div key={grupo.id_grupo} className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <button
                        onClick={() => toggleGrupo(grupo.id_grupo)}
                        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-lg">G</span>
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-gray-800">{grupo.nombre}</h3>
                            <p className="text-gray-600">
                              {grupo.tabla_posiciones?.length || 0} equipos
                              {grupo.tabla_posiciones?.length === 0 && " (sin datos)"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isExpanded ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isExpanded ? 'Ocultar' : 'Ver'} tabla
                          </span>
                          <svg 
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-6 border-t border-gray-200 animate-fade-in">
                          {renderTablaPosiciones(grupo)}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : null}
            </div>
          </>
        ) : campeonatos.length === 0 ? (
          // Sin campeonatos disponibles
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay campeonatos activos</h3>
            <p className="text-gray-500">Actualmente no hay campeonatos con posiciones disponibles para mostrar.</p>
            <button
              onClick={cargarCampeonatos}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        ) : (
          // Campeonato no seleccionado
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-blue-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Selecciona un campeonato</h3>
            <p className="text-gray-500">Elige un campeonato de la lista superior para ver sus posiciones.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Tabla de posiciones pública • Actualizada automáticamente después de cada partido</p>
          <p className="mt-1">© {new Date().getFullYear()} Sistema de Gestión Deportiva</p>
        </div>
      </div>

      {/* Botón flotante de refrescar */}
      <button
        onClick={cargarCampeonatos}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-30"
        title="Actualizar posiciones"
      >
        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}