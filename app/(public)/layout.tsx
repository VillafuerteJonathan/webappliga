"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function PuolicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarVisible ? "md:ml-64" : "ml-0"
        }`}
      >
        {/* ✅ Aquí ya funciona correctamente */}
        <Header onToggleSidebar={handleToggleSidebar} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
