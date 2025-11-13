import { NextRequest, NextResponse } from "next/server"

import { getUserFromRequest, toClientUser } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 })
  }

  return NextResponse.json({ user: toClientUser(user) })
}
