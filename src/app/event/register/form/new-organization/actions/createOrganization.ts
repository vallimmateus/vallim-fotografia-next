'use server'

import { prismaClient } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function createOrganization(
  data: Prisma.OrganizationCreateInput & {
    adminMembers: string[]
  },
) {
  const { adminMembers, ...organizationData } = data
  const users = await prismaClient.user.findMany({
    where: {
      id: {
        in: adminMembers,
      },
    },
  })

  if (users.length !== adminMembers.length) {
    // fazer um convite para novos usuários
    throw new Error('Some users do not exist')
  }
  const organization = await prismaClient.organization.create({
    data: {
      ...organizationData,
      adminMembers: {
        create: adminMembers.map((userId) => ({
          userId,
        })),
      },
    },
  })

  return organization
}
