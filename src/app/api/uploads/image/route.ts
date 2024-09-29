import { r2 } from '@/lib/cloudflare'
import { NextResponse } from 'next/server'
import { Readable } from 'stream'
import { z } from 'zod'

const bodySchema = z.object({
  file: z.instanceof(File),
})

export async function POST(req: Request) {
  const bodyParsed = bodySchema.safeParse(await req.json())

  if (bodyParsed.error) {
    return NextResponse.json(
      { error: bodyParsed.error.message },
      { status: 400 },
    )
  }

  try {
    const { Key } = await r2.send(
        new r2.PutObjectCommand({
            Bucket: 'my-bucket',
            Key: bodyParsed.data.file.name,
            Body: new Readable({
            read() {
                this.push(bodyParsed.data.file)
                this.push(null)
            },
            }),
        }),
    )

    return NextResponse.json({ Key }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
