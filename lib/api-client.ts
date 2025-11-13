interface ApiError {
  message?: string
}

export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as T & ApiError) : ({} as T & ApiError)

  if (!response.ok) {
    const message = (data as ApiError)?.message || "Terjadi kesalahan pada server"
    throw new Error(message)
  }

  return data as T
}
