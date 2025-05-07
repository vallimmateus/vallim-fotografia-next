'use server'

import { prismaClient } from '@/lib/prisma'

export async function fetchEvent({
  year,
  slug,
}: {
  year: string
  slug: string
}) {
  return await prismaClient.event.findFirst({
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
      organizationsOnEvents: {
        include: {
          organization: true,
        },
      },
      photos: {
        include: {
          photoVersions: true,
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
}

export async function getCoverImage({
  year,
  slug,
}: {
  year: string
  slug: string
}) {
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
      coverFileName: true,
      name: true,
    },
  })
  const photo = await prismaClient.photoVersion.findFirst({
    where: {
      AND: [{ fileName: event?.coverFileName }, { type: 'original' }],
    },
  })
  return {
    src: photo?.s3Key,
    eventName: event?.name,
  }
}
