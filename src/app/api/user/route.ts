import { prismaClient } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const data = req.headers.get("userEmail")
  try {
    const userData = await prismaClient.user.findFirst({
      where: {
        email: data!
      }
    })
    return NextResponse.json({ userData, message: "success" }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
