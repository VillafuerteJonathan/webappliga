import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "secret-key-demo";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Simulación de usuarios
  const users = [
    { email: "admin@liga.com", password: "123456", name: "Administrador", role: "admin" },
    { email: "delegado@liga.com", password: "123456", name: "Delegado", role: "delegado" },
  ];

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
  return NextResponse.json({ token, ...user }, { status: 200 });
}
