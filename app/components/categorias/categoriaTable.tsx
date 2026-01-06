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
  Calendar,
  ChevronDown
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
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [mostrarDescripcion, setMostrarDescripcion] = useState<string | null>(null);
  
  // Modal de confirmación
  const [modal, setModal] = useState<{
    tipo: "eliminar" | "estado" | null;
    categoria: Categoria | null;
  }>({ tipo: null, categoria: null });

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

  /** Abrir modal */
  const abrirModal = (tipo: "eliminar" | "estado", categoria: Categoria) => 
    setModal({ tipo, categoria });

  /** Cerrar modal */
  const cerrarModal = () => setModal({ tipo: null, categoria: null });

  /** Confirmar acción */
  const confirmarModal = async () => {
    if (!modal.categoria) return;
    
    try {
      if (modal.tipo === "eliminar") {
        setEliminando(modal.categoria.id_categoria);
        await CategoriasService.eliminar(modal.categoria.id_categoria);
      } else if (modal.tipo === "estado") {
        if (modal.categoria.estado) {
          await CategoriasService.deshabilitar(modal.categoria.id_categoria);
        } else {
          await CategoriasService.habilitar(modal.categoria.id_categoria);
        }
      }
      recargar();
    } catch (error) {
      alert("Error al realizar la acción");
    } finally {
      setEliminando(null);
      cerrarModal();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
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
            {/* Búsqueda */}
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
            
            {/* Filtro de estado - CORREGIDO */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Filter className="h-4 w-4 text-gray-500" />
              </div>
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                value={filtroEstado}
                onChange={e => {
                  setFiltroEstado(e.target.value);
                  setPaginaActual(1);
                }}
              >
                <option value="todos">Todas</option>
                <option value="activas">Solo activas</option>
                <option value="inactivas">Solo inactivas</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Items por página */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Mostrar:</span>
            <select
              value={itemsPorPagina}
              onChange={e => {
                setItemsPorPagina(Number(e.target.value));
                setPaginaActual(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-600">por página</span>
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
                        onClick={() => abrirModal("estado", categoria)}
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
                        onClick={() => abrirModal("eliminar", categoria)}
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

      {/* Modal de confirmación - CORREGIDO */}
      {modal.tipo && modal.categoria && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className={`p-3 rounded-lg ${modal.tipo === "eliminar" ? 'bg-red-100' : 'bg-blue-100'} mr-3`}>
                  {modal.tipo === "eliminar" ? (
                    <Trash2 className="h-6 w-6 text-red-600" />
                  ) : (
                    modal.categoria.estado ? (
                      <X className="h-6 w-6 text-red-600" />
                    ) : (
                      <Check className="h-6 w-6 text-green-600" />
                    )
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {modal.tipo === "eliminar" ? "Eliminar categoría" : "Cambiar estado"}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Confirmar acción para: <span className="font-semibold">{modal.categoria.nombre}</span>
                  </p>
                </div>
              </div>

              <p className="mb-6 text-gray-700">
                {modal.tipo === "eliminar"
                  ? `¿Está seguro de eliminar permanentemente la categoría "${modal.categoria.nombre}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`
                  : `¿Desea ${modal.categoria.estado ? "deshabilitar" : "habilitar"} la categoría "${modal.categoria.nombre}"? ${
                      modal.categoria.estado 
                        ? "Los usuarios no podrán acceder temporalmente."
                        : "Los usuarios podrán acceder nuevamente."
                    }`}
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={eliminando === modal.categoria.id_categoria}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarModal}
                  disabled={eliminando === modal.categoria.id_categoria}
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${
                    modal.tipo === "eliminar"
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                      : modal.categoria.estado
                      ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'
                      : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  }`}
                >
                  {eliminando === modal.categoria.id_categoria ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </div>
                  ) : modal.tipo === "eliminar" ? (
                    "Eliminar permanentemente"
                  ) : modal.categoria.estado ? (
                    "Deshabilitar"
                  ) : (
                    "Habilitar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}