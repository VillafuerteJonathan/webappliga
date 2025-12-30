// services/categorias.service.ts
import { apiFetch } from "./api";
import { Categoria } from "@/types/categoria";

export const CategoriasService = {
  // =============================
  // LISTAR
  // =============================
  async listar(): Promise<Categoria[]> {
    try {
      const response = await apiFetch<any>("/categorias");

      console.log("Respuesta listar categorias:", response);

      // { success, data }
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }

      // { data: [] }
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // []
      if (Array.isArray(response)) {
        return response;
      }

      // Buscar array en cualquier propiedad
      if (response && typeof response === "object") {
        for (const key in response) {
          if (Array.isArray(response[key])) {
            return response[key];
          }
        }
      }

      console.warn("Respuesta de categorías no contiene array válido, devolviendo []");
      return [];
    } catch (error) {
      console.error("Error en CategoriasService.listar:", error);
      throw error;
    }
  },

  // =============================
  // CREAR
  // =============================
  async crear(data: Partial<Categoria>): Promise<Categoria> {
    try {
      const response = await apiFetch<any>("/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // { success, data }
      if (response && response.success && response.data) {
        return response.data;
      }

      // { data }
      if (response && response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error("Error en CategoriasService.crear:", error);
      throw error;
    }
  },

  // =============================
  // EDITAR
  // =============================
  async editar(id: string, data: Partial<Categoria>): Promise<Categoria> {
    try {
      const response = await apiFetch<any>(`/categorias/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // { success, data }
      if (response && response.success && response.data) {
        return response.data;
      }

      // { data }
      if (response && response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error("Error en CategoriasService.editar:", error);
      throw error;
    }
  },

  // =============================
  // HABILITAR
  // =============================
  async habilitar(id: string): Promise<Categoria> {
    try {
      const response = await apiFetch<any>(`/categorias/${id}/habilitar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response && response.success && response.data) {
        return response.data;
      }

      if (response && response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error("Error en CategoriasService.habilitar:", error);
      throw error;
    }
  },

  // =============================
  // DESHABILITAR
  // =============================
  async deshabilitar(id: string): Promise<Categoria> {
    try {
      const response = await apiFetch<any>(`/categorias/${id}/deshabilitar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response && response.success && response.data) {
        return response.data;
      }

      if (response && response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error("Error en CategoriasService.deshabilitar:", error);
      throw error;
    }
  },

  // =============================
  // ELIMINAR (SOFT DELETE)
  // =============================
  async eliminar(id: string): Promise<Categoria> {
    try {
      const response = await apiFetch<any>(`/categorias/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response && response.success && response.data) {
        return response.data;
      }

      if (response && response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error("Error en CategoriasService.eliminar:", error);
      throw error;
    }
  },
};
