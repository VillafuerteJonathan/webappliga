// components/campeonatos/CampeonatoForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CampeonatosService } from "@/services/campeonatos.service";
import { GruposService } from "@/services/grupos.service";
import { EquiposService } from "@/services/equipos.service";
import { CategoriasService } from "@/services/categorias.service";
import { Campeonato } from "@/types/campeonato";
import { Grupo } from "@/types/grupo";
import { Categoria } from "@/types/categoria";
import { 
  Save, X, AlertCircle, Check, Loader2, Trophy, Users, Trash2,
  Search, Filter, ChevronDown, ChevronUp, Plus, Tag,
  ArrowLeft, ArrowRight, CheckSquare, Square, Calendar
} from "lucide-react";

// Tipos locales
interface EquipoForm {
  id_equipo: string;
  nombre: string;
  categoria_id: string;
  categoria_nombre?: string;
}

interface GrupoSeleccionado {
  id_grupo: string;
  nombre: string;
  equiposIds: string[];
}

interface CampeonatoFormProps {
  campeonato?: Campeonato;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CampeonatoForm({ campeonato, onSuccess, onCancel }: CampeonatoFormProps) {
  const router = useRouter();
  const esEdicion = !!campeonato;

  const [formData, setFormData] = useState({
    nombre: campeonato?.nombre || "",
    fecha_inicio: campeonato?.fecha_inicio?.split("T")[0] || "",
    fecha_fin: campeonato?.fecha_fin?.split("T")[0] || "",
    descripcion: campeonato?.descripcion || ""
  });

  const [gruposSeleccionados, setGruposSeleccionados] = useState<GrupoSeleccionado[]>([]);
  const [gruposDisponibles, setGruposDisponibles] = useState<Grupo[]>([]);
  const [equipos, setEquipos] = useState<EquipoForm[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Estados para búsqueda y filtros
  const [busquedaEquipo, setBusquedaEquipo] = useState<string>("");
  const [busquedaGrupo, setBusquedaGrupo] = useState<string>("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [grupoActivo, setGrupoActivo] = useState<string | null>(null);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<Set<string>>(new Set());

  // Paginación
  const [paginaEquipos, setPaginaEquipos] = useState(1);
  const equiposPorPagina = 12; // Reducido para modal

  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (campeonato?.grupos) {
      const grupos: GrupoSeleccionado[] = campeonato.grupos.map(g => ({
        id_grupo: g.id_grupo,
        nombre: g.nombre,
        equiposIds: g.equipos?.map(e => e.id_equipo) || []
      }));
      setGruposSeleccionados(grupos);
      if (grupos.length > 0) {
        setGrupoActivo(grupos[0].id_grupo);
      }
    }
  }, [campeonato]);

  const cargarDatosIniciales = async () => {
    setLoadingDatos(true);
    try {
      const [gruposData, equiposDataRaw, categoriasData] = await Promise.all([
        GruposService.listar(),
        EquiposService.listar(),
        CategoriasService.listar()
      ]);
      
      setGruposDisponibles(gruposData);
      setCategorias(categoriasData);

      // Crear un mapa de categorías para búsqueda rápida
      const categoriasMap = new Map(categoriasData.map(c => [c.id_categoria, c.nombre]));

      // Mapear equipos con el nombre de la categoría
      const equiposData: EquipoForm[] = equiposDataRaw.map(e => ({
        id_equipo: e.id_equipo,
        nombre: e.nombre,
        categoria_id: e.categoria_id,
        categoria_nombre: categoriasMap.get(e.categoria_id) || "Sin categoría"
      }));
      
      setEquipos(equiposData);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los datos iniciales");
    } finally {
      setLoadingDatos(false);
    }
  };

  // Funciones del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  // Funciones para grupos
  const agregarGrupo = (grupoId: string) => {
    const grupo = gruposDisponibles.find(g => g.id_grupo === grupoId);
    if (!grupo) return;
    if (gruposSeleccionados.some(g => g.id_grupo === grupoId)) {
      setError("Grupo ya agregado");
      return;
    }
    
    const nuevoGrupo: GrupoSeleccionado = {
      id_grupo: grupo.id_grupo,
      nombre: grupo.nombre,
      equiposIds: []
    };
    
    setGruposSeleccionados(prev => [...prev, nuevoGrupo]);
    setGrupoActivo(grupoId);
    setBusquedaGrupo("");
    setError("");
  };

  const eliminarGrupo = (grupoId: string) => {
    const grupo = gruposSeleccionados.find(g => g.id_grupo === grupoId);
    if (grupo?.equiposIds.length || 0 > 0) {
      if (!confirm("Este grupo tiene equipos asignados. ¿Desea eliminarlo de todas formas?")) {
        return;
      }
    }
    
    setGruposSeleccionados(prev => prev.filter(g => g.id_grupo !== grupoId));
    if (grupoActivo === grupoId) {
      setGrupoActivo(gruposSeleccionados.length > 1 ? gruposSeleccionados[0]?.id_grupo || null : null);
    }
    setEquiposSeleccionados(new Set());
  };

  const cambiarGrupoActivo = (grupoId: string) => {
    setGrupoActivo(grupoId);
    setEquiposSeleccionados(new Set());
    setPaginaEquipos(1);
  };

  // Funciones para equipos
  const toggleSeleccionEquipo = (equipoId: string) => {
    const nuevosSeleccionados = new Set(equiposSeleccionados);
    if (nuevosSeleccionados.has(equipoId)) {
      nuevosSeleccionados.delete(equipoId);
    } else {
      nuevosSeleccionados.add(equipoId);
    }
    setEquiposSeleccionados(nuevosSeleccionados);
  };

  const agregarEquiposSeleccionados = () => {
    if (!grupoActivo || equiposSeleccionados.size === 0) return;
    
    setGruposSeleccionados(prev => prev.map(grupo => {
      if (grupo.id_grupo === grupoActivo) {
        const nuevosEquipos = Array.from(equiposSeleccionados)
          .filter(equipoId => !grupo.equiposIds.includes(equipoId));
        return {
          ...grupo,
          equiposIds: [...grupo.equiposIds, ...nuevosEquipos]
        };
      }
      return grupo;
    }));
    
    setEquiposSeleccionados(new Set());
  };

  const eliminarEquipoDeGrupo = (grupoId: string, equipoId: string) => {
    setGruposSeleccionados(prev => prev.map(grupo => 
      grupo.id_grupo === grupoId
        ? { ...grupo, equiposIds: grupo.equiposIds.filter(id => id !== equipoId) }
        : grupo
    ));
  };

  const agregarTodosLosEquiposFiltrados = () => {
    if (!grupoActivo) return;
    
    const equipoIdsFiltrados = equiposFiltrados
      .filter(e => !equiposEnGrupoActual.includes(e.id_equipo))
      .map(e => e.id_equipo);
    
    if (equipoIdsFiltrados.length === 0) return;
    
    setGruposSeleccionados(prev => prev.map(grupo => {
      if (grupo.id_grupo === grupoActivo) {
        const nuevosEquipos = equipoIdsFiltrados
          .filter(equipoId => !grupo.equiposIds.includes(equipoId));
        return {
          ...grupo,
          equiposIds: [...grupo.equiposIds, ...nuevosEquipos]
        };
      }
      return grupo;
    }));
  };

  // Funciones de búsqueda y filtrado
  const equiposFiltrados = useMemo(() => {
    let filtrados = equipos;
    
    // Filtrar por búsqueda
    if (busquedaEquipo.trim()) {
      filtrados = filtrados.filter(equipo =>
        equipo.nombre.toLowerCase().includes(busquedaEquipo.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (filtroCategoria !== "todas") {
      filtrados = filtrados.filter(equipo =>
        equipo.categoria_id === filtroCategoria
      );
    }
    
    // Excluir equipos ya en el grupo actual
    if (grupoActivo) {
      const grupo = gruposSeleccionados.find(g => g.id_grupo === grupoActivo);
      const equiposEnGrupo = grupo?.equiposIds || [];
      filtrados = filtrados.filter(e => !equiposEnGrupo.includes(e.id_equipo));
    }
    
    return filtrados;
  }, [equipos, busquedaEquipo, filtroCategoria, grupoActivo, gruposSeleccionados]);

  const equiposEnGrupoActual = useMemo(() => {
    if (!grupoActivo) return [];
    const grupo = gruposSeleccionados.find(g => g.id_grupo === grupoActivo);
    return grupo?.equiposIds || [];
  }, [grupoActivo, gruposSeleccionados]);

  const gruposFiltrados = useMemo(() => {
    return gruposDisponibles.filter(grupo => 
      !gruposSeleccionados.some(g => g.id_grupo === grupo.id_grupo) &&
      (busquedaGrupo.trim() === "" || grupo.nombre.toLowerCase().includes(busquedaGrupo.toLowerCase()))
    );
  }, [gruposDisponibles, gruposSeleccionados, busquedaGrupo]);

  // Paginación de equipos
  const totalPaginas = Math.ceil(equiposFiltrados.length / equiposPorPagina);
  const equiposPaginados = equiposFiltrados.slice(
    (paginaEquipos - 1) * equiposPorPagina,
    paginaEquipos * equiposPorPagina
  );

  // Validación
  const validarFormulario = (): boolean => {
    if (!formData.nombre.trim()) {
      setError("El nombre del campeonato es requerido");
      return false;
    }
    
    if (formData.fecha_inicio && formData.fecha_fin) {
      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      if (inicio >= fin) {
        setError("La fecha de inicio debe ser anterior a la fecha de fin");
        return false;
      }
    }
    
    if (gruposSeleccionados.length === 0) {
      setError("Debe agregar al menos un grupo al campeonato");
      return false;
    }
    
    // Verificar que todos los grupos tengan al menos un equipo
    const gruposSinEquipos = gruposSeleccionados.filter(g => g.equiposIds.length === 0);
    if (gruposSinEquipos.length > 0) {
      setError(`Los siguientes grupos no tienen equipos: ${gruposSinEquipos.map(g => g.nombre).join(', ')}`);
      return false;
    }
    
    return true;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (esEdicion) {
        const dataActualizar = {
          nombre: formData.nombre,
          fecha_inicio: formData.fecha_inicio || "",
          fecha_fin: formData.fecha_fin || "",
          descripcion: formData.descripcion,
          grupos: gruposSeleccionados.map(g => ({
            id_grupo: g.id_grupo,
            nombre: g.nombre,
            equiposIds: g.equiposIds,
            estado: true
          }))
        };
        const resultado = await CampeonatosService.actualizar(campeonato!.id_campeonato, dataActualizar);
        if (resultado) setSuccess("Campeonato actualizado exitosamente");
      } else {
        const dataCrear = {
          nombre: formData.nombre,
          fecha_inicio: formData.fecha_inicio || "",
          fecha_fin: formData.fecha_fin || "",
          descripcion: formData.descripcion,
          grupos: gruposSeleccionados.map(g => ({
            nombre: g.nombre,
            equiposIds: g.equiposIds,
            estado: true
          }))
        };
        const resultado = await CampeonatosService.crear(dataCrear);
        if (resultado) setSuccess("Campeonato creado exitosamente");
      }

      setTimeout(() => onSuccess ? onSuccess() : router.push("/campeonatos"), 1500);
    } catch (err) {
      console.error(err);
      setError("Error al guardar el campeonato. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas
  const totalEquiposSeleccionados = gruposSeleccionados.reduce((total, grupo) => total + grupo.equiposIds.length, 0);

  // Si está cargando datos iniciales
  if (loadingDatos) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-700 font-medium">Cargando datos...</p>
        <p className="text-gray-500 text-sm mt-2">Por favor espere un momento</p>
      </div>
    );
  }

  return (
    <div className="max-w-full">
      {/* Alertas */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-700 font-medium">Éxito</p>
            <p className="text-green-600 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica - Más compacta */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Información Básica
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del campeonato"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Descripción breve del campeonato"
              />
            </div>
          </div>
        </div>

        {/* Grupos y Equipos - Layout más compacto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Grupos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Grupos
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {gruposSeleccionados.length}
                </span>
              </h3>
              <div className="text-xs text-gray-500">
                {totalEquiposSeleccionados} equipos total
              </div>
            </div>

            {/* Búsqueda de grupos */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={busquedaGrupo}
                onChange={(e) => setBusquedaGrupo(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Grupos seleccionados */}
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {gruposSeleccionados.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No hay grupos agregados
                </div>
              ) : (
                gruposSeleccionados.map((grupo) => (
                  <div
                    key={grupo.id_grupo}
                    className={`flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer ${
                      grupoActivo === grupo.id_grupo
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => cambiarGrupoActivo(grupo.id_grupo)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        grupoActivo === grupo.id_grupo ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{grupo.nombre}</div>
                        <div className="text-xs text-gray-500">
                          {grupo.equiposIds.length} equipo{grupo.equiposIds.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarGrupo(grupo.id_grupo);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Grupos disponibles */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Disponibles:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {gruposFiltrados.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">No hay grupos disponibles</p>
                ) : (
                  gruposFiltrados.map((grupo) => (
                    <div
                      key={grupo.id_grupo}
                      className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100"
                    >
                      <span className="text-sm font-medium text-gray-900">{grupo.nombre}</span>
                      <button
                        type="button"
                        onClick={() => agregarGrupo(grupo.id_grupo)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Agregar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel de Equipos */}
          <div className="space-y-4">
            {grupoActivo ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Equipos: <span className="text-blue-600">
                        {gruposSeleccionados.find(g => g.id_grupo === grupoActivo)?.nombre}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {equiposEnGrupoActual.length} asignado{equiposEnGrupoActual.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {equiposFiltrados.length} disponible{equiposFiltrados.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  {equiposSeleccionados.size > 0 && (
                    <button
                      type="button"
                      onClick={agregarEquiposSeleccionados}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckSquare className="h-3 w-3" />
                      Agregar {equiposSeleccionados.size}
                    </button>
                  )}
                </div>

                {/* Filtros de equipos */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar equipos..."
                      value={busquedaEquipo}
                      onChange={(e) => {
                        setBusquedaEquipo(e.target.value);
                        setPaginaEquipos(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <select
                      value={filtroCategoria}
                      onChange={(e) => {
                        setFiltroCategoria(e.target.value);
                        setPaginaEquipos(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="todas">Todas las categorías</option>
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Acción rápida */}
                {equiposFiltrados.length > 0 && (
                  <button
                    type="button"
                    onClick={agregarTodosLosEquiposFiltrados}
                    className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar todos ({equiposFiltrados.length})
                  </button>
                )}

                {/* Equipos disponibles */}
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {equiposPaginados.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 text-sm">No hay equipos disponibles</p>
                    </div>
                  ) : (
                    <>
                      {equiposPaginados.map((equipo) => (
                        <div
                          key={equipo.id_equipo}
                          className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                            equiposSeleccionados.has(equipo.id_equipo)
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => toggleSeleccionEquipo(equipo.id_equipo)}
                        >
                          <button
                            type="button"
                            className="flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSeleccionEquipo(equipo.id_equipo);
                            }}
                          >
                            {equiposSeleccionados.has(equipo.id_equipo) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm truncate">{equipo.nombre}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Tag className="h-2.5 w-2.5 text-gray-400" />
                              <span className="text-xs text-gray-500 truncate">{equipo.categoria_nombre}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Paginación */}
                      {totalPaginas > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <button
                            type="button"
                            onClick={() => setPaginaEquipos(p => Math.max(1, p - 1))}
                            disabled={paginaEquipos === 1}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <span className="text-xs text-gray-700">
                            Página {paginaEquipos} de {totalPaginas}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPaginaEquipos(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaEquipos === totalPaginas}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Equipos asignados */}
                {equiposEnGrupoActual.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Equipos asignados:</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {equiposEnGrupoActual.map(equipoId => {
                        const equipo = equipos.find(e => e.id_equipo === equipoId);
                        if (!equipo) return null;
                        
                        return (
                          <div
                            key={equipo.id_equipo}
                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{equipo.nombre}</div>
                                <div className="text-xs text-gray-500">{equipo.categoria_nombre}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarEquipoDeGrupo(grupoActivo, equipo.id_equipo)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Users className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Selecciona un grupo</h3>
                <p className="text-gray-600 text-sm">
                  Para agregar equipos, selecciona un grupo del panel izquierdo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción - Más compactos */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{gruposSeleccionados.length}</span> grupos • 
            <span className="font-medium ml-1">{totalEquiposSeleccionados}</span> equipos
          </div>
          
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading || gruposSeleccionados.length === 0}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {esEdicion ? "Actualizar" : "Crear"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}