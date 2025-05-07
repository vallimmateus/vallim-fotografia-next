'use server'

import { prismaClient } from '@/lib/prisma'
import sharp from 'sharp'

export async function createPrismaPhotos({
  data,
  eventId,
  uploadedByUserId,
}: {
  uploadedByUserId: string
  eventId: string
  data: Array<{
    originalName: string
    fileS3Path: string
    file: File
  }>
}) {
  const photosCreateManyInput = await Promise.all(
    data.map(async (photo) => {
      const { fileS3Path, file, ...photoData } = photo
      const logoBuffer = await file.arrayBuffer()
      const logoBufferSharp = Buffer.from(logoBuffer)
      const metadata = await sharp(logoBufferSharp).metadata()
      const largerSize =
        metadata && metadata.width && metadata.height
          ? metadata.width > metadata.height
            ? 'width'
            : 'height'
          : 'width'
      return {
        ...photoData,
        photoVersions: [
          {
            fileName: file.name,
            s3Key: `${fileS3Path}/original/${file.name}`,
            format: file.type,
            width: metadata.width || 0,
            height: metadata.height || 0,
            type: 'original',
          },
          {
            fileName: file.name,
            s3Key: `${fileS3Path}/miniature/${file.name.split('.')[0]}.webp`,
            format: 'image/webp',
            width:
              largerSize === 'width'
                ? 512
                : metadata && metadata.width && metadata.height
                  ? Math.round((512 * metadata.width) / metadata.height)
                  : 0,
            height:
              largerSize === 'height'
                ? 512
                : metadata && metadata.width && metadata.height
                  ? Math.round((512 * metadata.height) / metadata.width)
                  : 0,
            type: 'miniature',
          },
          {
            fileName: file.name,
            s3Key: `${fileS3Path}/thumbnail/${file.name.split('.')[0]}.webp`,
            format: 'image/webp',
            width:
              largerSize === 'width'
                ? 128
                : metadata && metadata.width && metadata.height
                  ? Math.round((128 * metadata.width) / metadata.height)
                  : 0,
            height:
              largerSize === 'height'
                ? 128
                : metadata && metadata.width && metadata.height
                  ? Math.round((128 * metadata.height) / metadata.width)
                  : 0,
            type: 'thumbnail',
          },
        ],
      }
    }),
  )
  const photosCreated = await prismaClient.photo.createManyAndReturn({
    data: data.map((photo) => {
      return {
        uploadedByUserId,
        originalName: photo.originalName,
        eventId,
      }
    }),
  })
  await prismaClient.photoVersion.createMany({
    data: photosCreateManyInput.flatMap((photo) => {
      const photoId = photosCreated.find(
        (createdPhoto) => createdPhoto.originalName === photo.originalName,
      )?.id
      if (!photoId) {
        throw new Error(
          `Photo with original name ${photo.originalName} not found in created photos.`,
        )
      }
      return photo.photoVersions.map((version) => ({
        photoId,
        type: version.type,
        fileName: version.fileName,
        s3Key: version.s3Key,
        width: version.width,
        height: version.height,
        format: version.format,
      }))
    }),
  })
  const photos = await prismaClient.photo.findMany({
    where: {
      id: {
        in: photosCreated.map((photo) => photo.id),
      },
    },
    include: {
      photoVersions: true,
    },
  })

  return photos
}
