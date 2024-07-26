import { prismaClient } from '@/lib/prisma'

import NotValidate from './components/not-validate'
import { Organization } from './components/organization'
import { fetchEvent, fetchPhotos } from './actions'
import { InfiniteScrollPhotos } from './components/infinite-scroll-photos'

export const dynamicParams = true

export async function generateStaticParams() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const events = await prismaClient.event.findMany({
    where: {
      publishDate: {
        gte: sixMonthsAgo,
      },
    },
  })

  return events.map((event) => ({
    year: event.date.getFullYear().toString(),
    slug: event.slug,
  }))
}

export default async function Page({
  params: { year, slug },
}: {
  params: { year: string; slug: string }
}) {
  const event = await fetchEvent({ year, slug })

  if (event === null) {
    return <NotValidate />
  }

  const photos = await fetchPhotos(event.id)

  const hoursInSeconds = 60 ** 2
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL

  for (const organization of event.organizations) {
    if (organization.organization.slug !== null) {
      const response = await fetch(
        `${baseUrl}/api/get-signed-url?${new URLSearchParams({
          photo: 'Logos/Organizadores/' + organization.organization.slug,
        })}`,
        {
          method: 'GET',
          next: {
            revalidate: 2 * hoursInSeconds,
          },
        },
      )
      const url: { signedUrl: string; message: string } = await response.json()
      organization.organization = {
        ...organization.organization,
        url: url.signedUrl,
      }
    }
  }

  return (
    <div className="w-full flex-1">
      {event && photos.length > 0 && (
        <div className="px-10 py-8 max-md:px-3">
          <div className="mb-6 flex w-full  justify-between px-10">
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
              {event.organizations
                .filter((org) => org.organization.slug !== null)
                .map((org) => {
                  return (
                    <Organization
                      logoUrl={org.organization.slug as string}
                      name={org.organization.name}
                      link={`/organization/${org.organization.slug}`}
                      key={org.organization.id}
                    />
                  )
                })}
            </div>
          </div>
          <InfiniteScrollPhotos photosUrls={photos} eventId={event.id} />
        </div>
      )}
    </div>
  )
}
