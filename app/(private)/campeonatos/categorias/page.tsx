"use client";

import { useEffect, useState } from "react";
import { CategoriasService } from "@/services/categorias.service";
import { Categoria } from "@/types/categoria";
import CategoriaForm from "@/components/categorias/categoriaFrom";
import CategoriaTable from "@/components/categorias/categoriaTable";
export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editing, setEditing] = useState<Categoria | undefined>();
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // =============================
  // CARGAR CATEGORÍAS
  // =============================
  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await CategoriasService.listar();
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // =============================
  // CALLBACK DE ÉXITO
  // =============================
  const onSuccess = () => {
    setEditing(undefined);
    setIsFormOpen(false);
    cargarCategorias(); // 🔄 RECARGA REAL
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Gestión de Categorías</h1>

        <button
          onClick={() => {
            setEditing(undefined);
            setIsFormOpen(true);
          }}
          className="bg-[#00923F] text-white px-4 py-2 rounded-lg"
        >
          + Nueva Categoría
        </button>
      </div>

      <div className="flex gap-6">
        {/* FORMULARIO */}
        {isFormOpen && (
          <div className="w-1/3 bg-white p-4 rounded-lg">
            <CategoriaForm categoria={editing} onSuccess={onSuccess} />
          </div>
        )}

        {/* TABLA */}
        <div
          className={`${
            isFormOpen ? "w-2/3" : "w-full"
          } bg-white p-4 rounded-lg`}
        >
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <CategoriaTable
              categorias={categorias.filter(c => !c.eliminado)}
              onEditar={(c) => {
                setEditing(c);
                setIsFormOpen(true);
              }}
              recargar={cargarCategorias}
            />
          )}
        </div>
      </div>
    </div>
  );
}
