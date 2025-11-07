"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false); // 👈 controla el menú hamburguesa

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItem = (href: string, label: string) => (
    <Link
      href={href}
      className={`block px-6 py-2 rounded-md text-sm transition font-medium ${
        pathname === href
          ? "bg-[#004C97] text-white"
          : "text-gray-700 hover:bg-blue-50"
      }`}
      onClick={() => setIsOpen(false)} // 👈 cierra menú al hacer clic
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* Botón Hamburguesa (solo móvil) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#004C97] text-white p-2 rounded-md shadow-md focus:outline-none"
        aria-label="Abrir menú"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-md flex flex-col transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`} // 👈 visible por defecto en escritorio
      >
        {/* Encabezado */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#004C97] to-[#00923F] text-white font-bold text-lg shadow flex items-center justify-between">
          <span>Panel LDP</span>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto mt-4 space-y-1">
          {navItem("/dashboard", "Dashboard")}

          {/* Administración */}
          <div>
            <button
              onClick={() => toggleSection("admin")}
              className="w-full flex items-center justify-between px-6 py-2 text-gray-700 hover:bg-blue-50 font-semibold text-sm"
            >
              <span>Administración</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  openSection === "admin" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "admin" && (
              <div className="ml-6 border-l border-gray-200 pl-4 space-y-1">
                {navItem("/(privado)/canchas", "Canchas")}
                {navItem("/(privado)/arbitros", "Árbitros")}
                {navItem("/(privado)/equipos", "Equipos")}
              </div>
            )}
          </div>

          {/* Campeonato */}
          <div>
            <button
              onClick={() => toggleSection("campeonato")}
              className="w-full flex items-center justify-between px-6 py-2 text-gray-700 hover:bg-blue-50 font-semibold text-sm"
            >
              <span>Campeonato</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  openSection === "campeonato" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openSection === "campeonato" && (
              <div className="ml-6 border-l border-gray-200 pl-4 space-y-1">
                {navItem("/(privado)/campeonato", "Campeonato")}
                {navItem("/(privado)/categoria", "Categoría")}
                {navItem("/(privado)/grupos", "Grupos")}
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
                {navItem("/(privado)/vocales", "Vocales")}
                {navItem("/(privado)/delegados", "Delegados")}
              </div>
            )}
          </div>
        </nav>

        {/* Pie */}
        <div className="p-4 text-xs text-gray-400 border-t">
          © {new Date().getFullYear()} Liga Deportiva Picaíhua
        </div>
      </aside>

      {/* Fondo oscuro cuando el menú está abierto en móvil */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}
    </>
  );
}
