import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const slug = req.headers.get('slug')
  const year = req.headers.get('year')
  try {
    if (slug === null || year === null) throw new Error('Missing headers')
    const event = await prismaClient.event.findMany({
      where: {
        AND: [
          { slug },
          {
            date: {
              gte: new Date(`${year}-01-01`),
              lte: new Date(`${year}-12-31`),
            },
          },
        ],
      },
      include: {
        photos: {
          orderBy: {
            name: 'asc',
          },
        },
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    })
    return NextResponse.json({ event, message: 'success' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
