import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const { photoId } = await params
  const faces = await prismaClient.photoFace.findMany({
    where: {
      photoId,
    },
  })
  if (!faces) {
    return NextResponse.json(
      { error: 'No faces found for this photo' },
      { status: 404 },
    )
  }
  return NextResponse.json({ faces }, { status: 200 })
}
