// services/delegados.service.ts
import { apiFetch } from "./api";
import { Delegado } from "@/types/delegado";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const DelegadosService = {

  // =============================
  // LISTAR
  // =============================
  async listar(): Promise<Delegado[]> {
    try {
      const response = await apiFetch<any>("/delegados");

      console.log("Respuesta listar delegados:", response);

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
      console.error("Error en DelegadosService.listar:", error);
      throw error;
    }
  },

  // =============================
  // CREAR
  // =============================
  async crearDelegado(
    data: Partial<Delegado>
  ): Promise<ApiResponse<Delegado>> {
    try {
      return await apiFetch<ApiResponse<Delegado>>("/delegados", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error("Error en DelegadosService.crear:", error);

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
  async editarDelegado(
    id: string,
    data: Partial<Delegado>
  ): Promise<ApiResponse<Delegado>> {
    try {
      return await apiFetch<ApiResponse<Delegado>>(`/delegados/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      console.error("Error en DelegadosService.editar:", error);

      if (error?.code === "23505") {
        return {
          success: false,
          message: "La cédula o el correo ya están registrados",
        };
      }

      return {
        success: false,
        message: error?.message || "Error al editar delegado",
      };
    }
  },

  // =============================
  // HABILITAR
  // =============================
  async habilitar(id: string): Promise<ApiResponse<Delegado>> {
    try {
      return await apiFetch<ApiResponse<Delegado>>(
        `/delegados/${id}/habilitar`,
        { method: "PATCH" }
      );
    } catch (error: any) {
      console.error("Error en DelegadosService.habilitar:", error);
      return {
        success: false,
        message: error?.message || "Error al habilitar delegado",
      };
    }
  },

  // =============================
  // DESHABILITAR
  // =============================
  async deshabilitar(id: string): Promise<ApiResponse<Delegado>> {
    try {
      return await apiFetch<ApiResponse<Delegado>>(
        `/delegados/${id}/deshabilitar`,
        { method: "PATCH" }
      );
    } catch (error: any) {
      console.error("Error en DelegadosService.deshabilitar:", error);
      return {
        success: false,
        message: error?.message || "Error al deshabilitar delegado",
      };
    }
  },

  // =============================
  // ELIMINAR (SOFT DELETE)
  // =============================
  async eliminarDelegado(id: string): Promise<ApiResponse<Delegado>> {
    try {
      return await apiFetch<ApiResponse<Delegado>>(`/delegados/${id}`, {
        method: "DELETE",
      });
    } catch (error: any) {
      console.error("Error en DelegadosService.eliminar:", error);
      return {
        success: false,
        message: error?.message || "Error al eliminar delegado",
      };
    }
  },
};

