import { prismaClient } from '@/lib/prisma'
import { FormEvent } from './form'
import { getOrganizationsLogo } from './form/actions/get-organization-logo'
import { Organization } from '@prisma/client'

export default async function Page() {
  const responseOrganizationsWithLogo = await fetch(
    'http://localhost:3000/api/organizations',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: process.env.NODE_ENV === 'development' ? 20 : 10 * 60,
        tags: ['get-organizations'],
      },
    },
  )
  if (!responseOrganizationsWithLogo.ok) {
    throw new Error('Failed to fetch organizations')
  }
  const {
    data: { organizationsWithLogo },
  } = (await responseOrganizationsWithLogo.json()) as {
    data: { organizationsWithLogo: Array<Organization & { logoUrl: string }> }
  }
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <FormEvent initialOrganizations={organizationsWithLogo} />
    </div>
  )
}
