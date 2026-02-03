// types/validadorts - Actualizar interfaz Partido
export interface Partido {
  id_partido: string;
  fecha_encuentro: string;
  hora_encuentro: string;
  goles_local: number;
  goles_visitante: number;
  equipo_local: string;
  logo_local: string;
  equipo_visitante: string;
  logo_visitante: string;
  cancha: string;
  actas: ActaArchivo[];
  // Campos de blockchain
  arbitro_id: string;
  nombre_arbitro?: string;    // NUEVO
  apellido_arbitro?: string;  // NUEVO (opcional)
  vocal_id: string;
  nombre_vocal?: string;      // NUEVO
  apellido_vocal?: string;    // NUEVO (opcional)
  hash_acta: string;
  fecha_subida_blockchain: string;
}
export interface ActaArchivo {
  tipo: string;
  ruta: string;
  hash: string;
}


export interface Campeonato {
  id_campeonato: string;
  nombre: string;
  cantidad_pendientes?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface RevisarActaRequest {
  comentario?: string;
}
