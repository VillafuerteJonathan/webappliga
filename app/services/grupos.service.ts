import { apiFetch } from "./api";
import { Grupo } from "@/types/grupo";

export const GruposService = {
  // =============================
  // LISTAR
  // =============================
  async listar(): Promise<Grupo[]> {
    try {
      const response = await apiFetch<any>("/grupos");

      console.log("Respuesta listar grupos:", response);

      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }

      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      if (Array.isArray(response)) {
        return response;
      }

      if (response && typeof response === "object") {
        for (const key in response) {
          if (Array.isArray(response[key])) {
            return response[key];
          }
        }
      }

      console.warn("Respuesta de grupos no contiene array válido, devolviendo []");
      return [];
    } catch (error) {
      console.error("Error en GruposService.listar:", error);
      throw error;
    }
  },

  // =============================
  // CREAR
  // =============================
async crear(data: Partial<Grupo>): Promise<Grupo | { success: false; message: string }> {
  try {
    const response = await apiFetch<any>("/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // Si la API devuelve error de negocio (ej. grupo duplicado)
    if (response?.success === false) return { success: false, message: response.error || response.message };

    return response.data ?? response;
  } catch (error: any) {
    // Detectamos si es error de duplicado de Postgres
    if (error?.code === "23505" || (error?.detail && error.detail.includes("grupo_nombre_key"))) {
      return { success: false, message: "Ya existe un grupo con ese nombre" };
    }

    console.error("Error en GruposService.crear:", error.message || error);
    return { success: false, message: "Error al guardar grupo" };
  }
},

  // =============================
  // EDITAR
  // =============================
  async editar(id: string, data: Partial<Grupo>): Promise<Grupo> {
    try {
      const response = await apiFetch<any>(`/grupos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response && response.success && response.data) return response.data;
      if (response && response.data) return response.data;
      return response;
    } catch (error) {
      console.error("Error en GruposService.editar:", error);
      throw error;
    }
  },

  // =============================
  // HABILITAR
  // =============================
  async habilitar(id: string): Promise<Grupo> {
    try {
      const response = await apiFetch<any>(`/grupos/${id}/habilitar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (response && response.success && response.data) return response.data;
      if (response && response.data) return response.data;
      return response;
    } catch (error) {
      console.error("Error en GruposService.habilitar:", error);
      throw error;
    }
  },

  // =============================
  // DESHABILITAR
  // =============================
  async deshabilitar(id: string): Promise<Grupo> {
    try {
      const response = await apiFetch<any>(`/grupos/${id}/deshabilitar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (response && response.success && response.data) return response.data;
      if (response && response.data) return response.data;
      return response;
    } catch (error) {
      console.error("Error en GruposService.deshabilitar:", error);
      throw error;
    }
  },

  // =============================
  // ELIMINAR (SOFT DELETE)
  // =============================
  async eliminar(id: string): Promise<Grupo> {
    try {
      const response = await apiFetch<any>(`/grupos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response && response.success && response.data) return response.data;
      if (response && response.data) return response.data;
      return response;
    } catch (error) {
      console.error("Error en GruposService.eliminar:", error);
      throw error;
    }
  },
};
