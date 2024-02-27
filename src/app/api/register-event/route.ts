import { formSchema } from '@/app/event/register/components/form'
import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

type PhotoListProps = {
  id: string
  name: string
  imageUrlId: string
}[]

export async function POST(req: Request) {
  const data: z.infer<typeof formSchema> = await req.json()
  let photos: PhotoListProps = []

  for (const singleFid of data.fid) {
    const newPhotos = await fetch(
      'https://script.google.com/macros/s/AKfycbz-CRLaRXTcJkbUF2jW4kj8zMT99nyM6qGxyHsEolexa3AAk7zCqB6c2s3uMpmWiN64cA/exec?fid=' +
        singleFid.value,
    )
      .then((res) => res.json())
      .then((data) => {
        return data.data.map((photo: { name: string; img_id: string }) => {
          return {
            name: photo.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
            imageUrlId: photo.img_id,
          }
        })
      })
    photos = [...photos, ...newPhotos]
  }

  let allOrganizations = await prismaClient.organization.findMany({
    where: {
      name: {
        in: data.organization.map(
          (singleOrganization) => singleOrganization.value,
        ),
      },
    },
  })
  for (const singleOrganization of data.organization) {
    const organizationExists = allOrganizations.some(
      (organization) => organization.name === singleOrganization.value,
    )
    if (!organizationExists) {
      const newOrganization = await prismaClient.organization.create({
        data: {
          name: singleOrganization.value,
          logoUrl: singleOrganization.logoUrl,
        },
      })
      allOrganizations = [...allOrganizations, newOrganization]
    }
  }

  try {
    if (data.validateByUserEmail) {
      await prismaClient.event.create({
        data: {
          name: data.name,
          type: data.type,
          coverUrl: data.coverUrl,
          slug: data.slug,
          fid: data.fid.map((singleFid) => {
            return singleFid.value
          }),
          date: data.date,
          publishDate: data.publishDate,
          createdAt: data.createdAt,
          logoUrl: data.logoUrl,
          validateBy: {
            connect: {
              email: data.validateByUserEmail,
            },
          },
          photos: {
            create: photos,
          },
          organizations: {
            create: allOrganizations.map((singleOrganization) => ({
              organization: {
                connect: {
                  id: singleOrganization.id,
                },
              },
            })),
          },
        },
      })
    } else {
      await prismaClient.event.create({
        data: {
          name: data.name,
          type: data.type,
          coverUrl: data.coverUrl,
          slug: data.slug,
          fid: data.fid.map((singleFid) => {
            return singleFid.value
          }),
          date: data.date,
          publishDate: data.publishDate,
          createdAt: data.createdAt,
          logoUrl: data.logoUrl,
          photos: {
            create: photos,
          },
          organizations: {
            create: allOrganizations.map((singleOrganization) => ({
              organization: {
                connect: {
                  id: singleOrganization.id,
                },
              },
            })),
          },
        },
      })
    }
    return NextResponse.json(
      { message: 'Evento criado com sucesso!' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
