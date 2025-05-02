import { getFromS3, uploadToS3 } from '@/lib/s3'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import sharp from 'sharp'

const paramsSchema = z.string()

export async function GET(req: Request) {
  const url = new URL(req.url)
  console.log(url.searchParams.entries())
  const searchParams = paramsSchema.safeParse(url.searchParams.get('fileS3Key'))
  console.log(searchParams)

  if (!searchParams.success) {
    return NextResponse.json(
      { error: 'Invalid request search params' },
      { status: 400 },
    )
  }

  const fileS3Key = searchParams.data

  const Key = await getFromS3(fileS3Key)
  console.log(Key)
  return NextResponse.json(Key, { status: 200 })
}

const formSchema = z.object({
  file: z.instanceof(File),
  fileS3Key: z.string(),
  options: z
    .object({
      maxSize: z.number().optional(),
      format: z.enum(['webp', 'jpeg', 'jpg', 'png']).default('webp'),
      quality: z.number().min(1).max(100).default(70),
    })
    .default({
      maxSize: 1080,
      format: 'webp',
      quality: 70,
    }),
})

const types = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
}

export async function POST(req: Request) {
  const formData = await req.formData()

  const formParsed = formSchema.safeParse({
    file: formData.get('file'),
    fileS3Key: formData.get('fileS3Key'),
    options: JSON.parse(formData.get('options')?.toString() || '{}'),
  })

  if (formParsed.error) {
    return NextResponse.json(
      { error: formParsed.error.message },
      { status: 400 },
    )
  }

  const { file, fileS3Key, options } = formParsed.data

  try {
    const logoBuffer = await file.arrayBuffer()
    const logoBufferSharp = Buffer.from(logoBuffer)
    let sharpInstance = sharp(logoBufferSharp).toFormat(options.format, {
      quality: options.quality,
    })

    if (options.maxSize) {
      const metadata = await sharpInstance.metadata()
      if (
        (metadata.width && metadata.width > options.maxSize) ||
        (metadata.height && metadata.height > options.maxSize)
      ) {
        sharpInstance = sharpInstance.resize(options.maxSize, options.maxSize, {
          fit: 'inside',
        })
      }
    }

    const logoBufferWebp = await sharpInstance.toBuffer()
    const logoBufferType = types[options.format]
    const fileName = `${fileS3Key.split('.')[0]}.${options.format}`

    const Key = await uploadToS3(logoBufferWebp, fileName, logoBufferType)

    return NextResponse.json({ fileS3Key: Key }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
