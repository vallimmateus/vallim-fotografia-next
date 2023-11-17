import Link from "next/link"

import EventCard from "@/components/ui/event-card"
import { prismaClient } from "@/lib/prisma"

import { format } from "date-fns"

export async function generateStaticParams() {
  return [
    { category: "party" },
    { category: "event" },
    { category: "personal" }
  ]
}

export default async function Page({
  params: { category }
}: {
  params: { category: string }
}) {
  let pageName: string = ""
  if (category === "party") pageName = "Festas"
  if (category === "event") pageName = "Eventos"
  if (category === "personal") pageName = "Pessoais"
  const events = await prismaClient.event.findMany({
    where: {
      type: category
    },
    orderBy: {
      date: "desc"
    },
    include: {
      organizations: {
        include: {
          organization: true
        }
      }
    }
  })

  return (
    <div className="w-full flex-1">
      <div className="px-10 py-8">
        <h1 className="mb-6 ml-4 max-w-fit border-b-[1px] px-6 pb-2 text-5xl font-bold capitalize">
          {pageName}
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {events.map((event) => {
            return (
              <Link
                href={`/event/${event.date.getFullYear()}/${event.slug}`}
                key={event.id}
              >
                <EventCard
                  cover={event.coverUrl}
                  date={format(event.date, "dd/MM/yyyy")}
                  name={event.name}
                  logo={
                    event.organizations
                      .map((org) => org.organization.logoUrl)
                      .filter((url) => url !== null) as string[]
                  }
                />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
