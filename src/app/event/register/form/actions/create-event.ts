'use server'

import { prismaClient } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function createPrismaEvent(data: Prisma.EventCreateInput) {
  const event = await prismaClient.event.create({
    data,
  })

  return event
}
