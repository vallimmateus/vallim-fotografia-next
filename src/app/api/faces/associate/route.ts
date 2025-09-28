import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  console.log('Associating face with user...')
  const { userId, faceId } = await req.json()
  console.log('Received data:', { userId, faceId })

  if (!userId || !faceId) {
    return NextResponse.json('Missing userId or faceId', { status: 400 })
  }

  try {
    await prismaClient.photoFace.update({
      where: { id: faceId },
      data: {
        user: {
          connect: { id: userId },
        },
      },
    })

    return NextResponse.json('Face associated successfully', { status: 200 })
  } catch (error) {
    console.error('Error associating face:', error)
    return NextResponse.json(
      { message: 'Error associating face', error },
      { status: 500 },
    )
  }
}
