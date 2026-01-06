import { Grupo } from "./grupo";
import { Equipo } from "./equipo";

// ==============================
// Modelo principal de Campeonato
// ==============================
export interface Campeonato {
  id_campeonato: string;
  nombre: string;
  descripcion?: string | null;
  fecha_inicio?: string;       // Fecha de inicio (ISO string) opcional
  fecha_fin?: string;          // Fecha de fin (ISO string) opcional
  estado: boolean;
  eliminado: boolean;
  fecha_registro?: string;
  fecha_actualizacion?: string;
  fecha_eliminacion?: string | null;
  grupos: GrupoConEquipos[];
}


// ==============================
// Grupo con sus equipos
// ==============================
export interface GrupoConEquipos extends Grupo {
  equipos: Equipo[];
}

// ==============================
// DTO para crear un campeonato
// ==============================
export interface CrearCampeonatoDTO {
  nombre: string;
  descripcion?: string | null;
  fecha_inicio?: string;
  fecha_fin?: string;
  grupos: {
    id_grupo?: string;         // opcional si es un grupo nuevo
    nombre: string;
    estado?: boolean;
    equiposIds?: string[];
  }[];
}

// ==============================
// DTO para actualizar un campeonato
// ==============================
export interface ActualizarCampeonatoDTO {
  nombre?: string;
  descripcion?: string | null;
  fecha_inicio?: string;
  fecha_fin?: string;
  grupos?: {
    id_grupo: string;          // obligatorio para actualizar un grupo existente
    nombre?: string;
    estado?: boolean;
    equiposIds?: string[];
  }[];
}
