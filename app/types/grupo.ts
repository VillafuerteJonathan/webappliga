// src/types/categoria.ts
export interface Grupo {
  id_grupo: string;
  nombre: string; 
  estado: boolean;
  eliminado: boolean;   
  fecha_registro?: string;
}
