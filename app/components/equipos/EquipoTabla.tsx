"use client";

import { useState, useEffect, useMemo } from "react";
import { Equipo } from "@/types/equipo";
import { EquiposService } from "@/services/equipos.service";

interface EquipoTableProps {
  equipos?: Equipo[];
  recargar: () => void;
  onEditar?: (equipo: Equipo) => void;
  categorias: Array<{ id_categoria: string; nombre: string }>;
  canchas: Array<{ id_cancha: string; nombre: string }>;
}

export default function EquipoTable({ 
  equipos = [], 
  recargar, 
  onEditar,
  categorias = [],
  canchas = [] // Mismo valor por defecto que categorias
}: EquipoTableProps) {
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(5);

  // Filtrar equipos no eliminados
  const equiposActivos = useMemo(() => 
    equipos.filter(equipo => !equipo.eliminado), 
    [equipos]
  );

  // Obtener nombre de categoría por ID - MISMA IMPLEMENTACIÓN
  const getNombreCategoria = (id: string) => {
    if (!id) return "Sin categoría";
    const categoria = categorias.find(c => c.id_categoria === id);
    return categoria ? categoria.nombre : "Sin categoría";
  };

  // Obtener nombre de cancha por ID - MISMA IMPLEMENTACIÓN
  const getNombreCancha = (id: string) => {
    if (!id) return "Sin cancha asignada";
    const cancha = canchas.find(c => c.id_cancha === id);
    return cancha ? cancha.nombre : "Sin cancha asignada";
  };

  // Aplicar filtros de búsqueda
  const equiposFiltrados = useMemo(() => {
    return equiposActivos.filter(equipo => {
      // Filtrar por búsqueda
      const coincideBusqueda = 
        busqueda === "" ||
        equipo.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        equipo.nombre_representante?.toLowerCase().includes(busqueda.toLowerCase()) ||
        equipo.celular_representante?.toLowerCase().includes(busqueda.toLowerCase()) ||
        getNombreCategoria(equipo.categoria_id).toLowerCase().includes(busqueda.toLowerCase()) ||
        getNombreCancha(equipo.cancha_id || "").toLowerCase().includes(busqueda.toLowerCase());
      
      // Filtrar por estado
      const coincideEstado = 
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && equipo.estado) ||
        (filtroEstado === "inactivos" && !equipo.estado);
      
      // Filtrar por categoría
      const coincideCategoria = 
        filtroCategoria === "todos" ||
        equipo.categoria_id === filtroCategoria;
      
      return coincideBusqueda && coincideEstado && coincideCategoria;
    });
  }, [equiposActivos, busqueda, filtroEstado, filtroCategoria, categorias, canchas]);

  // Calcular paginación
  const totalPaginas = Math.max(1, Math.ceil(equiposFiltrados.length / itemsPorPagina));
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = Math.min(inicio + itemsPorPagina, equiposFiltrados.length);
  const equiposPagina = equiposFiltrados.slice(inicio, fin);

  // Resetear a página 1 cuando cambian los filtros o items por página
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, filtroCategoria, itemsPorPagina]);

  const toggleEstado = async (equipo: Equipo) => {
    if (!equipo.id_equipo) return;

    const confirmMessage = equipo.estado
      ? `¿Deshabilitar al equipo "${equipo.nombre}"?`
      : `¿Habilitar al equipo "${equipo.nombre}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (equipo.estado) {
        await EquiposService.deshabilitar(equipo.id_equipo);
      } else {
        await EquiposService.habilitar(equipo.id_equipo);
      }
      recargar();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado del equipo");
    }
  };

  const handleEliminar = async (equipo: Equipo) => {
    if (!equipo.id_equipo) return;

    if (!window.confirm(`¿Estás seguro de eliminar al equipo "${equipo.nombre}"?`)) {
      return;
    }

    setEliminando(equipo.id_equipo);

    try {
      await EquiposService.eliminar(equipo.id_equipo);
      recargar();
    } catch (error) {
      console.error("Error al eliminar equipo:", error);
      alert("Error al eliminar el equipo. Por favor, inténtalo de nuevo.");
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
    setItemsPorPagina(cantidad);
  };

  // Mostrar mensaje si todos los equipos están eliminados
  if (equipos.length > 0 && equiposActivos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Todos los equipos están eliminados
        </h3>
        <p className="text-gray-600">
          No hay equipos activos disponibles en este momento.
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
                placeholder="Buscar equipos..."
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
            {/* Filtro por categoría */}
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="todos">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
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
            Mostrando {equiposPagina.length} equipos (página {paginaActual} de {totalPaginas})
          </span>
          <span className="text-blue-600">
            Total filtrados: {equiposFiltrados.length} | Total activos: {equiposActivos.length}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#004C97]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Equipo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Descripción
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Representante
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Cancha
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Celular
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
            {equiposPagina.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {busqueda || filtroEstado !== "todos" || filtroCategoria !== "todos"
                    ? "No se encontraron equipos con los filtros aplicados" 
                    : "No hay equipos disponibles"}
                </td>
              </tr>
            ) : (
              equiposPagina.map((e) => (
                <tr 
                  key={e.id_equipo} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {e.logo_url ? (
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            src={e.logo_url} 
                            alt={e.nombre}
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {e.nombre?.[0] || "E"}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {e.nombre || "-"}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {getNombreCategoria(e.categoria_id)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                    {e.descripcion || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {e.nombre_representante || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {getNombreCancha(e.cancha_id || "")} {/* ¡IMPORTANTE: cancha_id puede ser undefined! */}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {e.celular_representante || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      e.estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {e.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => toggleEstado(e)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        e.estado
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      {e.estado ? "Deshabilitar" : "Habilitar"}
                    </button>
                    {onEditar && (
                      <button
                        onClick={() => onEditar(e)}
                        className="px-3 py-1 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(e)}
                      disabled={eliminando === e.id_equipo}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        eliminando === e.id_equipo
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      {eliminando === e.id_equipo ? (
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
              <span className="font-medium">{equiposFiltrados.length}</span>{" "}
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
      {equiposActivos.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                equiposActivos.filter(e => e.estado).length > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {equiposActivos.filter(e => e.estado).length} activos
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                equiposActivos.filter(e => !e.estado).length > 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {equiposActivos.filter(e => !e.estado).length} inactivos
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {categorias.length} categorías
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                {canchas.length} canchas
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