// app/campeonatos/page.tsx
"use client";

import { useState } from "react";
import CampeonatoTable from "@/components/campeonatos/CampeonatoTable";
import CampeonatoForm from "@/components/campeonatos/CampeonatoForm";
import { Campeonato } from "@/types/campeonato";
import { Trophy, ArrowLeft, Plus } from "lucide-react";

export default function CampeonatosPage() {
  const [showForm, setShowForm] = useState(false);
  const [campeonatoEditando, setCampeonatoEditando] = useState<Campeonato | null>(null);

  const handleEditar = (id: string) => {
    // Para editar, redirigimos a la página de edición
    window.location.href = `/campeonatos/${id}/editar`;
  };

  const handleCrear = () => {
    setCampeonatoEditando(null);
    setShowForm(true);
  };

  const handleVerDetalles = (campeonato: Campeonato) => {
    setCampeonatoEditando(campeonato);
    // Aquí podrías abrir un modal o redirigir a una página de detalles
    console.log("Ver detalles:", campeonato);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setCampeonatoEditando(null);
    // Recargar la página o actualizar la tabla
    window.location.reload();
  };

  const handleCancel = () => {
    setShowForm(false);
    setCampeonatoEditando(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {showForm ? (
          <div>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a la lista
            </button>
            
            <CampeonatoForm
              campeonato={campeonatoEditando || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Trophy className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Campeonatos</h1>
                    <p className="text-gray-600 mt-1">
                      Gestiona todos los torneos y competencias deportivas
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                  Nuevo Campeonato
                </button>
              </div>
            </div>

            <CampeonatoTable />
          </>
        )}
      </div>
    </div>
  );
}