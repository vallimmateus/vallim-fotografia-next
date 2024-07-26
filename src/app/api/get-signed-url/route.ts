import { r2 } from '@/lib/cloudflare'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const hoursInSeconds = 60 ** 2

export async function POST(req: Request) {
  try {
    const uploadBodySchema = z.object({
      path: z.string(),
      contentType: z.string().regex(/image\/(webp|jpg|jpeg|png)/),
    })

    const body = await req.json()
    const { path, contentType } = uploadBodySchema.parse(body)

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: path,
        ContentType: contentType,
      }),
      { expiresIn: 600 },
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
  const photo = req.nextUrl.searchParams.get('photo') as string
  try {
    const signedUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: photo,
      }),
      { expiresIn: 2 * hoursInSeconds },
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
