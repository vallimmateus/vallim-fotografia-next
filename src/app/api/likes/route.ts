import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  let data = req.headers.get('photoName')
  try {
    if (data === null) throw new Error('Missing photoName header')
    data = data.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const photoData = await prismaClient.photo.findFirst({
      where: {
        name: data,
      },
    })

    if (!photoData) {
      throw new Error('Photo not found')
    }

    const likes = await prismaClient.like.findMany({
      where: {
        photoId: photoData.id,
      },
      include: {
        user: {
          select: {
            name: true,
            nickname: true,
            image: true,
            email: true,
          },
        },
      },
    })
    return NextResponse.json({ likes, message: 'success' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function POST(req: Request) {
  const data: { photoName: string; email: string } = await req.json()
  try {
    const photoName = data.photoName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const photoData = await prismaClient.photo.findFirst({
      where: {
        name: photoName,
      },
    })

    if (photoData === null) {
      throw new Error('Photo not found')
    }

    const userData = await prismaClient.user.findFirst({
      where: {
        email: data.email,
      },
    })

    if (userData === null) {
      throw new Error('User not found')
    }

    await prismaClient.like.create({
      data: {
        photo: {
          connect: {
            id: photoData.id,
          },
        },
        user: {
          connect: {
            id: userData.id,
          },
        },
      },
    })

    return NextResponse.json(
      { message: 'O usuário curtiu a foto com sucesso' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function DELETE(req: Request) {
  const data: { id: string } = await req.json()
  try {
    if (data.id === null) throw new Error('Missing id header')
    await prismaClient.like.delete({
      where: {
        id: data.id,
      },
    })
    return NextResponse.json(
      { message: 'O usuário retirou a curtida com sucesso' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
