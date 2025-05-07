import { FormEvent } from './form'
import { Organization } from '@prisma/client'

export default async function Page() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  let organizationsWithLogo: Array<Organization & { logoUrl: string }> = []

  try {
    const responseOrganizationsWithLogo = await fetch(
      `${baseUrl}/api/organizations`,
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

    const json = await responseOrganizationsWithLogo.json()
    organizationsWithLogo = json.data.organizationsWithLogo
  } catch (error) {
    console.error('Error fetching organizations:', error)
    // Fallback para lista vazia
    organizationsWithLogo = []
  }

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <FormEvent initialOrganizations={organizationsWithLogo} />
    </div>
  )
}
