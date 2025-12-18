// services/arbitros.service.ts
import { apiFetch } from "./api";
import { Arbitro } from "@/types/arbitro";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const ArbitrosService = {
  async listar(): Promise<Arbitro[]> {
    try {
      const response = await apiFetch<any>("/arbitros");

      console.log("Respuesta listar árbitros:", response);

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
          if (Array.isArray(response[key])) return response[key];
        }
      }

      console.warn("Respuesta no contiene array válido, devolviendo []");
      return [];
    } catch (error) {
      console.error("Error en ArbitrosService.listar:", error);
      throw error;
    }
  },

  async crear(data: Partial<Arbitro>): Promise<ApiResponse<Arbitro>> {
    try {
      const response = await apiFetch<ApiResponse<Arbitro>>("/arbitros", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return response;
    } catch (error: any) {
      console.error("Error en ArbitrosService.crear:", error);
      // Capturamos error de cédula duplicada (PG 23505)
      if (error?.code === "23505") {
        return { success: false, message: "La cédula ya está registrada" };
      }
      return { success: false, message: error?.message || "Error al crear árbitro" };
    }
  },

  async editar(id: string, data: Partial<Arbitro>): Promise<ApiResponse<Arbitro>> {
    try {
      const response = await apiFetch<ApiResponse<Arbitro>>(`/arbitros/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      return response;
    } catch (error: any) {
      console.error("Error en ArbitrosService.editar:", error);
      if (error?.code === "23505") {
        return { success: false, message: "La cédula ya está registrada" };
      }
      return { success: false, message: error?.message || "Error al editar árbitro" };
    }
  },

  async habilitar(id: string): Promise<ApiResponse<Arbitro>> {
    try {
      const response = await apiFetch<ApiResponse<Arbitro>>(`/arbitros/${id}/habilitar`, {
        method: "PATCH",
      });

      return response;
    } catch (error: any) {
      console.error("Error en ArbitrosService.habilitar:", error);
      return { success: false, message: error?.message || "Error al habilitar árbitro" };
    }
  },

  async deshabilitar(id: string): Promise<ApiResponse<Arbitro>> {
    try {
      const response = await apiFetch<ApiResponse<Arbitro>>(`/arbitros/${id}/deshabilitar`, {
        method: "PATCH",
      });

      return response;
    } catch (error: any) {
      console.error("Error en ArbitrosService.deshabilitar:", error);
      return { success: false, message: error?.message || "Error al deshabilitar árbitro" };
    }
  },

  async eliminar(id: string): Promise<ApiResponse<Arbitro>> {
    try {
      const response = await apiFetch<ApiResponse<Arbitro>>(`/arbitros/${id}`, {
        method: "DELETE",
      });

      return response;
    } catch (error: any) {
      console.error("Error en ArbitrosService.eliminar:", error);
      return { success: false, message: error?.message || "Error al eliminar árbitro" };
    }
  },
};
  