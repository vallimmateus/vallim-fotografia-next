'use server'

import { prismaClient } from '@/lib/prisma'

export async function getAllLikes(photoName: string) {
  const photoData = await prismaClient.photo.findFirst({
    where: {
      originalName: photoName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    },
  })
  const likes = await prismaClient.like.findMany({
    where: {
      photoId: photoData?.id,
    },
    include: {
      user: {
        select: {
          name: true,
          nickname: true,
          image: true,
          email: true,
        },
      },
    },
  })
  return likes
}

export async function createLike(photoName: string, email: string) {
  const photoData = await prismaClient.photo.findFirst({
    where: {
      originalName: photoName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    },
  })

  const userData = await prismaClient.user.findFirst({
    where: {
      email,
    },
  })

  const like = await prismaClient.like.create({
    data: {
      photo: {
        connect: {
          id: photoData?.id,
        },
      },
      user: {
        connect: {
          id: userData?.id,
        },
      },
    },
  })

  return like
}

export async function deleteLike(likeId: string) {
  await prismaClient.like.delete({
    where: {
      id: likeId,
    },
  })
}
