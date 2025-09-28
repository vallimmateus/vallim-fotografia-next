import { NextResponse } from 'next/server'
import { detectFaces } from '@/lib/rekognition'

export async function POST(req: Request) {
  try {
    const { imageS3Key, imageS3Bucket } = await req.json()

    if (!imageS3Key || !imageS3Bucket) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const data = await detectFaces(imageS3Key, imageS3Bucket)
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to detect faces' },
      { status: 500 },
    )
  }
}
