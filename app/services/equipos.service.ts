// services/equipos.service.ts
import { apiFetch } from "./api";
import { Equipo } from "@/types/equipo";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  errors?: Record<string, string[]>;
}

export const EquiposService = {
  async listar(): Promise<Equipo[]> {
    try {
      console.log("Solicitando lista de equipos...");
      const response = await apiFetch<any>("/equipos");

      console.log("Respuesta listar equipos:", response);

      // Diferentes formatos de respuesta posibles
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
    } catch (error: any) {
      console.error("Error en EquiposService.listar:", error);
      // Mostrar error al usuario si es necesario
      // toast.error(error.message || "Error al cargar equipos");
      throw error;
    }
  },

  async crear(data: Partial<Equipo>): Promise<ApiResponse<Equipo>> {
    try {
      console.log("Creando equipo:", data);
      const response = await apiFetch<ApiResponse<Equipo>>("/equipos", {
        method: "POST",
        body: JSON.stringify(data),
      });

      console.log("Respuesta crear equipo:", response);
      return response;
    } catch (error: any) {
      console.error("Error en EquiposService.crear:", error);
      
      // Manejo de errores específicos
      let errorMessage = error?.message || "Error al crear equipo";
      
      if (error?.code === "23505") {
        errorMessage = "El nombre del equipo ya está registrado";
      } else if (error?.errors) {
        // Si hay errores de validación del backend
        const firstError = Object.values(error.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : "Error de validación";
      } else if (error?.message?.includes("NetworkError")) {
        errorMessage = "Error de conexión con el servidor";
      }
      
      return { 
        success: false, 
        message: errorMessage,
        code: error?.code 
      };
    }
  },

  async editar(id: string, data: Partial<Equipo>): Promise<ApiResponse<Equipo>> {
    try {
      console.log(`Editando equipo ${id}:`, data);
      const response = await apiFetch<ApiResponse<Equipo>>(`/equipos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      console.log("Respuesta editar equipo:", response);
      return response;
    } catch (error: any) {
      console.error("Error en EquiposService.editar:", error);
      
      let errorMessage = error?.message || "Error al editar equipo";
      
      if (error?.code === "23505") {
        errorMessage = "El nombre del equipo ya está registrado";
      } else if (error?.errors) {
        const firstError = Object.values(error.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : "Error de validación";
      }
      
      return { 
        success: false, 
        message: errorMessage,
        code: error?.code 
      };
    }
  },

  async habilitar(id: string): Promise<ApiResponse<Equipo>> {
    try {
      console.log(`Habilitando equipo ${id}`);
      const response = await apiFetch<ApiResponse<Equipo>>(`/equipos/${id}/habilitar`, {
        method: "PATCH",
      });

      return response;
    } catch (error: any) {
      console.error("Error en EquiposService.habilitar:", error);
      return { 
        success: false, 
        message: error?.message || "Error al habilitar equipo" 
      };
    }
  },

  async deshabilitar(id: string): Promise<ApiResponse<Equipo>> {
    try {
      console.log(`Deshabilitando equipo ${id}`);
      const response = await apiFetch<ApiResponse<Equipo>>(`/equipos/${id}/deshabilitar`, {
        method: "PATCH",
      });

      return response;
    } catch (error: any) {
      console.error("Error en EquiposService.deshabilitar:", error);
      return { 
        success: false, 
        message: error?.message || "Error al deshabilitar equipo" 
      };
    }
  },

  async eliminar(id: string): Promise<ApiResponse<Equipo>> {
    try {
      console.log(`Eliminando equipo ${id}`);
      const response = await apiFetch<ApiResponse<Equipo>>(`/equipos/${id}`, {
        method: "DELETE",
      });

      return response;
    } catch (error: any) {
      console.error("Error en EquiposService.eliminar:", error);
      return { 
        success: false, 
        message: error?.message || "Error al eliminar equipo" 
      };
    }
  },

  
};