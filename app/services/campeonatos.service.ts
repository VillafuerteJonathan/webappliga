import { apiFetch } from "./api";
import {
  Campeonato,
  CrearCampeonatoDTO,
  ActualizarCampeonatoDTO
} from "../types/campeonato";
import { Categoria } from "../types/categoria";

// Interfaz para respuestas API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
}

export const CampeonatosService = {
  // ==============================
  // OBTENER TODOS
  // ==============================
  async obtenerTodos(): Promise<Campeonato[]> {
    try {
      const res = await apiFetch<ApiResponse<Campeonato[]>>("/campeonatos");
      
      console.log("Respuesta obtenerTodos:", res);
      
      if (!res?.success) {
        console.error("Error en obtenerTodos:", res?.error);
        return [];
      }
      
      // Verificar que los grupos y equipos estén presentes
      const campeonatos = res.data || [];
      
      // Log para debug
      campeonatos.forEach((campeonato, index) => {
        console.log(`Campeonato ${index + 1}:`, {
          nombre: campeonato.nombre,
          grupos: campeonato.grupos?.length || 0,
          equiposPorGrupo: campeonato.grupos?.map(g => ({
            grupo: g.nombre,
            equipos: g.equipos?.length || 0
          }))
        });
      });
      
      return campeonatos;
    } catch (err) {
      console.error("Error en obtenerTodos:", err);
      return [];
    }
  },

  // ==============================
  // OBTENER POR ID
  // ==============================
  async obtenerPorId(id: string): Promise<Campeonato | null> {
    try {
      const res = await apiFetch<ApiResponse<Campeonato>>(`/campeonatos/${id}`);
      
      console.log(`Respuesta obtenerPorId(${id}):`, res);
      
      if (!res?.success) {
        console.error(`Error en obtenerPorId:`, res?.error);
        return null;
      }
      
      const campeonato = res.data;
      
      if (campeonato) {
        console.log(`Campeonato ${id} cargado:`, {
          nombre: campeonato.nombre,
          grupos: campeonato.grupos?.length || 0,
          equiposTotales: campeonato.grupos?.reduce((total, grupo) => 
            total + (grupo.equipos?.length || 0), 0) || 0
        });
      }
      
      return campeonato || null;
    } catch (err) {
      console.error(`Error en obtenerPorId(${id}):`, err);
      return null;
    }
  },

  // ==============================
  // CREAR CAMPEONATO
  // ==============================
  async crear(campeonatoData: CrearCampeonatoDTO): Promise<Campeonato | null> {
    try {
      console.log("Enviando datos para crear campeonato:", JSON.stringify(campeonatoData, null, 2));
      
      const res = await apiFetch<ApiResponse<Campeonato>>("/campeonatos", {
        method: "POST",
        body: JSON.stringify(campeonatoData),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      console.log("Respuesta crear campeonato:", res);
      
      if (!res?.success) {
        console.error("Error al crear campeonato:", res?.error || "Error desconocido");
        throw new Error(res?.error || "Error al crear campeonato");
      }
      
      const campeonatoCreado = res.data;
      
      if (campeonatoCreado) {
        console.log("Campeonato creado exitosamente:", {
          id: campeonatoCreado.id_campeonato,
          nombre: campeonatoCreado.nombre,
          grupos: campeonatoCreado.grupos?.length || 0
        });
      }
      
      return campeonatoCreado || null;
    } catch (err: any) {
      console.error("Error en crear:", err);
      throw err; // Re-lanzar para manejar en el componente
    }
  },

  // ==============================
  // ACTUALIZAR CAMPEONATO
  // ==============================
  // ==============================
// ACTUALIZAR CAMPEONATO
// ==============================
async actualizar(
  id: string,
  campeonatoData: ActualizarCampeonatoDTO
): Promise<Campeonato | null> {
  try {
    console.log(
      `Enviando datos para actualizar campeonato ${id}:`,
      JSON.stringify(campeonatoData, null, 2)
    );

    const res = await apiFetch<ApiResponse<Campeonato>>(
      `/campeonatos/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(campeonatoData),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }
    );

    console.log(`Respuesta actualizar campeonato ${id}:`, res);

    // 🔐 Manejo correcto de errores del backend
    if (!res?.success) {
      const mensaje =
        res?.error ||
        (res?.errors && res.errors.join(", ")) ||
        `Error al actualizar campeonato ${id}`;

      throw new Error(mensaje);
    }

    const campeonatoActualizado = res.data || null;

    if (campeonatoActualizado) {
      console.log("Campeonato actualizado exitosamente:", {
        id: campeonatoActualizado.id_campeonato,
        nombre: campeonatoActualizado.nombre,
        grupos: campeonatoActualizado.grupos?.length || 0
      });
    }

    return campeonatoActualizado;

  } catch (err: any) {
    console.error(`Error en actualizar(${id}):`, err);
    throw err; // ← se relanza para que el UI lo muestre
  }
},
  // ==============================
  // ELIMINAR CAMPEONATO
  // ==============================
  async eliminar(id: string): Promise<boolean> {
    try {
      console.log(`Eliminando campeonato ${id}`);
      
      const res = await apiFetch<ApiResponse>(`/campeonatos/${id}`, {
        method: "DELETE"
      });
      
      console.log(`Respuesta eliminar campeonato ${id}:`, res);
      
      if (!res?.success) {
        console.error(`Error al eliminar campeonato ${id}:`, res?.error);
        throw new Error(res?.error || `Error al eliminar campeonato ${id}`);
      }
      
      return true;
    } catch (err: any) {
      console.error(`Error en eliminar(${id}):`, err);
      throw err;
    }
  },

  // ==============================
  // OBTENER EQUIPOS DISPONIBLES
  // ==============================
  async obtenerEquiposDisponibles(id: string) {
    try {
      const res = await apiFetch<ApiResponse<any[]>>(`/campeonatos/${id}/equipos-disponibles`);
      
      if (!res?.success) {
        console.error(`Error al obtener equipos disponibles ${id}:`, res?.error);
        return [];
      }
      
      return res.data || [];
    } catch (err) {
      console.error(`Error en obtenerEquiposDisponibles(${id}):`, err);
      return [];
    }
  },

  // ==============================
  // LISTAR CATEGORIAS
  // ==============================
  async listarCategorias(): Promise<Categoria[]> {
    try {
      const res = await apiFetch<ApiResponse<Categoria[]>>("/categorias");
      
      if (!res?.success) {
        console.error("Error al obtener categorías:", res?.error);
        return [];
      }
      
      return res.data || [];
    } catch (err) {
      console.error("Error en listarCategorias:", err);
      return [];
    }
  },

// generar partidos
async generarPartidos(id: string) {
  const res = await apiFetch(`/campeonatos/${id}/generar-partidos`, {
    method: "POST"
  });

  if (!res.success) {
    throw new Error(res.error || "No se pudieron generar los partidos");
  }
}
};
