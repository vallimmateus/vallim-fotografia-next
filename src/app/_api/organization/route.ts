import { prismaClient } from '@/lib/prisma'
import { r2 } from '@/lib/cloudflare'

import { Organization } from '@prisma/client'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'

export async function GET() {
  try {
    const organizations = await prismaClient.organization.findMany({})
    return NextResponse.json(
      { data: { organizations }, message: 'success' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function POST(req: Request) {
  const { name, slug, logoFileName }: Organization = await req.json()
  try {
    const organization = await prismaClient.organization.create({
      data: {
        name,
        slug,
        logoFileName,
      },
    })

    revalidateTag('get-organizations')

    return NextResponse.json(
      {
        data: { organization },
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
