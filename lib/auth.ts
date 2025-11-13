import { apiFetch } from "@/lib/api-client"
import type { ClientUser, UserType } from "@/types/user"

interface AuthResponse {
  user: ClientUser
}

export type User = ClientUser

export async function registerUser(
  email: string,
  password: string,
  name: string,
  type: UserType,
): Promise<User> {
  const data = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, type }),
  })

  return data.user
}

export async function loginUser(email: string, password: string): Promise<User> {
  const data = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  return data.user
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch("/api/auth/me", { credentials: "include" })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const message = payload?.message || "Gagal memuat pengguna"
    throw new Error(message)
  }

  const data = (await response.json()) as AuthResponse
  return data.user
}

export async function logoutUser(): Promise<void> {
  await apiFetch<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  })
}
