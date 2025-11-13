import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { createAuthToken, setAuthCookie, toClientUser, verifyPassword } from "@/lib/server-auth"

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 })
    }

    const isValid = await verifyPassword(payload.password, user.password)
    if (!isValid) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 })
    }

    const response = NextResponse.json({ user: toClientUser(user) })
    setAuthCookie(response, createAuthToken(user))
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    return NextResponse.json({ message: "Gagal masuk ke sistem" }, { status: 500 })
  }
}
