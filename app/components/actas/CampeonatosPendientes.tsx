"use client";
import React, { useEffect, useState } from "react";
import {  Campeonato } from "@/types/validador";
import { ValidadorService } from "@/services/validador.service";

interface Props {
  onSelectCampeonato: (campeonato: Campeonato) => void;
}

const CampeonatosPendientes: React.FC<Props> = ({ onSelectCampeonato }) => {
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampeonatos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await ValidadorService.obtenerCampeonatosPendientes();
        console.log("🏆 Campeonatos recibidos:", data);
        
        setCampeonatos(data);
      } catch (err: any) {
        console.error("Error cargando campeonatos:", err);
        setError(err.message || "Error al cargar los campeonatos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampeonatos();
  }, []);

  const handleSelectCampeonato = (campeonato: Campeonato) => {
    console.log("🎯 Seleccionando campeonato:", campeonato);
    onSelectCampeonato(campeonato);
  };

  // Función para formatear fechas
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No definida";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Estado de carga mejorado
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800">Buscando campeonatos</h3>
          <p className="text-gray-500 mt-2">Estamos cargando la información más reciente...</p>
          <div className="mt-4 flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error mejorado
  if (error) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Error de conexión</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
              <button
                onClick={() => setError(null)}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-all duration-200 hover:shadow"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado vacío mejorado
  if (campeonatos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200 rounded-2xl p-10 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-800 mb-3">¡Todo al día!</h3>
            <p className="text-emerald-600 text-lg mb-6 max-w-md">
              No hay campeonatos con actas pendientes de verificación en este momento
            </p>
            <div className="bg-emerald-100 rounded-lg p-4 inline-block mb-6">
              <p className="text-emerald-700 font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Todas las actas han sido verificadas
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-emerald-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Todos los campeonatos están actualizados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado normal con datos
  return (
    <div className="p-4 md:p-6">
      {/* Header mejorado */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Campeonatos Pendientes
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Selecciona un campeonato para revisar las actas pendientes de validación
        </p>
        
        {/* Stats header simplificado */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-w-[160px]">
            <div className="text-3xl font-bold text-blue-600 mb-1">{campeonatos.length}</div>
            <div className="text-sm text-gray-500">Campeonatos Pendientes</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-w-[160px]">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {campeonatos.length}
            </div>
            <div className="text-sm text-gray-500">Listos para Revisión</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-w-[160px]">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {new Date().getFullYear()}
            </div>
            <div className="text-sm text-gray-500">Temporada Actual</div>
          </div>
        </div>
      </div>

      {/* Grid de campeonatos mejorado */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campeonatos.map((campeonato, index) => {
          // Ya no usamos cantidad_pendientes para cálculos
          const tienePendientes = true; // Por definición, si está aquí tiene pendientes
          
          return (
            <div
              key={campeonato.id_campeonato}
              className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
              onClick={() => handleSelectCampeonato(campeonato)}
              style={{ animationDelay: `${index * 100}ms` }}
              data-aos="fade-up"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {/* Ícono del campeonato */}
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow mb-4">
                    <span className="text-white font-bold text-lg">
                      {campeonato.nombre.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Nombre del campeonato */}
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                    {campeonato.nombre}
                  </h3>
                  
                  {/* Fechas */}
                  <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Inicio:</span>
                      <span>{formatDate(campeonato.fecha_inicio)}</span>
                    </div>
                    {campeonato.fecha_fin && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Fin:</span>
                        <span>{formatDate(campeonato.fecha_fin)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Badge de estado simplificado */}
                <div className="flex-shrink-0 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Por revisar
                </div>
              </div>
              
              {/* Barra de progreso simplificada */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span className="font-medium">Estado actual</span>
                  <span className="font-bold">Actas pendientes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Listo para revisión de actas
                </div>
              </div>
              
              {/* Footer con flecha animada */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Revisar actas pendientes
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Haz clic para validar las actas
                  </p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3-3 3M5 9l3 3-3 3" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con estadísticas simplificadas */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600">
            <p className="font-medium">📊 Resumen de campeonatos</p>
            <p className="text-sm mt-1">
              <span className="font-semibold text-blue-600">
                {campeonatos.length}
              </span> campeonatos con actas pendientes de validación
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Actas por revisar</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Revisión de actas</span>
            </div>
          </div>
        </div>
        
        {/* Nota informativa simplificada */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                Todos los campeonatos en esta lista tienen actas pendientes de validación. 
                Selecciona uno para comenzar el proceso de revisión.
              </p>
            </div>
          </div>
        </div>
        
        {/* Última actualización */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Última actualización: {new Date().toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampeonatosPendientes;