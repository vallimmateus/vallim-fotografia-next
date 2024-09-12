import { prismaClient } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

const eventData = Prisma.validator<Prisma.EventDefaultArgs>()({
  include: {
    Photo: {
      orderBy: {
        name: 'asc',
      },
    },
    OrganizationsOnEvents: {
      include: {
        Organization: true,
      },
    },
  },
})

type EventWithOrganizationAndPhotos = Prisma.EventGetPayload<typeof eventData>

export async function GET(req: Request) {
  const slug = req.headers.get('slug')
  const year = req.headers.get('year')

  try {
    if (slug === null || year === null) throw new Error('Missing headers')
    const events: EventWithOrganizationAndPhotos[] =
      await prismaClient.event.findMany({
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
          Photo: {
            orderBy: {
              name: 'asc',
            },
          },
          OrganizationsOnEvents: {
            include: {
              Organization: true,
            },
          },
        },
      })

    if (events.length === 0) throw new Error('Event not found')
    const event = events[0]
    return NextResponse.json({ event, message: 'success' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
