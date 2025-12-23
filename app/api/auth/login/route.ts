import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1️⃣ Llamada al backend real
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const backendResponse = await res.json();

    // 2️⃣ Error directo del backend
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: backendResponse.message || "Credenciales incorrectas",
        },
        { status: res.status }
      );
    }

    // 3️⃣ Extraemos correctamente
    const { token, usuario } = backendResponse.data;

    // 4️⃣ CONTROL DE ROL SOLO PARA FRONT WEB
    if (usuario.rol !== "admin" && usuario.rol !== "delegado") {
      return NextResponse.json(
        {
          success: false,
          message: "Acceso permitido solo para administradores y delegados",
        },
        { status: 403 }
      );
    }

    // 5️⃣ TODO OK → devolvemos EXACTAMENTE lo que el frontend espera
    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          usuario,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error de servidor",
      },
      { status: 500 }
    );
  }
}
