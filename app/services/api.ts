const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  // 🔴 Errores críticos del servidor
  if (res.status >= 500) {
    throw data; // Lanzar solo errores 500+
  }

  // 🟡 Errores de negocio (400, 409, 422...)
  // No lanzar excepción, solo devolver el objeto
  if (!res.ok) {
    return data; // El frontend puede manejar `success: false` o `message`
  }

  // ✅ Respuesta exitosa
  return data as T;
}
