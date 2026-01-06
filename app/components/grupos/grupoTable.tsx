"use client";

import { useState, useMemo } from "react";
import { Grupo } from "@/types/grupo";
import { GruposService } from "@/services/grupos.service";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Calendar,
  Filter
} from "lucide-react";

interface GrupoTableProps {
  grupos?: Grupo[];
  recargar: () => void;
  onEditar?: (grupo: Grupo) => void;
}

export default function GrupoTable({ grupos = [], recargar, onEditar }: GrupoTableProps) {
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [itemsPorPagina, setItemsPorPagina] = useState(5);

  // Modal de confirmación
  const [modal, setModal] = useState<{
    tipo: "eliminar" | "estado" | null;
    grupo: Grupo | null;
  }>({ tipo: null, grupo: null });

  /** Formatear fecha */
  const formatFecha = (fechaString?: string | Date) => {
    if (!fechaString) return "No disponible";
    const fecha = typeof fechaString === "string" ? new Date(fechaString) : fechaString;
    return isNaN(fecha.getTime()) ? "Fecha inválida" : fecha.toLocaleDateString('es-ES');
  };

  /** Grupos no eliminados */
  const gruposActivos = useMemo(() => grupos.filter(g => !g.eliminado), [grupos]);

  /** Filtrar por búsqueda y estado */
  const gruposFiltrados = useMemo(() => {
    return gruposActivos.filter(g => {
      const coincideBusqueda = busqueda === "" || g.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activas" && g.estado) ||
        (filtroEstado === "inactivas" && !g.estado);
      return coincideBusqueda && coincideEstado;
    });
  }, [gruposActivos, busqueda, filtroEstado]);

  /** Paginación */
  const totalPaginas = Math.max(1, Math.ceil(gruposFiltrados.length / itemsPorPagina));
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = Math.min(inicio + itemsPorPagina, gruposFiltrados.length);
  const gruposPagina = gruposFiltrados.slice(inicio, fin);

  /** Abrir modal */
  const abrirModal = (tipo: "eliminar" | "estado", grupo: Grupo) => setModal({ tipo, grupo });

  /** Cerrar modal */
  const cerrarModal = () => setModal({ tipo: null, grupo: null });

  /** Confirmar acción */
  const confirmarModal = async () => {
    if (!modal.grupo) return;
    try {
      if (modal.tipo === "eliminar") {
        setEliminando(modal.grupo.id_grupo);
        await GruposService.eliminar(modal.grupo.id_grupo);
      } else if (modal.tipo === "estado") {
        if (modal.grupo.estado) {
          await GruposService.deshabilitar(modal.grupo.id_grupo);
        } else {
          await GruposService.habilitar(modal.grupo.id_grupo);
        }
      }
      recargar();
    } catch (e) {
      alert("Error al realizar la acción");
    } finally {
      setEliminando(null);
      cerrarModal();
    }
  };

  /** Generar botones de paginación (máx. 5 visibles) */
  const paginasAMostrar = () => {
    const paginas = [];
    let start = Math.max(1, paginaActual - 2);
    let end = Math.min(totalPaginas, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) paginas.push(i);
    return paginas;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      {/* Header con búsqueda y filtro */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Grupos</h2>
            <p className="text-gray-600 mt-1">
              Total: <span className="font-semibold">{gruposActivos.length}</span> grupos
              {gruposFiltrados.length !== gruposActivos.length && (
                <span className="ml-2 text-sm text-blue-600">(Filtrados: {gruposFiltrados.length})</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Búsqueda */}
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Buscar grupos..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
                <option value="todos">Todos</option>
                <option value="activas">Solo activos</option>
                <option value="inactivas">Solo inactivos</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha Registro</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {gruposPagina.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <AlertCircle className="h-12 w-12 mb-3" />
                    <p className="text-lg font-medium text-gray-500">No se encontraron grupos</p>
                  </div>
                </td>
              </tr>
            ) : (
              gruposPagina.map(grupo => (
                <tr key={grupo.id_grupo} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">{grupo.nombre}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      grupo.estado 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {grupo.estado ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                      {grupo.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatFecha(grupo.fecha_registro)}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button
                      onClick={() => abrirModal("estado", grupo)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
                        grupo.estado
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:shadow-sm'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 hover:shadow-sm'
                      }`}
                      disabled={eliminando === grupo.id_grupo}
                    >
                      {grupo.estado ? <><X className="h-4 w-4" />Deshabilitar</> : <><Check className="h-4 w-4" />Habilitar</>}
                    </button>

                    {onEditar && (
                      <button
                        onClick={() => onEditar(grupo)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-2 hover:shadow-sm"
                        disabled={eliminando === grupo.id_grupo}
                      >
                        <Edit className="h-4 w-4" />Editar
                      </button>
                    )}

                    <button
                      onClick={() => abrirModal("eliminar", grupo)}
                      disabled={eliminando === grupo.id_grupo}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 flex items-center gap-2 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {eliminando === grupo.id_grupo ? "Eliminando..." : <><Trash2 className="h-4 w-4" />Eliminar</>}
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
        <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-semibold">{inicio + 1}</span> a <span className="font-semibold">{fin}</span> de <span className="font-semibold">{gruposFiltrados.length}</span> resultados
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {paginasAMostrar().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPaginaActual(pageNum)}
                className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${paginaActual === pageNum ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100 hover:shadow"}`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación - CORREGIDO */}
      {modal.tipo && modal.grupo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className={`p-3 rounded-lg ${modal.tipo === "eliminar" ? 'bg-red-100' : 'bg-blue-100'} mr-3`}>
                  {modal.tipo === "eliminar" ? (
                    <Trash2 className="h-6 w-6 text-red-600" />
                  ) : (
                    modal.grupo.estado ? (
                      <X className="h-6 w-6 text-red-600" />
                    ) : (
                      <Check className="h-6 w-6 text-green-600" />
                    )
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {modal.tipo === "eliminar" ? "Eliminar grupo" : "Cambiar estado"}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Confirmar acción para: <span className="font-semibold">{modal.grupo.nombre}</span>
                  </p>
                </div>
              </div>

              <p className="mb-6 text-gray-700">
                {modal.tipo === "eliminar"
                  ? `¿Está seguro de eliminar permanentemente el grupo "${modal.grupo.nombre}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`
                  : `¿Desea ${modal.grupo.estado ? "deshabilitar" : "habilitar"} el grupo "${modal.grupo.nombre}"? ${
                      modal.grupo.estado 
                        ? "Los usuarios no podrán acceder temporalmente."
                        : "Los usuarios podrán acceder nuevamente."
                    }`}
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cerrarModal}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={eliminando === modal.grupo.id_grupo}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarModal}
                  disabled={eliminando === modal.grupo.id_grupo}
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${
                    modal.tipo === "eliminar"
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                      : modal.grupo.estado
                      ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400'
                      : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  }`}
                >
                  {eliminando === modal.grupo.id_grupo ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </div>
                  ) : modal.tipo === "eliminar" ? (
                    "Eliminar permanentemente"
                  ) : modal.grupo.estado ? (
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