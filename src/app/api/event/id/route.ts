import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  year: z
    .string()
    .length(4, { message: 'Year must be 4 digits' })
    .refine((val) => !isNaN(Number(val)), { message: 'Year must be a number' }),
  slug: z.string(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const parseResult = querySchema.safeParse({
    year: searchParams.get('year'),
    slug: searchParams.get('slug'),
  })

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.errors[0].message },
      { status: 400 },
    )
  }

  const { year, slug } = parseResult.data
  try {
    const event = await prismaClient.event.findFirst({
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
      select: {
        id: true,
      },
    })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    return NextResponse.json({ eventId: event.id })
  } catch (error) {
    console.error(error)
    return NextResponse.error()
  }
}
