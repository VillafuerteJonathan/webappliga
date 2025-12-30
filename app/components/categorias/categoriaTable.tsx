"use client";

import { useState, useEffect, useMemo } from "react";
import { Categoria } from "@/types/categoria";
import { CategoriasService } from "@/services/categorias.service";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Calendar
} from "lucide-react";

interface CategoriaTableProps {
  categorias?: Categoria[];
  recargar: () => void;
  onEditar?: (categoria: Categoria) => void;
}

export default function CategoriaTable({
  categorias = [],
  recargar,
  onEditar
}: CategoriaTableProps) {
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [mostrarDescripcion, setMostrarDescripcion] = useState<string | null>(null);

  /** Formatear fecha de forma segura */
  const formatFecha = (fechaString: string | undefined | Date): string => {
    if (!fechaString) return "No disponible";
    
    try {
      const fecha = typeof fechaString === 'string' ? new Date(fechaString) : fechaString;
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        return "Fecha inválida";
      }
      
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en fecha";
    }
  };

  /** Categorías no eliminadas */
  const categoriasActivas = useMemo(
    () => categorias.filter(c => !c.eliminado),
    [categorias]
  );

  /** Filtros */
  const categoriasFiltradas = useMemo(() => {
    return categoriasActivas.filter(c => {
      const coincideBusqueda =
        busqueda === "" ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activas" && c.estado) ||
        (filtroEstado === "inactivas" && !c.estado);

      return coincideBusqueda && coincideEstado;
    });
  }, [categoriasActivas, busqueda, filtroEstado]);

  /** Paginación */
  const totalPaginas = Math.max(
    1,
    Math.ceil(categoriasFiltradas.length / itemsPorPagina)
  );
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = Math.min(inicio + itemsPorPagina, categoriasFiltradas.length);
  const categoriasPagina = categoriasFiltradas.slice(inicio, fin);

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(1);
    }
  }, [busqueda, filtroEstado, itemsPorPagina, totalPaginas, paginaActual]);

  /** Acciones */
  const toggleEstado = async (categoria: Categoria) => {
    const confirmacion = window.confirm(
      `¿${categoria.estado ? "Deshabilitar" : "Habilitar"} la categoría "${categoria.nombre}"?`
    );
    
    if (!confirmacion) return;

    try {
      if (categoria.estado) {
        await CategoriasService.deshabilitar(categoria.id_categoria);
      } else {
        await CategoriasService.habilitar(categoria.id_categoria);
      }
      recargar();
    } catch (e) {
      console.error("Error al cambiar estado:", e);
      alert("Error al cambiar el estado de la categoría");
    }
  };

  const handleEliminar = async (categoria: Categoria) => {
    if (!confirm(`¿Está seguro de eliminar la categoría "${categoria.nombre}"?\nEsta acción no se puede deshacer.`)) return;

    setEliminando(categoria.id_categoria);
    try {
      await CategoriasService.eliminar(categoria.id_categoria);
      recargar();
    } catch (error) {
      alert("Error al eliminar la categoría");
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header con filtros */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
            <p className="text-gray-600 mt-1">
              Total: <span className="font-semibold">{categoriasActivas.length}</span> categorías
              {categoriasFiltradas.length !== categoriasActivas.length && (
                <span className="ml-2 text-sm text-blue-600">
                  (Filtradas: {categoriasFiltradas.length})
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Buscar categorías..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroEstado("todos")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtroEstado === "todos" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroEstado("activas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtroEstado === "activas" 
                  ? "bg-green-600 text-white shadow-sm" 
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow"
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Activas
              </div>
            </button>
            <button
              onClick={() => setFiltroEstado("inactivas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtroEstado === "inactivas" 
                  ? "bg-red-600 text-white shadow-sm" 
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow"
              }`}
            >
              <div className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Inactivas
              </div>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <select
              value={itemsPorPagina}
              onChange={e => setItemsPorPagina(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">por página</span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Rango de Edad
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Fecha Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categoriasPagina.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <AlertCircle className="h-12 w-12 mb-3" />
                    <p className="text-lg font-medium text-gray-500">No se encontraron categorías</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {busqueda ? "Intenta con otros términos de búsqueda" : "No hay categorías registradas"}
                    </p>
                    {busqueda && (
                      <button
                        onClick={() => setBusqueda("")}
                        className="mt-4 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              categoriasPagina.map((categoria) => (
                <tr 
                  key={categoria.id_categoria} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${categoria.estado ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{categoria.nombre}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {categoria.id_categoria.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      <span className="text-sm font-medium">
                        {categoria.edad_minima ?? "?"} - {categoria.edad_maxima ?? "?"} años
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      categoria.estado 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {categoria.estado ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Activa
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Inactiva
                        </>
                      )}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <button
                        onClick={() => setMostrarDescripcion(
                          mostrarDescripcion === categoria.id_categoria ? null : categoria.id_categoria
                        )}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 group"
                      >
                        {mostrarDescripcion === categoria.id_categoria ? (
                          <>
                            <EyeOff className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                            <span>
                              {categoria.descripcion && categoria.descripcion.length > 30 
                                ? "Ver descripción" 
                                : categoria.descripcion || "Sin descripción"
                              }
                            </span>
                          </>
                        )}
                      </button>
                      {mostrarDescripcion === categoria.id_categoria && categoria.descripcion && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {categoria.descripcion}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatFecha(categoria.fecha_registro)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleEstado(categoria)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
                          categoria.estado
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:shadow-sm'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 hover:shadow-sm'
                        }`}
                        disabled={eliminando === categoria.id_categoria}
                      >
                        {categoria.estado ? (
                          <>
                            <X className="h-4 w-4" />
                            Deshabilitar
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Habilitar
                          </>
                        )}
                      </button>

                      {onEditar && (
                        <button
                          onClick={() => onEditar(categoria)}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-2 hover:shadow-sm"
                          disabled={eliminando === categoria.id_categoria}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </button>
                      )}

                      <button
                        onClick={() => handleEliminar(categoria)}
                        disabled={eliminando === categoria.id_categoria}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition flex items-center gap-2 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {eliminando === categoria.id_categoria ? (
                          <>
                            <div className="h-4 w-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-semibold">{inicio + 1}</span> a{" "}
            <span className="font-semibold">{fin}</span> de{" "}
            <span className="font-semibold">{categoriasFiltradas.length}</span> resultados
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let pageNum;
                if (totalPaginas <= 5) {
                  pageNum = i + 1;
                } else if (paginaActual <= 3) {
                  pageNum = i + 1;
                } else if (paginaActual >= totalPaginas - 2) {
                  pageNum = totalPaginas - 4 + i;
                } else {
                  pageNum = paginaActual - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPaginaActual(pageNum)}
                    className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                      paginaActual === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:shadow"
                    }`}
                    aria-label={`Ir a página ${pageNum}`}
                    aria-current={paginaActual === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPaginas > 5 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </div>
            
            <button
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}