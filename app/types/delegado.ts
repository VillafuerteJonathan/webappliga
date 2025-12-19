// types/delegado.ts

export interface Delegado {
  id_usuario: string;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  telefono?: string | null;
  rol: 'delegado';
  estado: boolean;
  eliminado: boolean;
  fecha_registro: string; // timestamp en formato ISO
}
