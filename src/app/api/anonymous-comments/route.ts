import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const lastComments = await prismaClient.comment.findMany({
      include: {
        photo: {
          include: {
            event: {
              select: {
                name: true,
                type: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      where: {
        userId: 'clozs0wha000008ld8c4m28z7',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(
      { lastComments, message: 'success' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
