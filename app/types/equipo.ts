export interface Equipo {
  id_equipo: string;
  nombre: string;
  descripcion: string;
  categoria_id: string;
  logo_url?: string | null;
  nombre_representante: string;
  celular_representante: string;
  estado: boolean;
  eliminado?: boolean;
  fecha_registro?: string;
  cancha_id?: string;
}