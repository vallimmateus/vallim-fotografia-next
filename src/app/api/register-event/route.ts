import { FormDataSchema } from '@/app/event/__register/components/form'
import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

type PhotoListProps = {
  id: string
  name: string
  imageUrlId: string
}[]

// export async function POST(req: Request) {

// }

// export async function POST(req: Request) {
//   const data: z.infer<typeof FormDataSchema> = await req.json()
//   let photos: PhotoListProps = []

//   // alimenta o photos com as fotos do evento que estão no Google Drive
//   for (const singleFid of data.fid) {
//     const newPhotos = await fetch(
//       'https://script.google.com/macros/s/AKfycbz-CRLaRXTcJkbUF2jW4kj8zMT99nyM6qGxyHsEolexa3AAk7zCqB6c2s3uMpmWiN64cA/exec?fid=' +
//         singleFid.value,
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         return data.data.map((photo: { name: string; img_id: string }) => {
//           return {
//             name: photo.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
//             imageUrlId: photo.img_id,
//           }
//         })
//       })
//     photos = [...photos, ...newPhotos]
//   }

//   // verifica se as organizações já existem no banco de dados
//   let allOrganizations = await prismaClient.organization.findMany({
//     where: {
//       name: {
//         in: data.organizations.map(
//           (singleOrganization) => singleOrganization.name,
//         ),
//       },
//     },
//   })

//   // cria as organizações que não existem no banco de dados
//   for (const singleOrganization of data.organizations) {
//     // verifica se a organização já existe no banco de dados
//     const organizationExists = allOrganizations.some(
//       (organization) => organization.name === singleOrganization.name,
//     )

//     if (!organizationExists) {
//       // cria a organização no banco de dados
//       const newOrganization = await prismaClient.organization.create({
//         data: {
//           name: singleOrganization.name,
//           logoUrl: singleOrganization.logoFileName,
//         },
//       })
//       allOrganizations = [...allOrganizations, newOrganization]
//     }
//   }

//   try {
//     // verifica se o evento foi validado por um usuário
//     if (data.validateByUserEmail) {
//       // cria o evento no banco de dados
//       await prismaClient.event.create({
//         data: {
//           name: data.name,
//           type: data.type,
//           coverUrl: data.coverUrl,
//           slug: data.slug,
//           fid: data.fid.map((singleFid) => {
//             return singleFid.value
//           }),
//           date: data.date,
//           publishDate: data.publishDate,
//           createdAt: data.createdAt,
//           logoUrl: data.logoUrl,
//           validateBy: {
//             connect: {
//               email: data.validateByUserEmail,
//             },
//           },
//           photos: {
//             create: photos,
//           },
//           organizations: {
//             create: allOrganizations.map((singleOrganization) => ({
//               organization: {
//                 connect: {
//                   id: singleOrganization.id,
//                 },
//               },
//             })),
//           },
//         },
//       })
//     } else {
//       // cria o evento no banco de dados
//       await prismaClient.event.create({
//         data: {
//           name: data.name,
//           type: data.type,
//           coverUrl: data.coverUrl,
//           slug: data.slug,
//           fid: data.fid.map((singleFid) => {
//             return singleFid.value
//           }),
//           date: data.date,
//           publishDate: data.publishDate,
//           createdAt: data.createdAt,
//           logoUrl: data.logoUrl,
//           photos: {
//             create: photos,
//           },
//           organizations: {
//             create: allOrganizations.map((singleOrganization) => ({
//               organization: {
//                 connect: {
//                   id: singleOrganization.id,
//                 },
//               },
//             })),
//           },
//         },
//       })
//     }
//     return NextResponse.json(
//       { message: 'Evento criado com sucesso!' },
//       { status: 200 },
//     )
//   } catch (err) {
//     return NextResponse.json({ message: err }, { status: 403 })
//   }
// }
