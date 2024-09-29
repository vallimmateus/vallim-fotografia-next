// GET /api/photos/event/[eventId] (listar fotos associadas a um evento)
// POST /api/events/event/[eventId] (upload de lista de fotos e associar a um evento via eventId)

import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const searchParamsSchema = z.object({
  eventId: z.string().cuid(),
})

export async function GET(
  _req: Request,
  { params }: { params: { eventId: string } },
) {
  const bodyParsed = searchParamsSchema.safeParse(params)

  if (bodyParsed.error) {
    return NextResponse.json({ error: bodyParsed.error }, { status: 400 })
  }

  const { eventId } = bodyParsed.data

  try {
    const photos = await prismaClient.photo.findMany({
      where: {
        eventId,
      },
    })

    return NextResponse.json(photos, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
