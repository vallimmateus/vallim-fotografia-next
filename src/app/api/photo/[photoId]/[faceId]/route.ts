import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { photoId: string; faceId: string } },
) {
  const { photoId, faceId } = await params
  console.log(`Fetching face with ID ${faceId} for photo with ID ${photoId}`)
  const face = await prismaClient.photoFace.findFirst({
    where: {
      AND: [
        {
          photoId,
        },
        {
          id: faceId,
        },
      ],
    },
  })
  if (!face) {
    return NextResponse.json(
      { error: 'No faces found for this photo' },
      { status: 404 },
    )
  }
  return NextResponse.json({ face }, { status: 200 })
}

// export async function DELETE(
//   req: Request,
//   { params }: { params: { photoId: string; faceId: string } },
// ) {
//   const { photoId, faceId } = await params
//   console.log(`Deleting face with ID ${faceId} for photo with ID ${photoId}`)
//   const deletedFace = await prismaClient.photoFace.delete({
//     where: {
//       id: faceId,
//     },
//   })
//   if (!deletedFace) {
//     return NextResponse.json(
//       { error: 'No faces found for this photo' },
//       { status: 404 },
//     )
//   }
//   return NextResponse.json(
//     { message: 'Face deleted successfully' },
//     { status: 200 },
//   )
// }
