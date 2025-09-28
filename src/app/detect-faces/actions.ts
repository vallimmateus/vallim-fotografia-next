'use server'

import { prismaClient } from '@/lib/prisma'

export const getAllImages = async () => {
  const event = await prismaClient.event.findFirst({
    where: {
      name: 'DGG Submundo',
    },
    select: {
      id: true,
      photos: {
        include: {
          photoVersions: {
            select: {
              s3Key: true,
              photoId: true,
            },
            where: {
              type: 'original',
            },
          },
        },
      },
    },
  })

  return event
}
