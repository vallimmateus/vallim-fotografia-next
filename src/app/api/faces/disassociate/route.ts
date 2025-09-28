import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  console.log('Disassociating face from user...')
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
          disconnect: true,
        },
      },
    })

    return NextResponse.json('Face disassociated successfully', { status: 200 })
  } catch (error) {
    console.error('Error disassociating face:', error)
    return NextResponse.json(
      { message: 'Error disassociating face', error },
      { status: 500 },
    )
  }
}
