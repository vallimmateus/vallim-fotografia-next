import { formSchema } from "@/app/event/register/components/form"
import { prismaClient } from "@/lib/prisma"
import cuid from "cuid"
import { NextResponse } from "next/server"
import { z } from "zod"

type PhotoListProps = {
  id: string
  name: string
  imageUrlId: string
}[]

export async function POST(req: Request, res: Response) {
  const data: z.infer<typeof formSchema> = await req.json()
  var photos: PhotoListProps = []

  for (const singleFid of data.fid) {
    const newPhotos = await fetch(
      "https://script.google.com/macros/s/AKfycbz-CRLaRXTcJkbUF2jW4kj8zMT99nyM6qGxyHsEolexa3AAk7zCqB6c2s3uMpmWiN64cA/exec?fid=" +
        singleFid.value
    )
      .then((res) => res.json())
      .then((data) => {
        return data.data.map((photo: { name: string; img_id: string }) => {
          return {
            id: cuid(),
            name: photo.name,
            imageUrlId: photo.img_id
          }
        })
      })
    photos = [...photos, ...newPhotos]
  }

  let allOrganizations = await prismaClient.organization.findMany({
    where: {
      name: {
        in: data.organization.map(
          (singleOrganization) => singleOrganization.value
        )
      }
    }
  })
  for (const singleOrganization of data.organization) {
    const organizationExists = allOrganizations.some(
      (organization) => organization.name === singleOrganization.value
    )
    if (!organizationExists) {
      const newOrganization = await prismaClient.organization.create({
        data: {
          name: singleOrganization.value,
          logoUrl: singleOrganization.logoUrl
        }
      })
      allOrganizations = [...allOrganizations, newOrganization]
    }
  }

  try {
    await prismaClient.event.create({
      data: {
        name: data.name,
        coverUrl: data.coverUrl,
        logoUrl: data.logoUrl,
        type: data.type,
        slug: data.slug,
        fid: data.fid.map((singleFid) => {
          return singleFid.value
        }),
        date: data.date,
        publishDate: data.publishDate,
        createdAt: data.createdAt,
        photos: {
          create: photos
        },
        organizations: {
          create: allOrganizations.map((singleOrganization) => ({
            organization: {
              connect: {
                id: singleOrganization.id
              }
            }
          }))
        },
        validateBy: {
          connect: {
            email: data.validateByUserEmail
          }
        }
      }
    })
    return NextResponse.json(
      { message: "Evento criado com sucesso!" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
