import { prismaClient } from '@/lib/prisma'
import { Organization } from '@prisma/client'

export async function getOrganizations() {
  const organizations = await prismaClient.organization.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  const organizationsWithLogo: Array<Organization & { logoUrl: string }> =
    organizations.map((organization) => ({
      ...organization,
      logoUrl: `/images/${organization.logoS3Key}`,
    }))

  return organizationsWithLogo
}
