import { prismaClient } from '@/lib/prisma'
import { Event } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const headerSchema = z.object({
  type: z.enum(['party', 'event']),
  quantity: z.string().refinement(
    (value) => {
      return (
        !isNaN(Number(value)) &&
        Number.isInteger(Number(value)) &&
        Number(value) > 0
      )
    },
    { message: 'Quantity must be a positive integer', code: 'custom' },
  ),
})

export async function GET(req: Request) {
  const type = req.headers.get('type')
  const quantity = req.headers.get('quantity')
  if (!type || !quantity) throw new Error('Missing headers')
  const parsed = await headerSchema.safeParseAsync({ type, quantity })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    )
  }

  const events: Event[] = await prismaClient.event.findMany({
    take: 3,
    orderBy: {
      publishDate: 'desc',
    },
    where: {
      type: 'party',
    },
  })

  console.log(events)

  return NextResponse.json(
    { data: { type }, message: 'success' },
    { status: 200 },
  )
}
