'use server'

import { prismaClient } from '@/lib/prisma'
import { UserContext } from '@/providers/user'
import { PhotoWithUrlSigneds } from '@/types'
import { Photo, Event, User } from '@prisma/client'
import { useContext } from 'react'
import { basePath } from '@/lib/constants'

type EventWithOrganizationAndUrl = Event & {
  OrganizationsOnEvents: Array<{
    Organization: {
      id: string
      name: string
      logoFileName: string | null
      slug: string
      url: string
    }
  }>
  _count: {
    Photo: number
  }
}

export async function fetchPhotos(eventId: string, limit?: number, skip = 0) {
  let photos: Photo[]
  photos = await prismaClient.photo.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      eventId,
    },
    ...(limit
      ? {
          take: limit,
          skip,
        }
      : {}),
  })

  photos = await Promise.all(
    photos.map(async (photo) => {
      const urls = await getUrlSigned(photo.name, eventId)
      return {
        ...photo,
        ...urls,
      }
    }),
  )

  return JSON.parse(JSON.stringify(photos)) as PhotoWithUrlSigneds[]
}

export async function fetchSinglePhoto(eventId: string, index: number) {
  const photoPrisma = await prismaClient.photo.findFirst({
    orderBy: {
      name: 'asc',
    },
    where: {
      eventId,
    },
    skip: index - 1,
  })

  if (!photoPrisma) {
    return null
  }

  const photoUrls = (await getUrlSigned(photoPrisma.name, eventId)) as {
    signedUrlOriginal: string
    signedUrlMiniature: string
    signedUrlThumbnail: string
  }

  const photo = {
    ...photoPrisma,
    ...photoUrls,
  }

  return photo
}

export async function fetchEvent({
  year,
  slug,
  user,
}: {
  year: string
  slug: string
  user?: User
}): Promise<EventWithOrganizationAndUrl | null> {
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
      OrganizationsOnEvents: {
        include: {
          Organization: true,
        },
      },
      _count: {
        select: {
          Photo: true,
        },
      },
      Photo: {
        select: {
          id: true,
          _count: {
            select: {
              Comment: true,
              Like: true,
            },
          },
          ...(user && {
            Like: {
              where: {
                userId: user.id,
              },
              select: {
                id: true,
                createdAt: true,
              },
            },
          }),
        },
      },
    },
  })

  if (!event) {
    return null
  }

  const organizations = await Promise.all(
    event.OrganizationsOnEvents.map(async (organization) => {
      const logo = await getUrlSigned(
        organization.Organization.logoFileName || '',
        'logos/organizations',
        true,
      )
      return {
        ...organization,
        Organization: {
          ...organization.Organization,
          url: logo.signedUrlOriginal,
        },
      }
    }),
  )

  return {
    ...event,
    OrganizationsOnEvents: organizations,
  }
}

// const hoursInSeconds = 60 ** 2

export const getAllSignedUrl = async (
  photo: string,
  eventId: string,
  type?: 'miniature' | 'thumbnail',
) => {
  const response = await fetch(
    `${basePath}/api/get-signed-url?${new URLSearchParams({
      photo: `${eventId}/${type ? photo.split('.').join(`.${type}.`) : photo}`,
    })}`,
    {
      next: {
        tags: [`photo-${type ?? 'original'}-${eventId}-${photo}`],
        revalidate: 5 * 60 * 60,
      },
    },
  )
  const { signedUrl } = (await response.json()) as {
    signedUrl: string
    message: string
  }
  return signedUrl
}

export async function getUrlSigned(
  photoName: string,
  folder?: string,
  onlyOriginal = false,
) {
  const photo = folder ? `${folder}/${photoName}` : photoName
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
        revalidate: process.env.NODE_ENV === 'development' ? 20 : 60 * 5,
        tags: [`photo-original-${photo.replaceAll('/', '-')}`],
      },
    },
  )
  const urlOriginal: {
    signedUrl: string
    message: string
  } = await responseOriginal.json()

  if (onlyOriginal) {
    return {
      signedUrlOriginal: urlOriginal.signedUrl,
    }
  }

  const responseMiniature = await fetch(
    `${baseUrl}/api/get-signed-url?${new URLSearchParams({
      photo: photo.split('.')[0].concat('.miniature.jpg'),
    })}`,
    {
      method: 'GET',
      next: {
        revalidate: process.env.NODE_ENV === 'development' ? 20 : 60 * 5,
        tags: [`photo-miniature-${photo.replaceAll('/', '-')}`],
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
        revalidate: process.env.NODE_ENV === 'development' ? 20 : 60 * 5,
        tags: [`photo-thumbnail-${photo.replaceAll('/', '-')}`],
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
