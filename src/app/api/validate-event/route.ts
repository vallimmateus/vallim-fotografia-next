import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const {
    id,
    deletedPhotosIds,
    date,
  }: { id: string; deletedPhotosIds?: string[]; date: Date } = await req.json()
  const email = req.headers.get('user-email')
  try {
    if (deletedPhotosIds) {
      await prismaClient.photo.deleteMany({
        where: {
          id: {
            in: deletedPhotosIds,
          },
        },
      })
    }
    if (email === null) throw new Error('Missing email header')
    await prismaClient.event.update({
      where: {
        id,
      },
      data: {
        publishDate: date,
        validateByUserEmail: {
          set: email,
        },
      },
    })
    return NextResponse.json(
      { message: 'Evento validado com sucesso!' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
