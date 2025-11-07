"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode"; // ✅ import default

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DecodedToken {
  name: string;
  email: string;
  role: string;
  exp: number;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [role, setRole] = useState<string>("publico");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token); // ✅ aquí usamos jwtDecode
        setRole(decoded.role);
      } catch (err) {
        console.error("Token inválido");
        setRole("publico");
      }
    } else {
      setRole("publico");
    }

    const handleStorageChange = () => {
      const t = localStorage.getItem("token");
      if (t) {
        try {
          const decoded: DecodedToken = jwtDecode(t);
          setRole(decoded.role);
        } catch {
          setRole("publico");
        }
      } else {
        setRole("publico");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const navItem = (href: string, label: string) => (
    <Link
      href={href}
      onClick={onClose}
      className={`block px-6 py-2 rounded-md text-sm font-medium transition-colors ${
        pathname === href
          ? "bg-[#004C97] text-white"
          : "text-gray-700 hover:bg-blue-50"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-md flex flex-col transition-all duration-300 ease-in-out z-40 ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      }`}
    >
      <div className="px-6 py-4 bg-gradient-to-r from-[#004C97] to-[#00923F] text-white font-bold text-lg shadow">
        Panel LDP
      </div>

      <nav className="flex-1 overflow-y-auto mt-4 space-y-1">
        {role === "admin" && (
          <>
            {navItem("/dashboard", "Dashboard")}
            {/* Gestión */}
            <div>
              <button
                onClick={() => toggleSection("gestion")}
                className="w-full flex items-center justify-between px-6 py-2 text-gray-700 hover:bg-blue-50 font-semibold text-sm"
              >
                <span>Gestión</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    openSection === "gestion" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "gestion" && (
                <div className="ml-6 border-l border-gray-200 pl-4 space-y-1">
                  {navItem("/gestion/canchas", "Canchas")}
                  {navItem("/(privado)/gestion/arbitros", "Árbitros")}
                  {navItem("/(privado)/gestion/equipos", "Equipos")}
                </div>
              )}
            </div>
            {/* Campeonatos */}
            <div>
              <button
                onClick={() => toggleSection("campeonatos")}
                className="w-full flex items-center justify-between px-6 py-2 text-gray-700 hover:bg-blue-50 font-semibold text-sm"
              >
                <span>Campeonatos</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    openSection === "campeonatos" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "campeonatos" && (
                <div className="ml-6 border-l border-gray-200 pl-4 space-y-1">
                  {navItem("/(privado)/campeonatos/categorias", "Categorías")}
                  {navItem("/(privado)/campeonatos/grupos", "Grupos")}
                  {navItem("/(privado)/campeonatos/lista", "Campeonatos")}
                </div>
              )}
            </div>
            {/* Usuarios */}
            <div>
              <button
                onClick={() => toggleSection("usuarios")}
                className="w-full flex items-center justify-between px-6 py-2 text-gray-700 hover:bg-blue-50 font-semibold text-sm"
              >
                <span>Usuarios</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    openSection === "usuarios" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "usuarios" && (
                <div className="ml-6 border-l border-gray-200 pl-4 space-y-1">
                  {navItem("/(privado)/usuarios/delegados", "Delegados")}
                  {navItem("/(privado)/usuarios/vocales", "Vocales")}
                </div>
              )}
            </div>
            {/* Actas */}
            <div>
              <button
                onClick={() => toggleSection("actas")}
                className="w-full flex items-center justify-between px-6 py-2 text-gray-700 hover:bg-blue-50 font-semibold text-sm"
              >
                <span>Actas</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    openSection === "actas" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSection === "actas" && (
                <div className="ml-6 border-l border-gray-200 pl-4 space-y-1">
                  {navItem("/(privado)/actas/verificar", "Verificación")}
                  {navItem("/(privado)/actas/consultar", "Consulta")}
                </div>
              )}
            </div>
          </>
        )}

        {role === "delegado" && (
          <div>
            <button
              onClick={() => toggleSection("actas")}
              className="w-full flex items-center justify-between px-6 py-2 text-gray-700 hover:bg-blue-50 font-semibold text-sm"
            >
              <span>Actas</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  openSection === "actas" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "actas" && (
              <div className="ml-6 border-l border-gray-200 pl-4 space-y-1">
                {navItem("/(privado)/actas/verificar", "Verificación")}
                {navItem("/(privado)/actas/consultar", "Consulta")}
              </div>
            )}
          </div>
        )}

        {role === "publico" && (
          <>
            {navItem("/(publico)/home", "Inicio")}
            {navItem("/(publico)/tabla-posiciones", "Tabla de posiciones")}
            {navItem("/(publico)/partidos-recientes", "Últimos partidos")}
          </>
        )}
      </nav>

      <div className="p-4 text-xs text-gray-400 border-t text-center">
        © {new Date().getFullYear()} Liga Deportiva Picaíhua
      </div>
    </aside>
  );
}
