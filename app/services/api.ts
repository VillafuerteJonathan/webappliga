const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 🔑 Obtener token desde localStorage
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (res.status >= 500) {
    throw data;
  }

  if (!res.ok) {
    return data;
  }

  return data as T;
}
