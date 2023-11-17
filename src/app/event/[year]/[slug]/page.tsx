import React from "react"

import { prismaClient } from "@/lib/prisma"

import Album from "./components/album"
import NotValidate from "./components/not-validate"
import { Organization } from "./components/organization"

export const dynamicParams = false

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
    },
    include: {
      photos: {
        orderBy: {
          name: "asc"
        }
      },
      organizations: {
        include: {
          organization: true
        }
      }
    }
  })

  if (!event?.publishDate) {
    return <NotValidate />
  }

  const photos = event.photos

  const thumbnails = photos.map((photo) => {
    return {
      src: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}=w250`,
      width: 250,
      height: (250 * 2) / 3
    }
  })
  return (
    <div className="w-full flex-1">
      {event && photos.length > 0 && (
        <div className="py-8 max-md:px-3 md:px-10">
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
                .filter((org) => org.organization.logoUrl !== null)
                .map((org) => {
                  return (
                    <Organization
                      logoUrl={org.organization.logoUrl as string}
                      name={org.organization.name}
                      link="#"
                      key={org.organization.id}
                    />
                  )
                })}
            </div>
          </div>
          <Album event={event} photos={photos} thumbnails={thumbnails} />
        </div>
      )}
    </div>
  )
}
