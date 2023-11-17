import { prismaClient } from "@/lib/prisma"

import Album from "./components/album"
import Validated from "./components/validated"

export async function generateStaticParams() {
  const events = await prismaClient.event.findMany({})

  return events.map((event) => ({
    year: event.date.getFullYear().toString(),
    slug: event.slug
  }))
}

export default async function Page({
  params: { year, slug }
}: {
  params: { year: string; slug: string }
}) {
  const event = await prismaClient.event.findFirst({
    where: {
      AND: [
        { slug: slug },
        {
          date: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`)
          }
        }
      ]
    }
  })

  if (event?.publishDate) {
    const userValidator = await prismaClient.user.findFirst({
      where: {
        email: event.validateByUserEmail
      }
    })
    return (
      <Validated
        userValidator={userValidator!}
        publishDate={event.publishDate}
        link={`/event/${year}/${slug}`}
      />
    )
  }

  const photos = await prismaClient.photo.findMany({
    where: {
      eventId: event?.id
    },
    orderBy: {
      name: "asc"
    }
  })

  const thumbnails = photos.map((photo) => {
    return {
      src: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}=h250`,
      width: (250 * 3) / 2,
      height: 250,
      key: photo.id
    }
  })

  return (
    <div className="w-full flex-1">
      {event && photos.length > 0 && (
        <Album event={event} photos={photos} thumbnails={thumbnails} />
      )}
    </div>
  )
}
