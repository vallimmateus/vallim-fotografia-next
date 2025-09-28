import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const event = await prismaClient.event.findFirst({
      where: {
        name: 'DGG Submundo',
      },
      select: {
        id: true,
        photos: {
          include: {
            photoVersions: {
              select: {
                s3Key: true,
                photoId: true,
              },
              where: {
                type: 'original',
              },
            },
          },
        },
      },
    })
    const photosS3Keys = event?.photos
      .map((photo) => {
        return photo.photoVersions.map((photoVersion) => {
          return photoVersion.s3Key
        })
      })
      .flat()
    return NextResponse.json(photosS3Keys)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event', message: error },
      { status: 500 },
    )
  }
}
