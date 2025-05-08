import { fetchEvent } from './actions'
import Album from './components/album'
import { OrganizationLogo } from '@/components/organization-logo'
import { Fragment, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export const revalidate = 604800

export const dynamicParams = true

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; slug: string }>
}) {
  const { year, slug } = await params
  console.log(slug)
  const event = await fetchEvent({ year, slug })

  if (!event) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container w-full flex-1 px-4">
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
            {event.organizationsOnEvents.map(({ organization }) => (
              <Fragment key={organization.id}>
                <OrganizationLogo organization={organization} />
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <Suspense fallback={<div>Carregando...</div>}>
        <Album initialPhotos={event.photos} eventId={event.id} />
      </Suspense>
    </div>
  )
}
