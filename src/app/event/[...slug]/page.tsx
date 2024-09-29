import { prismaClient } from '@/lib/prisma'
import { fetchEvent, fetchPhotos, getAllSignedUrl } from './actions'
import Album from './components/album'
import { OrganizationLogo } from '@/components/organization-logo'
import { Fragment, Suspense, useContext } from 'react'
import { UserContext } from '@/providers/user'
import { basePath } from '@/lib/constants'
import { Prisma } from '@prisma/client'
import { PhotoWithUrlSigneds } from '@/types'
import { Loader2 } from 'lucide-react'

type Params = {
  slug: [string, string]
}

export const revalidate = 60 * 60 * 24 * 7

export const dynamicParams = true

// export async function generateStaticParams() {
//   const events = await prismaClient.event.findMany({}).then((events) => {
//     return events.map((event) => ({
//       slug: [event.date.getFullYear().toString(), event.slug],
//     }))
//   })
//   return [
//     {
//       slug: ['2024', 'quimicarreguem'],
//     },
//   ]
// }

const eventData = Prisma.validator<Prisma.EventDefaultArgs>()({
  include: {
    photo: {
      orderBy: {
        imageFileName: 'asc',
      },
    },
    organizationsOnEvents: {
      include: {
        organization: true,
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
    completedValidators: {
      select: {
        userId: true,
      },
    },
    pendingValidators: {
      select: {
        userId: true,
      },
    },
  },
})

type EventWithOrganizationAndPhotos = Prisma.EventGetPayload<typeof eventData>

export default async function Page({ params }: { params: Params }) {
  console.log(
    'fetch:',
    `${basePath}/api/events?select=["id"]&take=1&year=${params.slug[0]}&slug=${params.slug[1]}`,
  )
  const responseEvent = await fetch(
    `${basePath}/api/events?select=["id"]&take=1&year=${params.slug[0]}&slug=${params.slug[1]}`,
    {
      next: {
        revalidate: 60,
      },
    },
  )

  if (responseEvent.status !== 200) {
    throw new Error('Failed to fetch eventId')
  }

  const event = await responseEvent.json()

  // console.log('fetch:', `${basePath}/api/photos/event/${eventId.id}`)
  // const responseEvent = await fetch(
  //   `${basePath}/api/photos/event/${eventId.id}`,
  //   {
  //     method: 'GET',
  //     next: {
  //       tags: [`event-${eventId.id}`],
  //     },
  //   },
  // )
  // if (responseEvent.status !== 200) {
  //   throw new Error('Failed to fetch event')
  // }
  // const photos = await responseEvent.json()
  // console.log('photos:', photos)
  // const { event } = (await responseEvent.json()) as {
  //   event: EventWithOrganizationAndPhotos
  // }

  return null
  // console.log('event', event)

  // const photosWithSignedUrls = await Promise.all([
  //   ...event.photo.slice(0, 15).map(async (photo) => ({
  //     ...photo,
  //     signedUrlOriginal: await getAllSignedUrl(photo.name, event.id),
  //     signedUrlMiniature: await getAllSignedUrl(
  //       photo.name,
  //       event.id,
  //       'miniature',
  //     ),
  //     signedUrlThumbnail: await getAllSignedUrl(
  //       photo.name,
  //       event.id,
  //       'thumbnail',
  //     ),
  //   })),
  // ])

  // const organizationsLogoWithSignedUrls = await Promise.all([
  //   ...event.OrganizationsOnEvents.map(async ({ Organization }) => {
  //     if (!Organization.logoFileName) {
  //       return {
  //         ...Organization,
  //         signedUrlOriginal: undefined,
  //         signedUrlMiniature: undefined,
  //         signedUrlThumbnail: undefined,
  //       }
  //     }
  //     return {
  //       ...Organization,
  //       signedUrlOriginal: await getAllSignedUrl(
  //         Organization.logoFileName,
  //         'logos/organizations',
  //       ),
  //       signedUrlMiniature: await getAllSignedUrl(
  //         Organization.logoFileName,
  //         'logos/organizations',
  //         'miniature',
  //       ),
  //       signedUrlThumbnail: await getAllSignedUrl(
  //         Organization.logoFileName,
  //         'logos/organizations',
  //         'thumbnail',
  //       ),
  //     }
  //   }),
  // ])

  // const photos = [...photosWithSignedUrls, ...event.Photo.slice(15)]

  return (
    <div className="w-full flex-1">
      <div className="px-10 py-8 max-md:px-3">
        <div className="mb-6 flex w-full justify-between px-10">
          <div className="flex flex-col gap-3">
            <h1 className="max-w-4xl border-b-[1px] pb-2 text-5xl font-bold">
              {event.name}
            </h1>
            {event.description && (
              <p className="max-w-3xl text-muted-foreground">
                {event.description}
              </p>
            )}
          </div>
          <div className="flex items-center">
            {organizationsLogoWithSignedUrls
              .filter(
                (org) =>
                  org.signedUrlMiniature ||
                  org.signedUrlOriginal ||
                  org.signedUrlThumbnail,
              )
              .map((org) => {
                if (
                  org.signedUrlMiniature ||
                  org.signedUrlOriginal ||
                  org.signedUrlThumbnail
                ) {
                  return (
                    <Fragment key={org.id}>
                      <OrganizationLogo
                        organization={{
                          ...org,
                          signedUrl:
                            org.signedUrlMiniature ||
                            org.signedUrlOriginal ||
                            org.signedUrlThumbnail,
                        }}
                      />
                    </Fragment>
                  )
                } else {
                  return null
                }
              })}
          </div>
        </div>
      </div>
      <Suspense fallback={<div>Carregando...</div>}>
        <Album initialPhotos={photos} eventId={event.id} />
      </Suspense>
    </div>
  )
}
