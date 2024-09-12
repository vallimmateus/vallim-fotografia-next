import { r2 } from '@/lib/cloudflare'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { Client, Command } from '@smithy/smithy-client'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const hourInSeconds = 60 ** 2

export async function POST(req: Request) {
  const uploadBodySchema = z.object({
    path: z.string(),
    contentType: z.string().regex(/image\/(webp|jpg|jpeg|png)/),
  })
  try {
    const body = await req.json()
    const { path, contentType } = uploadBodySchema.parse(body)

    const signedUrl = await getSignedUrl(
      r2 as Client<any, any, any, any>,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: path,
        ContentType: contentType,
      }) as Command<any, any, any>,
      { expiresIn: hourInSeconds },
    )

    return NextResponse.json(
      { data: { signedUrl }, message: 'URL assinada gerada com sucesso!' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function GET(req: NextRequest) {
  const photoSchema = z.object({
    photo: z.string(),
  })

  try {
    const { photo } = photoSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    )
    const signedUrl = await getSignedUrl(
      r2 as Client<any, any, any, any>,
      new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: photo,
      }) as Command<any, any, any>,
      { expiresIn: hourInSeconds * 24 },
    )
    return NextResponse.json(
      {
        signedUrl,
        message: 'GET realizado com sucesso!',
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

// https://vallim-fotografia.72f75587d57ea27eb087a9e9a4b20d33.r2.cloudflarestorage.com/logos/organizations/CAEF.miniature.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=a685c0127536af31bf27993ee7006749%2F20240902%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20240902T231727Z&X-Amz-Expires=30&X-Amz-Signature=458963689941dcaf51b021fe8c6c2569c7e3dd182314081bd5c3dc6351eac06f&X-Amz-SignedHeaders=host&x-id=GetObject
// https://vallim-fotografia.72f75587d57ea27eb087a9e9a4b20d33.r2.cloudflarestorage.com/logos/organizations/CAEF.miniature.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=a685c0127536af31bf27993ee7006749%2F20240902%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20240902T230941Z&X-Amz-Expires=86400&X-Amz-Signature=ec045b7997e92cf4b1d11f6c6c5d87990a621d80e0933fb5e1e49dce38f5427d&X-Amz-SignedHeaders=host&x-id=GetObject
