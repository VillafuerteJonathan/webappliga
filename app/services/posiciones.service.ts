// services/posiciones.service.ts
import { apiFetch } from "./api";

export interface Posicion {
  id_equipo: string;
  equipo: string;  // Cambiado de nombre_equipo a equipo
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  logo_url?: string;
}

export interface GrupoPosiciones {
  id_grupo: string;
  nombre: string;  // Cambiado de nombre_grupo a nombre
  tabla_posiciones: Posicion[];  // Cambiado de posiciones a tabla_posiciones
}

export interface CampeonatoPosiciones {
  id_campeonato: string;
  nombre: string;  // Cambiado de nombre_campeonato a nombre
  grupos: GrupoPosiciones[];
}

export const PosicionesService = {
  async listarCampeonatos(): Promise<CampeonatoPosiciones[]> {
    try {
      const response = await apiFetch<any>("/posiciones/campeonatos");
      console.log("📊 Respuesta API posiciones:", response);

      // Validar la estructura de respuesta
      if (!response) {
        console.warn("⚠️ Respuesta vacía de la API");
        return [];
      }

      // Si la respuesta tiene { success, data }
      if (response.success && Array.isArray(response.data)) {
        console.log("✅ Datos recibidos en response.data:", response.data.length, "campeonatos");
        return response.data;
      }

      // Si la respuesta es directamente el array
      if (Array.isArray(response)) {
        console.log("✅ Datos recibidos directamente como array:", response.length, "campeonatos");
        return response;
      }

      // Si la respuesta tiene otro formato
      console.warn("⚠️ Formato de respuesta no reconocido:", response);
      return [];

    } catch (error) {
      console.error("❌ Error en PosicionesService.listarCampeonatos:", error);
      throw error;
    }
  },
};