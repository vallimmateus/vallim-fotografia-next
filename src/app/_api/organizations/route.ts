import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { basePath } from '@/lib/constants'

export async function GET() {
  try {
    const organizations = await prismaClient.organization.findMany({})
    const organizationsWithLogo = await Promise.all(
      organizations.map(async (organization) => {
        if (!organization.logoFileName)
          return { ...organization, logoUrl: undefined }
        const responseMiniature = await fetch(
          `${basePath}/api/get-signed-url?${new URLSearchParams({
            photo:
              'logos/organizations/' +
              organization.logoFileName?.split('.').join('.miniature.'),
          })}`,
          {
            method: 'GET',
            next: {
              revalidate: process.env.NODE_ENV === 'development' ? 20 : 30,
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
        return {
          ...organization,
          logoUrl: signedUrl,
        }
      }),
    )
    return NextResponse.json(
      { data: { organizationsWithLogo }, message: 'success' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
