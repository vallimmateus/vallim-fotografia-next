import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { useState } from 'react'
import Resizer from 'react-image-file-resizer'

export async function POST(req: Request) {
  const { photoName, file }: { photoName: string; file: File } =
    await req.json()

  try {
    return NextResponse.json(
      { message: 'O usuário curtiu a foto com sucesso', data: {} },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
