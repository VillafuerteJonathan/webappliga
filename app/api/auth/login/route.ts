import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Llamada al backend real
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body), // { cedula, password }
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Credenciales incorrectas" }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error de servidor" }, { status: 500 });
  }
}
