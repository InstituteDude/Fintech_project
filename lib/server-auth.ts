import type { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { User as PrismaUser, UserRole } from "@prisma/client"

import type { ClientUser } from "@/types/user"
import { prisma } from "@/lib/prisma"

const AUTH_COOKIE_NAME = "modaumkm_session"
const AUTH_LIFETIME_SECONDS = 60 * 60 * 24 * 7 // 7 hari

const roleMap: Record<UserRole, ClientUser["type"]> = {
  PEMINJAM: "peminjam",
  INVESTOR: "investor",
}

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-secret"
}

export function toClientUser(user: PrismaUser): ClientUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    type: roleMap[user.role],
    createdAt: user.createdAt.toISOString(),
  }
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function createAuthToken(user: PrismaUser) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: AUTH_LIFETIME_SECONDS },
  )
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_LIFETIME_SECONDS,
    path: "/",
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

export async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return null
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { sub: string }
    if (!payload?.sub) {
      return null
    }

    return prisma.user.findUnique({ where: { id: payload.sub } })
  } catch {
    return null
  }
}
