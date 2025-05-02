'use server'

import { prismaClient } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import sharp from 'sharp'

export async function createPrismaPhotos(
  data: Array<
    Prisma.PhotoCreateInput & {
      fileS3Path: string
      file: File
    }
  >,
) {
  const photos = await Promise.all(
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
      const createdPhoto = await prismaClient.photo.create({
        data: {
          ...photoData,
          photoVersions: {
            createMany: {
              data: [
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
            },
          },
        },
        include: {
          photoVersions: true,
        },
      })

      return createdPhoto
    }),
  )

  return photos
}
