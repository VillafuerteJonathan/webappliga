/// services/validador.service.ts
import { apiFetch } from "./api";
import { Campeonato, Partido, ActaArchivo } from "@/types/validador";

export const ValidadorService = {
    
  // =============================
  // OBTENER CAMPEONATOS CON ACTAS PENDIENTES
  // =============================
  async obtenerCampeonatosPendientes(): Promise<Campeonato[]> {
    try {
      const response = await apiFetch<any>("/verificacion/campeonatos");

      if (response?.success && Array.isArray(response.data)) {
        return response.data;
      }

      if (Array.isArray(response)) {
        return response;
      }

      console.warn("⚠️ No se encontraron campeonatos pendientes");
      return [];
    } catch (error: any) {
      const status = error?.response?.status;

      console.error(
        "❌ Error en ValidadorService.obtenerCampeonatosPendientes:",
        error
      );

      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw error;
    }
  },

  // =============================
  // OBTENER PARTIDOS PENDIENTES POR CAMPEONATO
  // =============================
  async obtenerPartidosPendientes(idCampeonato: string): Promise<Partido[]> {
    try {
      const response = await apiFetch<any>(
        `/verificacion/campeonatos/${idCampeonato}/actas`
      );

      if (response?.success && Array.isArray(response.data)) {
        return response.data;
      }

      if (Array.isArray(response)) {
        return response;
      }

      console.warn("⚠️ No se encontraron partidos pendientes");
      return [];
    } catch (error: any) {
      const status = error?.response?.status;

      console.error(
        "❌ Error en ValidadorService.obtenerPartidosPendientes:",
        error
      );

      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw error;
    }
  },

  // =============================
  // REVISAR ACTA (APROBAR / VALIDAR) - CORREGIDO PARA ERROR 500
  // =============================
  async revisarActa(idPartido: string, comentarios?: string) {
  try {
    const body: { comentario?: string } = {};

    if (comentarios?.trim()) {
      body.comentario = comentarios.trim();
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return {
        ok: false,
        type: "session_error",
        message: "Sesión no válida",
      };
    }

    const response = await apiFetch<any>(
      `/verificacion/actas/${idPartido}/revisar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    // 🚨 IMPORTANTE: validar success del backend
    if (response?.success === false) {
      return {
        ok: false,
        type: response.errorType || "server_error",
        message: response.message,
        details: response.details || null,
      };
    }

    // ✅ ÉXITO REAL
    return {
      ok: true,
      data: response,
    };

  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;

    console.error("❌ Error revisarActa:", {
      status,
      data,
      error,
    });

    // 🔐 Sesión expirada
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";

      return {
        ok: false,
        type: "session_error",
        message: "Sesión expirada. Inicia sesión nuevamente.",
      };
    }

    // ⚠️ Error controlado del backend
    if (data?.errorType) {
      return {
        ok: false,
        type: data.errorType,
        message: data.message,
        details: data.details || null,
      };
    }

    // 🚨 Error inesperado
    return {
      ok: false,
      type: "server_error",
      message:
        data?.message ||
        error?.message ||
        "Error interno del servidor. Intente nuevamente.",
    };
  }
}
,

  // =============================
  // VERIFICAR REGISTRO EN BLOCKCHAIN
  // =============================
  verificarActaBlockchain(
    partido: Partido
  ): { valida: boolean; mensaje: string } {
    if (!partido.hash_acta) {
      return {
        valida: false,
        mensaje: "No registrado en blockchain",
      };
    }

    return {
      valida: true,
      mensaje: `Validado en blockchain (Hash: ${partido.hash_acta.substring(
        0,
        12
      )}...)`,
    };
  },

  // =============================
  // UTILIDADES
  // =============================
  formatearFecha(fecha: string): string {
    if (!fecha) return "No definida";

    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  },

  formatearFechaCompleta(fecha: string): string {
    if (!fecha) return "No definida";

    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  },

  tieneActasDisponibles(partido: Partido): boolean {
    return Array.isArray(partido.actas) && partido.actas.length > 0;
  },

  obtenerActaPorTipo(
    partido: Partido,
    tipo: "frente" | "dorso"
  ): ActaArchivo | undefined {
    if (!partido.actas) return undefined;

    return partido.actas.find(
      (acta) =>
        acta.tipo === tipo ||
        (acta.ruta &&
          (acta.ruta.includes(tipo) || acta.ruta.endsWith(`${tipo}.jpg`)))
    );
  },

  construirUrlArchivo(ruta: string): string {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    if (!ruta) return "";

    if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
      return ruta;
    }

    if (ruta.startsWith("/uploads/")) {
      return `${API_URL}${ruta}`;
    }

    if (ruta.startsWith("uploads/")) {
      return `${API_URL}/${ruta}`;
    }

    return `${API_URL}/uploads/${ruta}`;
  },

  obtenerNombreArbitro(partido: Partido): string {
    if (partido.nombre_arbitro && partido.apellido_arbitro) {
      return `${partido.nombre_arbitro} ${partido.apellido_arbitro}`;
    }
    return partido.nombre_arbitro || "No asignado";
  },

  obtenerNombreVocal(partido: Partido): string {
    if (partido.nombre_vocal && partido.apellido_vocal) {
      return `${partido.nombre_vocal} ${partido.apellido_vocal}`;
    }
    return partido.nombre_vocal || "No asignado";
  },

  // =============================
  // VALIDACIÓN FINAL PARA APROBACIÓN
  // =============================
  puedeAprobar(partido: Partido): { puede: boolean; razon?: string } {
    if (!partido.hash_acta) {
      return {
        puede: false,
        razon: "El acta no está registrada en blockchain",
      };
    }

    if (!this.tieneActasDisponibles(partido)) {
      return {
        puede: false,
        razon: "No existen archivos de acta",
      };
    }

    return { puede: true };
  },
};
