"use client";

import { useEffect, useState } from "react";
import { GruposService } from "@/services/grupos.service";
import { Grupo } from "@/types/grupo";
import GrupoForm from "@/components/grupos/grupoForm";
import GrupoTable from "@/components/grupos/grupoTable";

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [editing, setEditing] = useState<Grupo | undefined>();
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // =============================
  // CARGAR GRUPOS
  // =============================
  const cargarGrupos = async () => {
    try {
      setLoading(true);
      const data = await GruposService.listar();
      setGrupos(data);
    } catch (err) {
      console.error("Error al cargar grupos:", err);
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGrupos();
  }, []);

  // =============================
  // CALLBACK DE ÉXITO
  // =============================
  const onSuccess = () => {
    setEditing(undefined);
    setIsFormOpen(false);
    cargarGrupos(); // 🔄 RECARGA REAL
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Gestión de Grupos</h1>

        <button
          onClick={() => {
            setEditing(undefined);
            setIsFormOpen(true);
          }}
          className="bg-[#00923F] text-white px-4 py-2 rounded-lg"
        >
          + Nuevo Grupo
        </button>
      </div>

      <div className="flex gap-6">
        {/* FORMULARIO */}
        {isFormOpen && (
          <div className="w-1/3 bg-white p-4 rounded-lg">
            <GrupoForm grupo={editing} onSuccess={onSuccess} />
          </div>
        )}

        {/* TABLA */}
        <div className={`${isFormOpen ? "w-2/3" : "w-full"} bg-white p-4 rounded-lg`}>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <GrupoTable
              grupos={grupos}
              onEditar={(g) => {
                setEditing(g);
                setIsFormOpen(true);
              }}
              recargar={cargarGrupos}
            />
          )}
        </div>
      </div>
    </div>
  );
}
