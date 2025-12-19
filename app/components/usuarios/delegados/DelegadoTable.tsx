"use client";

import { useState, useEffect, useMemo } from "react";
import { Delegado } from "@/types/delegado";
import { DelegadosService } from "@/services/delegados.service";

interface DelegadoTableProps {
  delegados?: Delegado[];
  recargar: () => void;
  onEditar?: (delegado: Delegado) => void;
}

export default function DelegadoTable({ 
  delegados = [], 
  recargar, 
  onEditar 
}: DelegadoTableProps) {
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(5);

  // Filtrar delegados no eliminados
  const delegadosActivos = useMemo(() => 
    delegados.filter(delegado => !delegado.eliminado), 
    [delegados]
  );

  // Aplicar filtros de búsqueda
  const delegadosFiltrados = useMemo(() => {
    return delegadosActivos.filter(delegado => {
      // Filtrar por búsqueda
      const coincideBusqueda = 
        busqueda === "" ||
        delegado.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        delegado.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
        delegado.cedula?.toLowerCase().includes(busqueda.toLowerCase()) ||
        delegado.correo?.toLowerCase().includes(busqueda.toLowerCase());
      
      // Filtrar por estado
      const coincideEstado = 
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && delegado.estado) ||
        (filtroEstado === "inactivos" && !delegado.estado);
      
      return coincideBusqueda && coincideEstado;
    });
  }, [delegadosActivos, busqueda, filtroEstado]);

  // Calcular paginación
  const totalPaginas = Math.max(1, Math.ceil(delegadosFiltrados.length / itemsPorPagina));
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = Math.min(inicio + itemsPorPagina, delegadosFiltrados.length);
  const delegadosPagina = delegadosFiltrados.slice(inicio, fin);

  // Resetear a página 1 cuando cambian los filtros o items por página
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, itemsPorPagina]);

  const toggleEstado = async (delegado: Delegado) => {
    if (!delegado.id_usuario) return;

    const confirmMessage = delegado.estado
      ? `¿Deshabilitar al delegado ${delegado.nombre} ${delegado.apellido}?`
      : `¿Habilitar al delegado ${delegado.nombre} ${delegado.apellido}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (delegado.estado) {
        await DelegadosService.deshabilitar(delegado.id_usuario);
      } else {
        await DelegadosService.habilitar(delegado.id_usuario);
      }
      recargar();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado del delegado");
    }
  };

  const handleEliminar = async (delegado: Delegado) => {
    if (!delegado.id_usuario) return;

    if (!window.confirm(`¿Estás seguro de eliminar al delegado "${delegado.nombre} ${delegado.apellido}"?`)) {
      return;
    }

    setEliminando(delegado.id_usuario);

    try {
      await DelegadosService.eliminarDelegado(delegado.id_usuario);
      recargar();
    } catch (error) {
      console.error("Error al eliminar delegado:", error);
      alert("Error al eliminar el delegado. Por favor, inténtalo de nuevo.");
    } finally {
      setEliminando(null);
    }
  };

  const cambiarPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;
    setPaginaActual(pagina);
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  // Mostrar mensaje si todos los delegados están eliminados
  if (delegados.length > 0 && delegadosActivos.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0h.01" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          Todos los delegados están eliminados
        </h3>
        <p className="text-xs text-gray-600">
          No hay delegados activos disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Barra de herramientas */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Búsqueda */}
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar delegados..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full md:w-56 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filtros y controles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>

            {/* Items por página */}
            <select
              value={itemsPorPagina}
              onChange={(e) => setItemsPorPagina(Number(e.target.value))}
              className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="5">5/pág</option>
              <option value="10">10/pág</option>
              <option value="20">20/pág</option>
            </select>

            {/* Botón recargar */}
            <button
              onClick={recargar}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Información de paginación */}
      <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-blue-700">
            Página {paginaActual} de {totalPaginas}
          </span>
          <span className="text-blue-600">
            {delegadosFiltrados.length} delegados
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delegado
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cédula
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {delegadosPagina.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">
                  {busqueda || filtroEstado !== "todos" 
                    ? "No se encontraron delegados" 
                    : "No hay delegados registrados"}
                </td>
              </tr>
            ) : (
              delegadosPagina.map((d) => (
                <tr 
                  key={d.id_usuario} 
                  className="hover:bg-gray-50"
                >
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xs">
                          {d.nombre?.[0]}{d.apellido?.[0]}
                        </span>
                      </div>
                      <div className="ml-2.5">
                        <div className="text-sm font-medium text-gray-900">
                          {d.nombre || "-"} {d.apellido || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatearFecha(d.fecha_registro)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700">
                    {d.cedula || "-"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700">
                    {d.correo || "-"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-700">
                    {d.telefono || "-"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      d.estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {d.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm space-x-1.5">
                    <button
                      onClick={() => toggleEstado(d)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        d.estado
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {d.estado ? "Deshabilitar" : "Habilitar"}
                    </button>
                    {onEditar && (
                      <button
                        onClick={() => onEditar(d)}
                        className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(d)}
                      disabled={eliminando === d.id_usuario}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        eliminando === d.id_usuario
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {eliminando === d.id_usuario ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Eliminando
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
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Información */}
            <div className="text-xs text-gray-600">
              Mostrando {inicio + 1}-{fin} de {delegadosFiltrados.length}
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center space-x-1">
              {/* Botón anterior */}
              <button
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                className={`px-2 py-1 border rounded text-xs flex items-center ${
                  paginaActual === 1
                    ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>

              {/* Números de página */}
              <div className="flex items-center space-x-0.5">
                {[...Array(Math.min(3, totalPaginas))].map((_, i) => {
                  const pagina = Math.max(1, Math.min(paginaActual - 1, totalPaginas - 3)) + i;
                  if (pagina > totalPaginas) return null;
                  
                  return (
                    <button
                      key={pagina}
                      onClick={() => setPaginaActual(pagina)}
                      className={`px-2 py-1 min-w-[28px] border rounded text-xs ${
                        paginaActual === pagina
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pagina}
                    </button>
                  );
                })}
                
                {totalPaginas > 3 && paginaActual < totalPaginas - 1 && (
                  <>
                    <span className="px-1 text-gray-500">...</span>
                    <button
                      onClick={() => setPaginaActual(totalPaginas)}
                      className="px-2 py-1 min-w-[28px] border border-gray-300 rounded text-xs bg-white text-gray-700 hover:bg-gray-50"
                    >
                      {totalPaginas}
                    </button>
                  </>
                )}
              </div>

              {/* Botón siguiente */}
              <button
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className={`px-2 py-1 border rounded text-xs flex items-center ${
                  paginaActual === totalPaginas
                    ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                Siguiente
                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {delegadosActivos.length > 0 && (
        <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                {delegadosActivos.filter(d => d.estado).length} activos
              </span>
              <span className="inline-flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                {delegadosActivos.filter(d => !d.estado).length} inactivos
              </span>
              <span className="inline-flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
                Todos delegados
              </span>
            </div>
            <div className="text-gray-500">
              {itemsPorPagina}/pág • {paginaActual}/{totalPaginas}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}