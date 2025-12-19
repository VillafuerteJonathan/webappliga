"use client";

import { useEffect, useState } from "react";
import { ArbitrosService } from "@/services/arbitros.service";
import { Arbitro } from "@/types/arbitro";
import ArbitroForm from "@/components/albitros/AlbitroFrom";
import ArbitroTable from "@/components/albitros/AlbitroTable";

export default function ArbitrosPage() {
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);
  const [editing, setEditing] = useState<Arbitro | undefined>();
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const cargarArbitros = async () => {
    try {
      setLoading(true);
      const data = await ArbitrosService.listar();
      setArbitros(data);
    } catch (err) {
      console.error("Error al cargar árbitros:", err);
      setArbitros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarArbitros();
  }, []);

  const onSuccess = () => {
    setEditing(undefined);
    setIsFormOpen(false);
    cargarArbitros(); // 🔄 RECARGA REAL
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Gestión de Árbitros</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-[#00923F] text-white px-4 py-2 rounded-lg"
        >
          + Nuevo Árbitro
        </button>
      </div>

      <div className="flex gap-6">
        {isFormOpen && (
          <div className="w-1/3 bg-white p-4 rounded-lg">
            <ArbitroForm arbitro={editing} onSuccess={onSuccess} />
          </div>
        )}

        <div className={`${isFormOpen ? "w-2/3" : "w-full"} bg-white p-4 rounded-lg`}>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <ArbitroTable
              arbitros={arbitros.filter(a => !a.eliminado)}
              onEditar={(a) => {
                setEditing(a);
                setIsFormOpen(true);
              }}
              recargar={cargarArbitros}
            />
          )}
        </div>
      </div>
    </div>
  );
}
