import { Organization } from '@prisma/client'

const baseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL

export async function getOrganizationLogo(organization: Organization) {
  const responseMiniature = await fetch(
    `${baseUrl}/api/get-signed-url?${new URLSearchParams({
      photo:
        'logos/organizations/' +
        organization.logoFileName?.split('.').join('.miniature.'),
    })}`,
    {
      method: 'GET',
      next: {
        revalidate: process.env.NODE_ENV === 'development' ? 20 : 5 * 60 ** 2,
        tags: [`get-organization-miniature-${organization.id}`],
      },
    },
  )
  const {
    signedUrl,
  }: {
    signedUrl: string
    message: string
  } = await responseMiniature.json()
  return signedUrl
}

export async function getOrganizationsLogo(organizations: Organization[]) {
  return await Promise.all(
    organizations.map(async (organization) => {
      return {
        ...organization,
        logoUrl: await getOrganizationLogo(organization),
      }
    }),
  )
}
