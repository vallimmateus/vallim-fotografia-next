import { prismaClient } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const data = req.headers.get("photoName")
  try {
    const photoData = await prismaClient.photo.findFirst({
      where: {
        name: data!
      }
    })

    if (!photoData) {
      throw new Error("Photo not found")
    }

    const likes = await prismaClient.like.findMany({
      where: {
        photoId: photoData.id
      },
      include: {
        user: {
          select: {
            name: true,
            nickname: true,
            image: true,
            email: true
          }
        }
      }
    })
    return NextResponse.json({ likes, message: "success" }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  } finally {
  }
}

export async function POST(req: Request) {
  const data: { photoName: string; email: string } = await req.json()
  try {
    const photoData = await prismaClient.photo.findFirst({
      where: {
        name: data.photoName
      }
    })

    if (!photoData) {
      throw new Error("Photo not found")
    }

    const userData = await prismaClient.user.findFirst({
      where: {
        email: data.email
      }
    })

    if (!userData) {
      throw new Error("User not found")
    }

    await prismaClient.like.create({
      data: {
        photo: {
          connect: {
            id: photoData.id
          }
        },
        user: {
          connect: {
            id: userData.id
          }
        }
      }
    })

    return NextResponse.json(
      { message: "O usuário curtiu a foto com sucesso" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function DELETE(req: Request) {
  const data: { id: string } = await req.json()
  try {
    await prismaClient.like.delete({
      where: {
        id: data.id
      }
    })
    return NextResponse.json(
      { message: "O usuário retirou a curtida com sucesso" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
