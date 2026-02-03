"use client";
import React, { useState } from "react";
import { Partido } from "@/types/validador";
import { ValidadorService } from "@/services/validador.service";

export type RevisarActaResult = {
  ok: boolean;
  type?: 
    | "data_integrity"
    | "already_reviewed"
    | "not_found"
    | "session_error"
    | "server_error"
    | "generic";
  message?: string;
};

interface Props {
  partido: Partido;
  onVerificarActa: (
    idPartido: string,
    comentarios: string
  ) => Promise<RevisarActaResult>;
  onVolver: () => void;
}

const DetalleActa: React.FC<Props> = ({ 
  partido, 
  onVerificarActa, 
  onVolver 
}) => {
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetalles, setErrorDetalles] = useState<string>("");
  const [esErrorIntegridad, setEsErrorIntegridad] = useState(false);
  
  const actaFrente = ValidadorService.obtenerActaPorTipo(partido, 'frente');
  const actaDorso = ValidadorService.obtenerActaPorTipo(partido, 'dorso');
  const tieneActas = ValidadorService.tieneActasDisponibles(partido);
  
  const estadoBlockchain = ValidadorService.verificarActaBlockchain(partido);
  const puedeAprobar = ValidadorService.puedeAprobar(partido);

  const handleVerificar = async () => {
    if (!puedeAprobar.puede) {
      setError(puedeAprobar.razon || "No se puede aprobar el acta");
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setEsErrorIntegridad(false);

    try {
      const result = await ValidadorService.revisarActa(
        partido.id_partido,
        comentarios
      );

      // ✅ ÉXITO
      if (result.ok) {
        setComentarios("");
        setShowSuccessModal(true);
        return;
      }

      // 🚨 ERROR DE INTEGRIDAD BLOCKCHAIN
      if (result.type === "data_integrity") {
        setEsErrorIntegridad(true);
        setErrorDetalles(
          result.message || "Error de integridad del acta en blockchain"
        );
        setShowErrorModal(true);
        return;
      }

      // ⚠️ YA REVISADA
      if (result.type === "already_reviewed") {
        setError(result.message || "El acta ya fue revisada");
        return;
      }

      // ⚠️ NO ENCONTRADA
      if (result.type === "not_found") {
        setError(result.message || "No se encontró el acta");
        return;
      }

      // ❌ ERROR GENÉRICO
      setError(result.message || "Error al verificar el acta");

    } catch (e) {
      console.error("❌ Error inesperado:", e);
      setError("Error inesperado al verificar el acta");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    onVolver();
  };

  const handleErrorConfirm = () => {
    setShowErrorModal(false);
    setErrorDetalles("");
    setEsErrorIntegridad(false);
    onVolver(); // ✅ Añadido: regresar al listado
  };

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) return "No definida";
    return ValidadorService.formatearFecha(fecha);
  };

  const formatFechaCompleta = (fecha: string | undefined) => {
    if (!fecha) return "No definida";
    return ValidadorService.formatearFechaCompleta(fecha);
  };

  const getImagenUrl = (ruta: string | undefined) => {
    if (!ruta) return "";
    return ValidadorService.construirUrlArchivo(ruta);
  };

  const handleVerDocumento = (ruta: string | undefined) => {
    if (!ruta) return;
    
    const url = getImagenUrl(ruta);
    window.open(url, '_blank');
  };

  const handleDescargarDocumento = async (
  ruta: string | undefined,
  tipo: string
) => {
  if (!ruta) return;

  try {
    const url = getImagenUrl(ruta);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("No se pudo descargar el archivo");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `acta-${tipo}-${partido.equipo_local}-vs-${partido.equipo_visitante}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 🧹 Limpieza de memoria
    window.URL.revokeObjectURL(blobUrl);

  } catch (error) {
    console.error("❌ Error al descargar acta:", error);
    alert("No se pudo descargar la imagen del acta");
  }
};


  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.src = "https://via.placeholder.com/600x400/6B7280/FFFFFF?text=Imagen+no+disponible";
    target.onerror = null;
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ✅ Acta Verificada con Éxito
              </h3>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  El acta del partido ha sido <strong>validada y verificada</strong> exitosamente.
                </p>
                <p className="text-gray-600 mb-2">
                  Se ha confirmado que el acta es <strong>auténtica y coincide exactamente</strong> con la subida por el vocal.
                </p>
                <p className="text-gray-600">
                  La información ha sido registrada en el sistema y está disponible para consulta.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-medium">Hash confirmado: {partido.hash_acta?.substring(0, 16)}...</span>
                </div>
              </div>
              
              <button
                onClick={handleSuccessConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                autoFocus
              >
                Aceptar y regresar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error de integridad - MODIFICADO */}
      {showErrorModal && esErrorIntegridad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-red-700 mb-3">
                🚨 VERIFICACIÓN RECHAZADA - DATOS ALTERADOS
              </h3>
              
              <div className="mb-6 text-left">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-4">
                  <h4 className="font-bold text-red-800 mb-2">🔍 INCONSISTENCIA DETECTADA</h4>
                  <p className="text-red-700 whitespace-pre-line text-sm">
                    {errorDetalles}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ¿Qué pasó?
                    </h5>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                        <span>Los datos actuales NO coinciden con blockchain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                        <span>No son los mismos registrados por el vocal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                        <span>Posible alteración después del registro</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Acción requerida
                    </h5>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        <span>Contactar al administrador</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        <span>Verificar acta física original</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        <span>Reportar esta inconsistencia</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 mb-1">📋 Información del partido afectado:</h5>
                  <div className="text-sm text-gray-600">
                    <p><strong>Partido:</strong> {partido.equipo_local} vs {partido.equipo_visitante}</p>
                    <p><strong>Fecha:</strong> {formatFecha(partido.fecha_encuentro)} {partido.hora_encuentro}</p>
                    <p><strong>Hash blockchain:</strong> {partido.hash_acta?.substring(0, 24)}...</p>
                  </div>
                </div>
              </div>
              
              {/* ✅ UN SOLO BOTÓN MODIFICADO */}
              <button
                onClick={handleErrorConfirm}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                autoFocus
              >
                Entendido y regresar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error general - MODIFICADO */}
      {showErrorModal && !esErrorIntegridad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error en la Verificación
              </h3>
              
              <div className="mb-6">
                <p className="text-gray-600 whitespace-pre-line">{errorDetalles}</p>
              </div>
              
              {/* ✅ UN SOLO BOTÓN MODIFICADO */}
              <button
                onClick={handleErrorConfirm}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                autoFocus
              >
                Entendido y regresar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onVolver}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a partidos
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            📋 Validación de Acta del Partido
          </h1>
          
          <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <div className="font-bold text-lg text-gray-800">{partido.equipo_local}</div>
                  <div className="text-2xl font-bold bg-gray-800 text-white px-3 py-1 rounded">
                    {partido.goles_local ?? 0} - {partido.goles_visitante ?? 0}
                  </div>
                  <div className="font-bold text-lg text-gray-800">{partido.equipo_visitante}</div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatFecha(partido.fecha_encuentro)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {partido.hora_encuentro}
                  </span>
                  {partido.cancha && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {partido.cancha}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pendiente de validación
                </span>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  estadoBlockchain.valida 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {estadoBlockchain.valida ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Registrado en BC
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      No registrado en BC
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - MODIFICADO: Eliminado el grid de 2 columnas */}
      <div className="space-y-6">
        {/* Información de blockchain */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Información Blockchain
          </h2>
          
          <div className="space-y-4">
            {partido.hash_acta ? (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">🔗 Hash del Acta</p>
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded border border-gray-200 break-all">
                    {partido.hash_acta}
                  </div>
                </div>
                
                {partido.fecha_subida_blockchain && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">📅 Fecha de Registro</p>
                    <p className="font-medium">{formatFechaCompleta(partido.fecha_subida_blockchain)}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">👨‍⚖️ Árbitro</p>
                    <p className="font-medium">
                      {ValidadorService.obtenerNombreArbitro(partido)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">📝 Vocal</p>
                    <p className="font-medium">
                      {ValidadorService.obtenerNombreVocal(partido)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-100">
                <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-yellow-700 font-medium">Acta no registrada en blockchain</p>
                <p className="text-yellow-600 text-sm mt-2">
                  El acta debe estar registrada en blockchain antes de poder aprobarla
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Previsualización de Actas - MODIFICADO: Sección unificada */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Previsualización del Acta
          </h2>
          
          {!tieneActas ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 font-medium">No hay imágenes disponibles</p>
              <p className="text-gray-400 text-sm mt-1">El acta no ha sido cargada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Acta Frente */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-700 font-bold">F</span>
                    </div>
                    Acta - Frente
                  </h3>
                  {actaFrente?.hash && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                      Hash: {actaFrente.hash.substring(0, 8)}...
                    </span>
                  )}
                </div>
                
                {actaFrente ? (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={getImagenUrl(actaFrente.ruta)}
                        alt="Acta del partido - Frente"
                        className="w-full h-auto max-h-[350px] object-contain"
                        onError={handleImageError}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerDocumento(actaFrente.ruta)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver en tamaño completo
                      </button>
                      <button
                        onClick={() => handleDescargarDocumento(actaFrente.ruta, 'frente')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">Acta frente no disponible</p>
                  </div>
                )}
              </div>

              {/* Acta Dorso */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-700 font-bold">D</span>
                    </div>
                    Acta - Dorso
                  </h3>
                  {actaDorso?.hash && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">
                      Hash: {actaDorso.hash.substring(0, 8)}...
                    </span>
                  )}
                </div>
                
                {actaDorso ? (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={getImagenUrl(actaDorso.ruta)}
                        alt="Acta del partido - Dorso"
                        className="w-full h-auto max-h-[350px] object-contain"
                        onError={handleImageError}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerDocumento(actaDorso.ruta)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver en tamaño completo
                      </button>
                      <button
                        onClick={() => handleDescargarDocumento(actaDorso.ruta, 'dorso')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">Acta dorso no disponible</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Aprobar acta */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Aprobar Acta del Partido
          </h2>
          
          {/* Error normal (no de integridad) */}
          {error && !error.includes("Datos Alterados") && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-red-600 font-medium mb-1">Error de Verificación</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios (opcional)
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Escribe aquí cualquier observación sobre la validación..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={loading || !puedeAprobar.puede}
            />
            <p className="text-xs text-gray-500 mt-1">
              Estas observaciones quedarán registradas en el historial de revisión.
            </p>
          </div>
          
          {/* Validación de requisitos */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              {partido.hash_acta ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={`text-sm ${partido.hash_acta ? 'text-green-700' : 'text-red-700'}`}>
                Acta registrada en blockchain
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {tieneActas ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={`text-sm ${tieneActas ? 'text-green-700' : 'text-red-700'}`}>
                Archivos de acta disponibles
              </span>
            </div>
          </div>
          
          <button
            onClick={handleVerificar}
            disabled={loading || !puedeAprobar.puede}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando validación...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                APROBAR Y VALIDAR ACTA
              </>
            )}
          </button>
          
          {!puedeAprobar.puede && puedeAprobar.razon && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                ⚠️ {puedeAprobar.razon}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleActa;