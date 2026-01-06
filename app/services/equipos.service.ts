// services/equipos.service.ts
import { apiFetch } from "./api";
import { Equipo } from "@/types/equipo";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  code?: string;
  errors?: Record<string, string[]>;
}

export const EquiposService = {
  // ===========================
  // CRUD GENERAL
  // ===========================
  async listar(): Promise<Equipo[]> {
    try {
      const response = await apiFetch<ApiResponse<Equipo[]>>("/equipos");
      if (response?.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error en EquiposService.listar:", error);
      throw error;
    }
  },

  async crear(data: Partial<Equipo>): Promise<ApiResponse<Equipo>> {
    return apiFetch<ApiResponse<Equipo>>("/equipos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async editar(id: string, data: Partial<Equipo>): Promise<ApiResponse<Equipo>> {
    return apiFetch<ApiResponse<Equipo>>(`/equipos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async eliminar(id: string): Promise<ApiResponse<Equipo>> {
    return apiFetch<ApiResponse<Equipo>>(`/equipos/${id}`, {
      method: "DELETE",
    });
  },

  // ===========================
  // CAMPEONATOS / GRUPOS
  // ===========================
  async obtenerDisponiblesParaGrupo(idCampeonato: string, idGrupo: string): Promise<Equipo[]> {
    try {
      const res = await apiFetch<ApiResponse<any>>(
        `/campeonatos/${idCampeonato}/grupos/${idGrupo}/equipos`
      );
      return res?.data?.disponibles || [];
    } catch (err) {
      console.error("Error al obtener equipos disponibles para grupo:", err);
      return [];
    }
  },

  async obtenerEnGrupo(idCampeonato: string, idGrupo: string): Promise<Equipo[]> {
    try {
      const res = await apiFetch<ApiResponse<any>>(
        `/campeonatos/${idCampeonato}/grupos/${idGrupo}/equipos`
      );
      return res?.data?.asignados || [];
    } catch (err) {
      console.error("Error al obtener equipos en grupo:", err);
      return [];
    }
  },

  async agregarAGrupo(idCampeonato: string, idGrupo: string, idEquipo: string) {
    const res = await apiFetch<ApiResponse>(
      `/campeonatos/${idCampeonato}/grupos/${idGrupo}/equipos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEquipo }),
      }
    );

    if (!res?.success) {
      throw new Error(res?.error || res?.message || "Error al agregar equipo al grupo");
    }

    return res;
  },

  async removerDeGrupo(idCampeonato: string, idGrupo: string, idEquipo: string) {
    const res = await apiFetch<ApiResponse>(
      `/campeonatos/${idCampeonato}/grupos/${idGrupo}/equipos/${idEquipo}`,
      { method: "DELETE" }
    );

    if (!res?.success) {
      throw new Error(res?.error || res?.message || "Error al remover equipo del grupo");
    }

    return res;
  },

  // ===========================
  // HABILITAR / DESHABILITAR
  // ===========================
  async habilitar(id: string): Promise<Equipo> {
    const res = await apiFetch<ApiResponse<Equipo>>(
      `/equipos/${id}/habilitar`,
      { method: "PATCH" }
    );

    if (!res?.success) {
      throw new Error(res?.error || res?.message || "Error al habilitar el equipo");
    }

    return res.data!;
  },

  async deshabilitar(id: string): Promise<Equipo> {
    const res = await apiFetch<ApiResponse<Equipo>>(
      `/equipos/${id}/deshabilitar`,
      { method: "PATCH" }
    );

    if (!res?.success) {
      throw new Error(res?.error || res?.message || "Error al deshabilitar el equipo");
    }

    return res.data!;
  },
};
