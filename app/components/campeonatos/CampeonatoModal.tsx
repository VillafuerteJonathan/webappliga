// components/campeonatos/CampeonatoModal.tsx
"use client";

import { Campeonato } from "@/types/campeonato";
import { Equipo } from "@/types/equipo";
import { 
  X, 
  Trophy, 
  Calendar, 
  Users, 
  Award,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  Hash,
  Tag
} from "lucide-react";
import { useState, useEffect } from "react";
import { CategoriasService } from "@/services/categorias.service";

interface CampeonatoModalProps {
  campeonato: Campeonato | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, nombre: string) => Promise<void>;
}

interface CategoriaInfo {
  [key: string]: string; // id_categoria -> nombre
}

export default function CampeonatoModal({ 
  campeonato, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: CampeonatoModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [grupoExpandido, setGrupoExpandido] = useState<string | null>(null);
  const [categoriasMap, setCategoriasMap] = useState<CategoriaInfo>({});
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Cargar información de categorías si es necesario
  useEffect(() => {
    if (isOpen && campeonato) {
      cargarCategorias();
    }
  }, [isOpen, campeonato]);

  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      
      // Extraer todos los IDs de categoría únicos de los equipos
      const categoriasIds = new Set<string>();
      
      campeonato?.grupos?.forEach(grupo => {
        grupo.equipos?.forEach(equipo => {
          if (equipo.categoria_id) {
            categoriasIds.add(equipo.categoria_id);
          }
        });
      });
      
      // Si hay categorías para cargar, obtenerlas del servicio
      if (categoriasIds.size > 0) {
        try {
          const categorias = await CategoriasService.listar();
          // Filtrar solo las categorías que necesitamos
          const categoriasFiltradas = categorias.filter(cat => 
            categoriasIds.has(cat.id_categoria)
          );
          const map: CategoriaInfo = {};
          categoriasFiltradas.forEach(cat => {
            map[cat.id_categoria] = cat.nombre;
          });
          setCategoriasMap(map);
        } catch (error) {
          console.error("Error al cargar categorías del servicio:", error);
          // Si falla, crear un mapa con nombres genéricos
          const genericMap: CategoriaInfo = {};
          Array.from(categoriasIds).forEach(id => {
            genericMap[id] = `Categoría ${id.substring(0, 4)}`;
          });
          setCategoriasMap(genericMap);
        }
      }
    } catch (error) {
      console.error("Error en cargarCategorias:", error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  if (!isOpen || !campeonato) return null;

  const calcularEstado = (fechaInicio?: string, fechaFin?: string): string => {
    if (!fechaInicio || !fechaFin) return "programado";
    
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Ajustar horas para comparar solo fechas
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);
    hoy.setHours(0, 0, 0, 0);
    
    if (hoy < inicio) return "pendiente";
    if (hoy > fin) return "finalizado";
    return "en_curso";
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "No definida";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearFechaCorta = (fecha?: string) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-ES", {
      month: 'short',
      day: 'numeric'
    });
  };

  // Función auxiliar para obtener el nombre de la categoría de un equipo
  const getCategoriaNombre = (equipo: Equipo): string => {
    // Verificar si equipo es válido
    if (!equipo) return "Sin equipo";

   

    // 2. Si viene solo el ID y tenemos el mapa cargado
    if (equipo.categoria_id && categoriasMap[equipo.categoria_id]) {
      return categoriasMap[equipo.categoria_id];
    }

    // 3. Si solo tenemos el ID pero no lo tenemos en el mapa
    if (equipo.categoria_id) {
      return `Cat. ${equipo.categoria_id.substring(0, 4)}`;
    }

    // 4. Fallback
    return "Sin categoría";
  };

  const estadoCalculado = calcularEstado(campeonato.fecha_inicio, campeonato.fecha_fin);
  const totalEquipos = campeonato.grupos?.reduce((total, grupo) => total + (grupo.equipos?.length || 0), 0) || 0;
  const gruposActivos = campeonato.grupos?.filter(g => g.estado !== false).length || 0;

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el campeonato "${campeonato.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await onDelete(campeonato.id_campeonato, campeonato.nombre);
      onClose();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar el campeonato. Por favor, intente nuevamente.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    onEdit(campeonato.id_campeonato);
    onClose();
  };

  const getEstadoBadge = (estado: string) => {
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
    
    const iconos = {
      pendiente: <AlertCircle className="h-3 w-3" />,
      en_curso: <Loader2 className="h-3 w-3 animate-spin" />,
      finalizado: <CheckCircle className="h-3 w-3" />,
      programado: <Calendar className="h-3 w-3" />
    };
    
    const estilo = estilos[estado as keyof typeof estilos] || estilos.programado;
    const texto = textos[estado as keyof typeof textos] || estado;
    const icono = iconos[estado as keyof typeof iconos] || iconos.programado;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${estilo}`}>
        {icono}
        {texto}
      </span>
    );
  };

  const getEstadoSistemaBadge = (estado: boolean) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      estado ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {estado ? (
        <>
          <CheckCircle className="h-3 w-3" />
          Activo
        </>
      ) : (
        <>
          <X className="h-3 w-3" />
          Inactivo
        </>
      )}
    </span>
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'bg-black bg-opacity-50' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className={`relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
              isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 truncate">{campeonato.nombre}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Hash className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-600 font-mono truncate max-w-xs">
                      {campeonato.id_campeonato}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
              
             
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                {/* Encabezado con estado y fechas */}
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {getEstadoBadge(estadoCalculado)}
                    {getEstadoSistemaBadge(campeonato.estado)}
                    {campeonato.eliminado && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        <AlertCircle className="h-3 w-3" />
                        Eliminado
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Inicio:</span>
                      <span>{formatearFecha(campeonato.fecha_inicio)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Fin:</span>
                      <span>{formatearFecha(campeonato.fecha_fin)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Equipos:</span>
                      <span>{totalEquipos}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Columna principal */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Descripción */}
                    {campeonato.descripcion && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Descripción
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">{campeonato.descripcion}</p>
                      </div>
                    )}

                    {/* Grupos */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          Grupos del campeonato
                        </h3>
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {campeonato.grupos?.length || 0} grupos • {totalEquipos} equipos
                        </div>
                      </div>
                      
                      {campeonato.grupos && campeonato.grupos.length > 0 ? (
                        <div className="space-y-3">
                          {campeonato.grupos.map((grupo, grupoIndex) => (
                            <div key={grupo.id_grupo || grupoIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                              <button
                                onClick={() => setGrupoExpandido(grupoExpandido === grupo.id_grupo ? null : grupo.id_grupo)}
                                className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-700 font-bold">
                                      {String.fromCharCode(65 + grupoIndex)}
                                    </span>
                                  </div>
                                  <div className="text-left">
                                    <h4 className="font-medium text-gray-900">{grupo.nombre}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-xs text-gray-600">
                                        {grupo.equipos?.length || 0} equipos
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        grupo.estado === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                      }`}>
                                        {grupo.estado === false ? 'Inactivo' : 'Activo'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className={`transform transition-transform ${
                                  grupoExpandido === grupo.id_grupo ? 'rotate-180' : ''
                                }`}>
                                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>
                              
                              {grupoExpandido === grupo.id_grupo && (
                                <div className="p-4 border-t border-gray-200 bg-white">
                                  {grupo.equipos && grupo.equipos.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {grupo.equipos.map((equipo, equipoIndex) => {
                                        // Verificar que equipo no sea undefined
                                        if (!equipo) return null;
                                        
                                        return (
                                          <div 
                                            key={equipo.id_equipo || equipoIndex} 
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                                          >
                                            <div className="flex items-center gap-3 min-w-0">
                                              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                                equipo.estado === false ? 'bg-red-500' : 'bg-green-500'
                                              }`} />
                                              <div className="min-w-0">
                                                <div className="font-medium text-gray-900 truncate">
                                                  {equipo.nombre || `Equipo ${equipoIndex + 1}`}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                  <Tag className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                                                  <div className="text-xs text-gray-500 truncate">
                                                    {loadingCategorias ? (
                                                      <span className="text-gray-400">Cargando...</span>
                                                    ) : (
                                                      getCategoriaNombre(equipo)
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex-shrink-0 text-xs text-gray-400">
                                              #{equipoIndex + 1}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                                      <Users className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                                      <p className="text-gray-600">Sin equipos asignados</p>
                                      <p className="text-sm text-gray-500 mt-1">Edita el grupo para agregar equipos</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                          <Users className="h-14 w-14 mx-auto mb-3 text-gray-400" />
                          <p className="text-gray-600">No hay grupos asignados</p>
                          <p className="text-sm text-gray-500 mt-1">Edita el campeonato para agregar grupos</p>
                          <button
                            onClick={handleEdit}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Agregar grupos
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                  
                    {/* Información del sistema */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4">Información del sistema</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Fecha de registro</p>
                          <p className="text-sm font-medium text-gray-900">
                            {campeonato.fecha_registro ? formatearFecha(campeonato.fecha_registro) : 'No registrado'}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Inicio</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatearFechaCorta(campeonato.fecha_inicio)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Fin</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatearFechaCorta(campeonato.fecha_fin)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Duración</p>
                          <p className="text-sm font-medium text-gray-900">
                            {campeonato.fecha_inicio && campeonato.fecha_fin ? (
                              (() => {
                                const inicio = new Date(campeonato.fecha_inicio);
                                const fin = new Date(campeonato.fecha_fin);
                                const diffTime = Math.abs(fin.getTime() - inicio.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
                              })()
                            ) : 'No definida'}
                          </p>
                        </div>
                      </div>
                    </div>

                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}