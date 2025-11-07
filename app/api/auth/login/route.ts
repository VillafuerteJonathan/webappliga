import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "secret-key-demo";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Simulación de credenciales válidas
  if (email === "admin@liga.com" && password === "123456") {
    const token = jwt.sign({ name: "Administrador", email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return NextResponse.json({ token, name: "Administrador" }, { status: 200 });
  }

  return NextResponse.json(
    { error: "Credenciales incorrectas" },
    { status: 401 }
  );
}
