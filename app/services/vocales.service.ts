// services/vocales.service.ts
import { apiFetch } from "./api";
import { Vocal } from "@/types/vocales";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const VocalesService = {

  // =============================
  // LISTAR
  // =============================
  async listar(): Promise<Vocal[]> {
    try {
      const response = await apiFetch<any>("/vocales");

      console.log("Respuesta listar vocales:", response);
      if (response?.success && Array.isArray(response.data)) {
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
      console.error("Error en VocalesService.listar:", error);
      throw error;
    }
  },

  // =============================
  // CREAR
  // =============================
  async crearVocal(
    data: Partial<Vocal>
  ): Promise<ApiResponse<Vocal>> {
    try {
      return await apiFetch<ApiResponse<Vocal>>("/vocales", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error("Error en VocalesService.crear:", error);

      if (error?.code === "23505") {
        return {
          success: false,
          message: "La cédula o el correo ya están registrados",
        };
      }

      return {
        success: false,
        message: error?.message || "Error al crear delegado",
      };
    }
  },

  // =============================
  // EDITAR
  // =============================
  async editarVocal(
    id: string,
    data: Partial<Vocal>
  ): Promise<ApiResponse<Vocal>> {
    try {
      return await apiFetch<ApiResponse<Vocal>>(`/vocales/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error("Error en VocalesService.editar:", error);

      if (error?.code === "23505") {
        return {
          success: false,
          message: "La cédula o el correo ya están registrados",
        };
      }

      return {
        success: false,
        message: error?.message || "Error al editar vocal",
      };
    }
  },

  // =============================
  // HABILITAR
  // =============================
  async habilitar(id: string): Promise<ApiResponse<Vocal>> {
    try {
      return await apiFetch<ApiResponse<Vocal>>(
        `/vocales/${id}/habilitar`,
        { method: "PATCH" }
      );
    } catch (error: any) {
      console.error("Error en VocalesService.habilitar:", error);
      return {
        success: false,
        message: error?.message || "Error al habilitar vocal",
      };
    }
  },

  // =============================
  // DESHABILITAR
  // =============================
  async deshabilitar(id: string): Promise<ApiResponse<Vocal>> {
    try {
      return await apiFetch<ApiResponse<Vocal>>(
        `/vocales/${id}/deshabilitar`,
        { method: "PATCH" }
      );
    } catch (error: any) {
      console.error("Error en VocalesService.deshabilitar:", error);
      return {
        success: false,
        message: error?.message || "Error al deshabilitar vocal",
      };
    }
  },

  // =============================
  // ELIMINAR (SOFT DELETE)
  // =============================
  async eliminarVocal(id: string): Promise<ApiResponse<Vocal>> {
    try {
      return await apiFetch<ApiResponse<Vocal>>(`/vocales/${id}`, {
        method: "DELETE",
      });
    } catch (error: any) {
      console.error("Error en VocalesService.eliminar:", error);
      return {
        success: false,
        message: error?.message || "Error al eliminar vocal",
      };
    }
  },
};

