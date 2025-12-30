// src/types/categoria.ts
export interface Categoria {
  id_categoria: string;
  nombre: string;
  edad_minima?: number | null;
  edad_maxima?: number | null;
  descripcion?: string | null;
  estado: boolean;
  eliminado: boolean;
  fecha_registro?: string;
}
