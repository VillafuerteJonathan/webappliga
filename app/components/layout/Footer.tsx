"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@public/LogoLDP.jpg";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#004C97] via-[#0066CC] to-[#00923F] text-white mt-16 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F9C900] via-[#FFD700] to-[#F9C900]"></div>
      
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-[#F9C900]"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 rounded-full bg-white"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* 🏆 Columna 1: Identidad */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-4 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F9C900] rounded-full blur-md group-hover:blur-lg transition-all duration-300 opacity-30"></div>
                <Image
                  src={Logo}
                  alt="Logo Liga Deportiva Picaíhua"
                  width={60}
                  height={60}
                  className="relative rounded-full bg-white p-1.5 shadow-lg transform group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold leading-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Liga Deportiva Parroquial
                </h2>
                <p className="text-[#F9C900] font-bold tracking-wider text-lg">
                  Picaíhua
                </p>
              </div>
            </div>
            <p className="text-gray-200 leading-relaxed max-w-md text-sm lg:text-base">
              Promoviendo el <span className="text-[#F9C900] font-semibold">deporte</span>, 
              la <span className="text-[#F9C900] font-semibold">unidad</span> y la 
              sana <span className="text-[#F9C900] font-semibold">competencia</span> en 
              nuestra comunidad.
            </p>
          </div>

          {/* 📞 Columna 2: Contacto */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 text-[#F9C900] flex items-center gap-2">
              <span className="text-xl">📬</span>
              Información de Contacto
            </h3>
            <ul className="space-y-3">
              {[
                { icon: "📍", text: "Parroquia Picaíhua, Ambato - Ecuador" },
                { icon: "📧", text: "ligadepicaihua@gmail.com" },
                { icon: "☎️", text: "+593 98 430 3148" }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-200">
                  <span className="text-[#F9C900] text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                  <span className="text-gray-200 group-hover:text-white transition-colors">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 🌐 Columna 3: Redes sociales */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 text-[#F9C900] flex items-center gap-2">
              <span className="text-xl">🌐</span>
              Síguenos en Redes
            </h3>
            <div className="space-y-4">
              <a
                href="https://www.facebook.com/profile.php?id=100063995201386"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#1877F2] to-[#0F5EC9] hover:from-[#0F5EC9] hover:to-[#1877F2] transition-all duration-300 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#1877F2] font-bold text-sm">f</span>
                </div>
                <span>Facebook Oficial</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </a>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="bg-gradient-to-r from-[#F9C900] to-[#FFD700] text-[#004C97] px-4 py-2 rounded-full font-bold text-sm shadow-lg transform hover:scale-105 transition-all duration-300">
                  ✅ Más de 1,300 seguidores
                </div>
                <div className="flex space-x-3">
                  {['⚽', '🏀', '🎯', '🏆'].map((icon, index) => (
                    <div key={index} className="text-2xl opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300">
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔻 Línea inferior */}
        <div className="border-t border-white/20 mt-10 pt-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center">
            <span className="text-gray-300 text-sm">
              © {new Date().getFullYear()} Liga Deportiva Parroquial de Picaíhua
            </span>
            
            <div className="flex items-center gap-2 text-[#F9C900] font-semibold">
              <span className="animate-pulse">❤️</span>
              <span>Todos los derechos reservados</span>
            </div>
            
            <span className="text-gray-300 text-sm bg-white/10 px-3 py-1 rounded-full">
              Desarrollado con pasión para la comunidad
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}