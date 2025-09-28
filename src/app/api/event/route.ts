import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  id: z.string().cuid(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const parseResult = querySchema.safeParse({
    id: searchParams.get('id'),
  })

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.errors[0].message },
      { status: 400 },
    )
  }

  const { id } = parseResult.data
  try {
    const event = await prismaClient.event.findUnique({
      where: {
        id,
      },
      include: {
        organizationsOnEvents: {
          include: {
            organization: true,
          },
        },
        photos: {
          include: {
            photoVersions: true,
            photoFace: {
              include: {
                user: {
                  include: {
                    _count: {
                      select: {
                        photoFace: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        photographers: {
          include: {
            photographer: {
              select: {
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    return NextResponse.json(event)
  } catch (error) {
    console.error(error)
    return NextResponse.error()
  }
}
