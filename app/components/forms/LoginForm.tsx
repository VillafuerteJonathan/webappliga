"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await res.json();
      
      // Guardar todos los datos en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("role", data.role); // ← Aquí guardamos el rol
      localStorage.setItem("userId", data.userId); // ← También es útil guardar el ID

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-[#004C97] via-[#3FA9F5] to-[#00923F] p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-white/80 text-sm">
              Accede a tu cuenta de la Liga Deportiva
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Campo Email */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#004C97]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Correo electrónico
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3FA9F5] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="tu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Campo Contraseña */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#004C97]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Contraseña
                </span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3FA9F5] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#004C97] to-[#00923F] hover:from-[#3FA9F5] hover:to-[#57B947] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Ingresar</span>
                </>
              )}
            </button>

            {/* Enlace de recuperación */}
            <div className="mt-6 text-center">
              <a 
                href="#" 
                className="text-sm text-[#004C97] hover:text-[#00923F] font-medium transition-colors duration-200 inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>

        {/* Footer informativo */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            ¿Necesitas ayuda?{" "}
            <a href="mailto:ligadepicaihua@gmail.com" className="text-[#004C97] hover:text-[#00923F] font-semibold transition-colors">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}