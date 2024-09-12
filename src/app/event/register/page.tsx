import { prismaClient } from '@/lib/prisma'
import { FormEvent } from './components/form'
import { getOrganizationsLogo } from './components/form/actions/get-organization-logo'
import { Organization } from '@prisma/client'
import Image from 'next/image'

async function getOrganizations() {
  const organizations = await prismaClient.organization.findMany({})
  // const basePath =
  //   process.env.NODE_ENV === 'development'
  //     ? 'http://localhost:3000'
  //     : 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL
  // const response = await fetch(basePath + '/api/organization', {
  //   next: {
  //     tags: ['get-organizations'],
  //   },
  // })
  // const {
  //   data: { organizations },
  // } = await response.json()
  return organizations
}

export default async function Page() {
  const responseOrganizationsWithLogo = await fetch(
    'http://localhost:3000/api/organizations',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: process.env.NODE_ENV === 'development' ? 20 : 5,
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
