"use client";

import { useState, useEffect, useMemo } from "react";
import { Cancha } from "@/types/cancha";
import { CanchasService } from "@/services/canchas.service";

interface CanchaTableProps {
  canchas?: Cancha[];
  recargar: () => void;
  onEditar?: (cancha: Cancha) => void;
}

export default function CanchaTable({ 
  canchas = [], 
  recargar, 
  onEditar 
}: CanchaTableProps) {
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(5); // Estado interno

  // Filtrar canchas no eliminadas
  const canchasActivas = useMemo(() => 
    canchas.filter(cancha => !cancha.eliminado), 
    [canchas]
  );

  // Aplicar filtros de búsqueda
  const canchasFiltradas = useMemo(() => {
    return canchasActivas.filter(cancha => {
      // Filtrar por búsqueda
      const coincideBusqueda = 
        busqueda === "" ||
        cancha.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cancha.tipo_deporte?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cancha.ubicacion?.toLowerCase().includes(busqueda.toLowerCase());
      
      // Filtrar por estado
      const coincideEstado = 
        filtroEstado === "todos" ||
        (filtroEstado === "activas" && cancha.estado) ||
        (filtroEstado === "inactivas" && !cancha.estado);
      
      return coincideBusqueda && coincideEstado;
    });
  }, [canchasActivas, busqueda, filtroEstado]);

  // Calcular paginación - VERIFICA ESTE CÁLCULO
  const totalPaginas = Math.max(1, Math.ceil(canchasFiltradas.length / itemsPorPagina));
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = Math.min(inicio + itemsPorPagina, canchasFiltradas.length);
  const canchasPagina = canchasFiltradas.slice(inicio, fin);

  console.log("DEBUG Paginación:", {
    total: canchasFiltradas.length,
    itemsPorPagina,
    paginaActual,
    inicio,
    fin,
    totalPaginas,
    mostrar: canchasPagina.length
  });

  // Resetear a página 1 cuando cambian los filtros o items por página
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, itemsPorPagina]);

  const toggleEstado = async (cancha: Cancha) => {
    if (!cancha.id_cancha) return;

    try {
      if (cancha.estado) {
        await CanchasService.deshabilitar(cancha.id_cancha);
      } else {
        await CanchasService.habilitar(cancha.id_cancha);
      }
      recargar();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleEliminar = async (cancha: Cancha) => {
    if (!cancha.id_cancha) return;

    if (!window.confirm(`¿Estás seguro de eliminar la cancha "${cancha.nombre}"?`)) {
      return;
    }

    setEliminando(cancha.id_cancha);

    try {
      await CanchasService.eliminar(cancha.id_cancha);
      recargar();
    } catch (error) {
      console.error("Error al eliminar cancha:", error);
      alert("Error al eliminar la cancha. Por favor, inténtalo de nuevo.");
    } finally {
      setEliminando(null);
    }
  };

  const cambiarPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cambiarItemsPorPagina = (cantidad: number) => {
    console.log("Cambiando items por página a:", cantidad);
    setItemsPorPagina(cantidad);
  };

  // Mostrar mensaje si todas las canchas están eliminadas
  if (canchas.length > 0 && canchasActivas.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Todas las canchas están eliminadas
        </h3>
        <p className="text-gray-600">
          No hay canchas activas disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Barra de herramientas */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Búsqueda */}
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar canchas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filtros y controles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="activas">Solo activas</option>
              <option value="inactivas">Solo inactivas</option>
            </select>

            {/* Items por página */}
            <div className="relative">
              <select
                value={itemsPorPagina}
                onChange={(e) => cambiarItemsPorPagina(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white pr-8"
              >
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botón recargar */}
            <button
              onClick={recargar}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Información de paginación */}
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-blue-700 font-medium">
            Mostrando {canchasPagina.length} canchas (página {paginaActual} de {totalPaginas})
          </span>
          <span className="text-blue-600">
            Total filtradas: {canchasFiltradas.length} | Total activas: {canchasActivas.length}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#004C97]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Deporte
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Ubicación
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {canchasPagina.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {busqueda || filtroEstado !== "todos" 
                    ? "No se encontraron canchas con los filtros aplicados" 
                    : "No hay canchas disponibles"}
                </td>
              </tr>
            ) : (
              canchasPagina.map((c) => (
                <tr 
                  key={c.id_cancha} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {c.nombre || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {c.tipo_deporte || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {c.ubicacion || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      c.estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {c.estado ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => toggleEstado(c)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        c.estado
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      {c.estado ? "Deshabilitar" : "Habilitar"}
                    </button>
                    {onEditar && (
                      <button
                        onClick={() => onEditar(c)}
                        className="px-3 py-1 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(c)}
                      disabled={eliminando === c.id_cancha}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        eliminando === c.id_cancha
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      {eliminando === c.id_cancha ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-1 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Eliminando...
                        </span>
                      ) : (
                        "Eliminar"
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Información */}
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{inicio + 1}</span> a{" "}
              <span className="font-medium">{fin}</span> de{" "}
              <span className="font-medium">{canchasFiltradas.length}</span>{" "}
              resultados
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center space-x-2">
              {/* Botón anterior */}
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className={`px-3 py-1.5 border rounded-md text-sm font-medium flex items-center ${
                  paginaActual === 1
                    ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>

              {/* Números de página simplificados */}
              <div className="flex items-center space-x-1">
                {paginaActual > 1 && (
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    className="px-3 py-1.5 min-w-[40px] border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {paginaActual - 1}
                  </button>
                )}
                
                <button
                  className="px-3 py-1.5 min-w-[40px] border rounded-md text-sm font-medium bg-blue-600 text-white border-blue-600"
                >
                  {paginaActual}
                </button>
                
                {paginaActual < totalPaginas && (
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    className="px-3 py-1.5 min-w-[40px] border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {paginaActual + 1}
                  </button>
                )}
                
                {totalPaginas > 3 && paginaActual < totalPaginas - 1 && (
                  <>
                    <span className="px-1 text-gray-500">...</span>
                    <button
                      onClick={() => cambiarPagina(totalPaginas)}
                      className="px-3 py-1.5 min-w-[40px] border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {totalPaginas}
                    </button>
                  </>
                )}
              </div>

              {/* Botón siguiente */}
              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className={`px-3 py-1.5 border rounded-md text-sm font-medium flex items-center ${
                  paginaActual === totalPaginas
                    ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                Siguiente
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {canchasActivas.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                canchasActivas.filter(c => c.estado).length > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {canchasActivas.filter(c => c.estado).length} activas
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                canchasActivas.filter(c => !c.estado).length > 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {canchasActivas.filter(c => !c.estado).length} inactivas
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Configuración: {itemsPorPagina} por página • Página {paginaActual}/{totalPaginas}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}