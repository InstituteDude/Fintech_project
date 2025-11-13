import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { createAuthToken, hashPassword, setAuthCookie, toClientUser } from "@/lib/server-auth"

const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  type: z.enum(["peminjam", "investor"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: payload.email } })
    if (existing) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        password: await hashPassword(payload.password),
        role: payload.type === "peminjam" ? "PEMINJAM" : "INVESTOR",
      },
    })

    const response = NextResponse.json({ user: toClientUser(user) })
    setAuthCookie(response, createAuthToken(user))
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    return NextResponse.json({ message: "Gagal membuat akun baru" }, { status: 500 })
  }
}
