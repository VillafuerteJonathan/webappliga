// services/canchas.service.ts
import { apiFetch } from "./api";
import { Cancha } from "@/types/cancha";

export const CanchasService = {
  async listar(): Promise<Cancha[]> {
    try {
      const response = await apiFetch<any>("/canchas");
      
      // Debug: Ver la estructura de la respuesta
      console.log("Respuesta listar:", response);
      
      // Si la respuesta tiene estructura { success, data }
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si la respuesta tiene estructura { data: array } sin success
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si ya devuelve array directamente
      if (Array.isArray(response)) {
        return response;
      }
      
      // Si es un objeto que contiene un array
      if (response && typeof response === 'object') {
        // Buscar cualquier propiedad que sea array
        for (const key in response) {
          if (Array.isArray(response[key])) {
            return response[key];
          }
        }
      }
      
      console.warn("Respuesta no contiene array válido, devolviendo []");
      return [];
      
    } catch (error) {
      console.error("Error en CanchasService.listar:", error);
      throw error;
    }
  },

  async crear(data: Partial<Cancha>): Promise<Cancha> {
    try {
      const response = await apiFetch<any>("/canchas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      
      // Verificar diferentes estructuras de respuesta
      if (response && response.data) {
        return response.data;
      }
      if (response && response.success && response.data) {
        return response.data;
      }
      
      return response;
      
    } catch (error) {
      console.error("Error en CanchasService.crear:", error);
      throw error;
    }
  },

  async editar(id: string, data: Partial<Cancha>): Promise<Cancha> {
    try {
      const response = await apiFetch<any>(`/canchas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      
      // Verificar diferentes estructuras de respuesta
      if (response && response.data) {
        return response.data;
      }
      if (response && response.success && response.data) {
        return response.data;
      }
      
      return response;
      
    } catch (error) {
      console.error("Error en CanchasService.editar:", error);
      throw error;
    }
  },

  async habilitar(id: string): Promise<Cancha> {
    try {
      const response = await apiFetch<any>(`/canchas/${id}/habilitar`, { 
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      // Verificar diferentes estructuras de respuesta
      if (response && response.data) {
        return response.data;
      }
      if (response && response.success && response.data) {
        return response.data;
      }
      
      return response;
      
    } catch (error) {
      console.error("Error en CanchasService.habilitar:", error);
      throw error;
    }
  },

  async deshabilitar(id: string): Promise<Cancha> {
    try {
      const response = await apiFetch<any>(`/canchas/${id}/deshabilitar`, { 
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      // Verificar diferentes estructuras de respuesta
      if (response && response.data) {
        return response.data;
      }
      if (response && response.success && response.data) {
        return response.data;
      }
      
      return response;
      
    } catch (error) {
      console.error("Error en CanchasService.deshabilitar:", error);
      throw error;
    }
  },

  async eliminar(id: string): Promise<Cancha> {
    try {
      const response = await apiFetch<any>(`/canchas/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      // Verificar diferentes estructuras de respuesta
      if (response && response.data) {
        return response.data;
      }
      if (response && response.success && response.data) {
        return response.data;
      }
      
      return response;
      
    } catch (error) {
      console.error("Error en CanchasService.eliminar:", error);
      throw error;
    }
  },

};