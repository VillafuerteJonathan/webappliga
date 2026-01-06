"use client";
// components/campeonatos/CampeonatoTable.tsx
"use client";

import { useState, useEffect } from "react";
import { CampeonatosService } from "@/services/campeonatos.service";
import { Campeonato } from "@/types/campeonato";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye, 
  Edit, 
  Trash2,
  Trophy,
  Calendar,
  Users,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import CampeonatoModal from "./CampeonatoModal";
import CampeonatoForm from "./CampeonatoForm";

export default function CampeonatoTable() {
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [searchLocal, setSearchLocal] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Estados para los modales
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [selectedCampeonato, setSelectedCampeonato] = useState<Campeonato | null>(null);

  const elementosPorPagina = 10;

  const cargarCampeonatos = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await CampeonatosService.obtenerTodos();
      
      // Filtrar por estado
      let campeonatosFiltrados = data;
      if (filtroEstado !== "todos") {
        campeonatosFiltrados = data.filter(c => 
          filtroEstado === "activos" ? c.estado : !c.estado
        );
      }
      
      // Filtrar por búsqueda
      if (searchLocal) {
        campeonatosFiltrados = campeonatosFiltrados.filter(c => 
          c.nombre.toLowerCase().includes(searchLocal.toLowerCase())
        );
      }
      
      // Paginación
      const inicio = (paginaActual - 1) * elementosPorPagina;
      const fin = inicio + elementosPorPagina;
      const campeonatosPagina = campeonatosFiltrados.slice(inicio, fin);
      
      setCampeonatos(campeonatosPagina);
      setTotalPaginas(Math.ceil(campeonatosFiltrados.length / elementosPorPagina));
      
    } catch (err) {
      console.error("Error al cargar campeonatos:", err);
      setError("Error al cargar los campeonatos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCampeonatos();
  }, [paginaActual, filtroEstado]);

  useEffect(() => {
    // Debounce para búsqueda
    const timer = setTimeout(() => {
      if (paginaActual !== 1) {
        setPaginaActual(1);
      } else {
        cargarCampeonatos();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchLocal]);

  const calcularEstado = (fechaInicio?: string, fechaFin?: string): string => {
    if (!fechaInicio || !fechaFin) return "programado";
    
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (hoy < inicio) return "pendiente";
    if (hoy > fin) return "finalizado";
    return "en_curso";
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "No definida";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleVerDetalles = (campeonato: Campeonato) => {
    setSelectedCampeonato(campeonato);
    setModalDetallesOpen(true);
  };

  const handleEdit = (campeonato: Campeonato) => {
    setSelectedCampeonato(campeonato);
    setModalDetallesOpen(false); // Cerrar modal de detalles si está abierto
    setModalFormOpen(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el campeonato "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    setDeletingId(id);
    try {
      await CampeonatosService.eliminar(id);
      if (selectedCampeonato?.id_campeonato === id) {
        setModalDetallesOpen(false);
        setModalFormOpen(false);
        setSelectedCampeonato(null);
      }
      cargarCampeonatos();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar el campeonato");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModalDetalles = () => {
    setModalDetallesOpen(false);
    setSelectedCampeonato(null);
  };

  const handleCloseModalForm = () => {
    setModalFormOpen(false);
    setSelectedCampeonato(null);
  };

  const handleSuccess = () => {
    cargarCampeonatos();
    setModalFormOpen(false);
    setModalDetallesOpen(false);
    setSelectedCampeonato(null);
  };

  const getEstadoBadge = (estadoCalculado: string) => {
    const estilos = {
      pendiente: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      en_curso: "bg-green-100 text-green-800 border border-green-200",
      finalizado: "bg-gray-100 text-gray-800 border border-gray-200",
      programado: "bg-blue-100 text-blue-800 border border-blue-200"
    };
    
    const textos = {
      pendiente: "Pendiente",
      en_curso: "En curso",
      finalizado: "Finalizado",
      programado: "Programado"
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${estilos[estadoCalculado as keyof typeof estilos] || "bg-gray-100 text-gray-800"}`}>
        {textos[estadoCalculado as keyof typeof textos] || estadoCalculado}
      </span>
    );
  };

  const getEstadoSistemaBadge = (estado: boolean) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {estado ? 'Activo' : 'Inactivo'}
    </span>
  );

  if (loading && campeonatos.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <span className="text-gray-600 font-medium">Cargando campeonatos...</span>
        <p className="text-gray-500 text-sm mt-1">Por favor espere un momento</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Error al cargar los campeonatos</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button 
              onClick={cargarCampeonatos}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header de la tabla con filtros */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar campeonatos por nombre..."
                  value={searchLocal}
                  onChange={(e) => setSearchLocal(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Solo activos</option>
                  <option value="inactivos">Solo inactivos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Participantes
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campeonatos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-700">No hay campeonatos registrados</p>
                      <p className="text-sm text-gray-500 mt-1 max-w-md">
                        {searchLocal.trim() 
                          ? `No se encontraron campeonatos con "${searchLocal}"`
                          : "Comienza creando tu primer campeonato"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                campeonatos.map((campeonato) => {
                  const estadoCalculado = calcularEstado(campeonato.fecha_inicio, campeonato.fecha_fin);
                  const totalEquipos = campeonato.grupos?.reduce(
                    (total, grupo) => total + (grupo.equipos?.length || 0), 0
                  ) || 0;
                  
                  return (
                    <tr 
                      key={campeonato.id_campeonato} 
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div 
                              className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate max-w-xs"
                              onClick={() => handleVerDetalles(campeonato)}
                            >
                              {campeonato.nombre}
                            </div>
                            {campeonato.descripcion && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                {campeonato.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Inicio</div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatearFecha(campeonato.fecha_inicio)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Fin</div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatearFecha(campeonato.fecha_fin)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Grupos</div>
                              <div className="text-sm font-medium text-gray-900">
                                {campeonato.grupos?.length || 0}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Equipos total</div>
                            <div className="text-sm font-medium text-gray-900">
                              {totalEquipos}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {getEstadoBadge(estadoCalculado)}
                          <div className="text-xs">
                            {getEstadoSistemaBadge(campeonato.estado)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleVerDetalles(campeonato)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEdit(campeonato)}
                            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(campeonato.id_campeonato, campeonato.nombre)}
                            disabled={deletingId === campeonato.id_campeonato}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar"
                          >
                            {deletingId === campeonato.id_campeonato ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Mostrando {campeonatos.length} de {Math.min(paginaActual * elementosPorPagina, campeonatos.length + (paginaActual - 1) * elementosPorPagina)} resultados
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let pagina;
                    if (totalPaginas <= 5) {
                      pagina = i + 1;
                    } else if (paginaActual <= 3) {
                      pagina = i + 1;
                    } else if (paginaActual >= totalPaginas - 2) {
                      pagina = totalPaginas - 4 + i;
                    } else {
                      pagina = paginaActual - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pagina}
                        onClick={() => setPaginaActual(pagina)}
                        className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg transition-colors ${
                          pagina === paginaActual
                            ? "bg-blue-600 text-white font-medium"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pagina}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      <CampeonatoModal
        campeonato={selectedCampeonato}
        isOpen={modalDetallesOpen}
        onClose={handleCloseModalDetalles}
        onEdit={() => selectedCampeonato && handleEdit(selectedCampeonato)}
        onDelete={handleDelete}
      />

      {/* Modal del formulario (para crear o editar) */}
      {modalFormOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 transition-all"
            onClick={handleCloseModalForm}
          />
          
          {/* Modal del formulario */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div 
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del modal */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Trophy className="h-7 w-7 text-blue-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCampeonato ? 'Editar Campeonato' : 'Nuevo Campeonato'}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedCampeonato 
                          ? `Modificando: ${selectedCampeonato.nombre}`
                          : 'Complete el formulario para crear un nuevo campeonato'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCloseModalForm}
                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Cerrar"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Contenido del formulario */}
                <div className="overflow-y-auto max-h-[calc(100vh-180px)]">

                  <CampeonatoForm 
                    campeonato={selectedCampeonato || undefined}
                    onSuccess={handleSuccess}
                    onCancel={handleCloseModalForm}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}