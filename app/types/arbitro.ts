// types/arbitro.ts
export interface Arbitro {
  id_arbitro: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  estado: boolean;
  fecha_registro: string;
  eliminado: boolean;
  fecha_eliminacion?: string | null;
}
