"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Contenedor principal */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Contenido */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Sistema de Gestión de Actas Deportivas
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 mb-10">
            Plataforma digital para registrar, verificar y consultar actas
            deportivas con trazabilidad y seguridad garantizada mediante blockchain privada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/(auth)/login"
              className="rounded-full bg-[#004C97] hover:bg-[#00923F] text-white px-6 py-3 font-medium transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/(publico)/home"
              className="rounded-full border border-gray-300 px-6 py-3 font-medium hover:bg-gray-100 transition"
            >
              Ver torneos y resultados
            </Link>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
