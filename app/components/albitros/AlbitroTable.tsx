"use client";

import { useState, useEffect, useMemo } from "react";
import { Arbitro } from "@/types/arbitro";
import { ArbitrosService } from "@/services/arbitros.service";

interface ArbitroTableProps {
  arbitros?: Arbitro[];
  recargar: () => void;
  onEditar?: (arbitro: Arbitro) => void;
}

export default function ArbitroTable({ 
  arbitros = [], 
  recargar, 
  onEditar 
}: ArbitroTableProps) {
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(10);

  // Filtrar árbitros no eliminados
  const arbitrosActivos = useMemo(() => 
    arbitros.filter(arbitro => !arbitro.eliminado), 
    [arbitros]
  );

  // Aplicar filtros de búsqueda
  const arbitrosFiltrados = useMemo(() => {
    return arbitrosActivos.filter(arbitro => {
      // Filtrar por búsqueda
      const coincideBusqueda = 
        busqueda === "" ||
        arbitro.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
        arbitro.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
        arbitro.cedula?.toLowerCase().includes(busqueda.toLowerCase()) ||
        arbitro.correo?.toLowerCase().includes(busqueda.toLowerCase());
      
      // Filtrar por estado
      const coincideEstado = 
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && arbitro.estado) ||
        (filtroEstado === "inactivos" && !arbitro.estado);
      
      return coincideBusqueda && coincideEstado;
    });
  }, [arbitrosActivos, busqueda, filtroEstado]);

  // Calcular paginación
  const totalPaginas = Math.max(1, Math.ceil(arbitrosFiltrados.length / itemsPorPagina));
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = Math.min(inicio + itemsPorPagina, arbitrosFiltrados.length);
  const arbitrosPagina = arbitrosFiltrados.slice(inicio, fin);

  console.log("DEBUG Paginación Árbitros:", {
    total: arbitrosFiltrados.length,
    itemsPorPagina,
    paginaActual,
    inicio,
    fin,
    totalPaginas,
    mostrar: arbitrosPagina.length
  });

  // Resetear a página 1 cuando cambian los filtros o items por página
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, itemsPorPagina]);

  const toggleEstado = async (arbitro: Arbitro) => {
    if (!arbitro.id_arbitro) return;

    const confirmMessage = arbitro.estado
      ? `¿Deshabilitar al árbitro ${arbitro.nombres} ${arbitro.apellidos}?`
      : `¿Habilitar al árbitro ${arbitro.nombres} ${arbitro.apellidos}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (arbitro.estado) {
        await ArbitrosService.deshabilitar(arbitro.id_arbitro);
      } else {
        await ArbitrosService.habilitar(arbitro.id_arbitro);
      }
      recargar();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado del árbitro");
    }
  };

  const handleEliminar = async (arbitro: Arbitro) => {
    if (!arbitro.id_arbitro) return;

    if (!window.confirm(`¿Estás seguro de eliminar al árbitro "${arbitro.nombres} ${arbitro.apellidos}"?`)) {
      return;
    }

    setEliminando(arbitro.id_arbitro);

    try {
      await ArbitrosService.eliminar(arbitro.id_arbitro);
      recargar();
    } catch (error) {
      console.error("Error al eliminar árbitro:", error);
      alert("Error al eliminar el árbitro. Por favor, inténtalo de nuevo.");
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

  // Mostrar mensaje si todos los árbitros están eliminados
  if (arbitros.length > 0 && arbitrosActivos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Todos los árbitros están eliminados
        </h3>
        <p className="text-gray-600">
          No hay árbitros activos disponibles en este momento.
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
                placeholder="Buscar árbitros..."
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
            Mostrando {arbitrosPagina.length} árbitros (página {paginaActual} de {totalPaginas})
          </span>
          <span className="text-blue-600">
            Total filtrados: {arbitrosFiltrados.length} | Total activos: {arbitrosActivos.length}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#004C97]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Árbitro
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Cédula
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Teléfono
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Correo
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
            {arbitrosPagina.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {busqueda || filtroEstado !== "todos" 
                    ? "No se encontraron árbitros con los filtros aplicados" 
                    : "No hay árbitros disponibles"}
                </td>
              </tr>
            ) : (
              arbitrosPagina.map((a) => (
                <tr 
                  key={a.id_arbitro} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {a.nombres?.[0]}{a.apellidos?.[0]}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {a.nombres || "-"} {a.apellidos || "-"}
                        </div>
                        {a.direccion && (
                          <div className="text-xs text-gray-500">{a.direccion}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {a.cedula || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {a.telefono || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {a.correo || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      a.estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {a.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => toggleEstado(a)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        a.estado
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      {a.estado ? "Deshabilitar" : "Habilitar"}
                    </button>
                    {onEditar && (
                      <button
                        onClick={() => onEditar(a)}
                        className="px-3 py-1 rounded text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(a)}
                      disabled={eliminando === a.id_arbitro}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        eliminando === a.id_arbitro
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      {eliminando === a.id_arbitro ? (
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
              <span className="font-medium">{arbitrosFiltrados.length}</span>{" "}
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
      {arbitrosActivos.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                arbitrosActivos.filter(a => a.estado).length > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {arbitrosActivos.filter(a => a.estado).length} activos
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                arbitrosActivos.filter(a => !a.estado).length > 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {arbitrosActivos.filter(a => !a.estado).length} inactivos
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