"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Header general */}
      <Header />

      {/* Contenido principal */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Sistema de Gestión de Actas Deportivas
        </h1>

        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400 mb-10">
          Plataforma digital para registrar, verificar y consultar actas deportivas
          con trazabilidad y seguridad garantizada en blockchain privada.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/(auth)/login"
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition-colors"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/(publico)/home"
            className="rounded-full border border-zinc-400 dark:border-zinc-600 px-6 py-3 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Ver torneos y resultados
          </Link>
        </div>
      </main>

      {/* Footer general */}
      <Footer />
    </div>
  );
}
