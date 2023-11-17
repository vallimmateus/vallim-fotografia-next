import { prismaClient } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const data = req.headers.get("photoName")
  try {
    const photoData = await prismaClient.photo.findFirst({
      // mudar name para @unique a mudar o findFirst para findUnique
      where: {
        name: data!
      }
    })
    const comments = await prismaClient.comment.findMany({
      where: {
        photoId: photoData!.id
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
    return NextResponse.json({ comments, message: "success" }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function POST(req: Request) {
  const data: { comment: string; photoName: string; email: string } =
    await req.json()
  try {
    const photoData = await prismaClient.photo.findFirst({
      where: {
        name: data.photoName
      }
    })
    await prismaClient.comment.create({
      data: {
        text: data.comment,
        photo: {
          connect: {
            id: photoData!.id
          }
        },
        user: {
          connect: {
            email: data.email
          }
        }
      }
    })
    return NextResponse.json(
      { message: "O comentário foi criado com sucesso" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function DELETE(req: Request) {
  const data: { id: string } = await req.json()
  try {
    await prismaClient.comment.delete({
      where: {
        id: data.id
      }
    })
    return NextResponse.json(
      { message: "O comentário foi deletado com sucesso" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function PATCH(req: Request) {
  const data: { text: string; id: string } = await req.json()
  try {
    await prismaClient.comment.update({
      where: {
        id: data.id
      },
      data: {
        text: data.text,
        updatedAt: new Date()
      }
    })
    return NextResponse.json(
      { message: "O comentário foi atualizado com sucesso" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
