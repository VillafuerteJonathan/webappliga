"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@public/LogoLDP.jpg";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUserName(null);
    router.push("/");
  };

  return (
    <header className="w-full bg-gradient-to-r from-[#004C97] to-[#00923F] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="Logo Liga Deportiva Picaíhua"
            width={48}
            height={48}
            className="rounded-full bg-white p-1"
          />
          <div className="text-white">
            <h1 className="text-lg font-bold leading-tight">
              Liga Deportiva Parroquial
            </h1>
            <p className="text-sm font-medium tracking-wide text-[#F9C900]">
              Picaíhua
            </p>
          </div>
        </div>

        {/* Cambia según login */}
        {userName ? (
          <div className="flex items-center gap-4 text-white">
            <span className="font-medium">
              Bienvenido, <span className="text-[#F9C900]">{userName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#F9C900] px-4 py-2 text-sm font-semibold text-[#004C97] transition-all hover:bg-white hover:text-[#00923F] shadow-md"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-[#F9C900] px-5 py-2 text-sm font-semibold text-[#004C97] transition-all hover:bg-white hover:text-[#00923F] shadow-md"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}
