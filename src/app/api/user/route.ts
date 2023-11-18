import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const email = req.headers.get('userEmail')
  try {
    if (email === null) throw new Error('Missing email header')
    const userData = await prismaClient.user.findFirst({
      where: {
        email,
      },
    })
    return NextResponse.json({ userData, message: 'success' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
