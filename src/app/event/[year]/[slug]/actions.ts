'use server'

import { prismaClient } from '@/lib/prisma'
import { PhotoWithUrlSigneds } from '@/types'
import { Photo } from '@prisma/client'

export async function fetchPhotos(eventId: string) {
  let photos: Photo[]
  photos = await prismaClient.photo.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      eventId,
    },
  })

  photos = await Promise.all(
    photos.map(async (photo) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const urls = await getUrlSigned(photo.name, eventId)
      return {
        ...photo,
        ...urls,
      }
    }),
  )

  return JSON.parse(JSON.stringify(photos)) as PhotoWithUrlSigneds[]
}

export async function fetchEvent({
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
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  })

  if (!event?.publishDate) {
    return null
  }
  return event
}

const hoursInSeconds = 60 ** 2

export async function getUrlSigned(photoName: string, eventId: string) {
  const photo = eventId + '/' + photoName
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL

  const responseOriginal = await fetch(
    `${baseUrl}/api/get-signed-url?${new URLSearchParams({
      photo,
    })}`,
    {
      method: 'GET',
      next: {
        revalidate: 2 * hoursInSeconds,
      },
    },
  )
  const urlOriginal: {
    signedUrl: string
    message: string
  } = await responseOriginal.json()

  const responseMiniature = await fetch(
    `${baseUrl}/api/get-signed-url?${new URLSearchParams({
      photo: photo.split('.')[0].concat('.miniature.jpg'),
    })}`,
    {
      method: 'GET',
      next: {
        revalidate: 2 * hoursInSeconds,
      },
    },
  )
  const urlMiniature: {
    signedUrl: string
    message: string
  } = await responseMiniature.json()

  const responseThumbnail = await fetch(
    `${baseUrl}/api/get-signed-url?${new URLSearchParams({
      photo: photo.split('.')[0].concat('.thumbnail.jpg'),
    })}`,
    {
      method: 'GET',
      next: {
        revalidate: 2 * hoursInSeconds,
      },
    },
  )
  const urlThumbnail: {
    signedUrl: string
    message: string
  } = await responseThumbnail.json()

  return {
    signedUrlOriginal: urlOriginal.signedUrl,
    signedUrlMiniature: urlMiniature.signedUrl,
    signedUrlThumbnail: urlThumbnail.signedUrl,
  }
}
