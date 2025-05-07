'use server'

import { prismaClient } from '@/lib/prisma'
import { Organization } from '@prisma/client'

export async function getOrganizations() {
  try {
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
  } catch (error) {
    console.error('Error fetching organizations:', error)
    throw new Error('Failed to fetch organizations')
  }
}
