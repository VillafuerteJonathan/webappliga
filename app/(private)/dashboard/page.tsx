"use client";

import Sidebar from "@/components/layout/Sidebar";
import  Header  from "@/components/layout/Header";

export default function PrivadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64">
        <Header />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
