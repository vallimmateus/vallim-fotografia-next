// POST /api/organizations (registrar nova organização)

import { prismaClient } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const searchParamsSchema = z.object({
  limit: z.number().int().positive().default(10),
  page: z.number().int().positive().default(1),
  eventId: z.string().cuid().optional(),
  userAdminId: z.string().cuid().optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const searchParams = searchParamsSchema.safeParse(url.searchParams)

  if (!searchParams.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 },
    )
  }

  const { limit, page, eventId, userAdminId } = searchParams.data
  const skip = (page - 1) * limit

  try {
    const whereClause: Prisma.OrganizationWhereInput = {}

    if (eventId) {
      whereClause.organizationsOnEvents = {
        some: {
          eventId,
        },
      }
    }

    if (userAdminId) {
      whereClause.adminMembers = {
        some: {
          userId: userAdminId,
        },
      }
    }

    const organizations = await prismaClient.organization.findMany({
      take: limit,
      skip,
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(organizations, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

const bodySchema = z
  .object({
    name: z.string(),
    logoFile: z.instanceof(File),
    slug: z.string(),
    adminMembers: z.array(z.string()).min(1),
  })
  .refine(
    (data) => {
      const slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      return data.slug === slug
    },
    {
      message:
        'Slug must be derived from the name: lowercase, without accents, spaces replaced by hyphens, and only alphanumeric characters and hyphens allowed',
    },
  )

export async function POST(req: Request) {
  const body = req.body
  const validation = bodySchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid body parameters' },
      { status: 400 },
    )
  }

  const { name, logoFile, slug, adminMembers } = validation.data

  // Verifica se os usuários passados como administradores existem na tabela de usuários
  const users = await prismaClient.user.findMany({
    where: {
      id: {
        in: adminMembers,
      },
    },
  })

  // Se existirem usuários que não foram encontrados, ativa a chamada /api/new-user para enviar um email de convite
  if (users.length !== adminMembers.length) {
    const missingUsers = adminMembers.filter(
      (id) => !users.map((user) => user.id).includes(id),
    )

    await fetch('/api/users/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userIds: missingUsers }),
    })
  }

  // Upload do arquivo de logo com suas 3 variações em .webp

  try {
    const organization = await prismaClient.organization.create({
      data: {
        name,
        logoFileName: logoFile.name,
        slug,
        adminMembers: {},
      },
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
