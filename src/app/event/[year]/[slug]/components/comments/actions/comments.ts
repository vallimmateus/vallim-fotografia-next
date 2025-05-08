'use server'

import { prismaClient } from '@/lib/prisma'

export async function getAllComments(photoName: string) {
  const photoData = await prismaClient.photo.findFirst({
    where: {
      originalName: photoName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    },
  })
  const comments = await prismaClient.comment.findMany({
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
  return comments
}

export async function createComment(
  comment: string,
  photoName: string,
  email: string,
) {
  const photoData = await prismaClient.photo.findFirst({
    where: {
      originalName: photoName,
    },
  })
  const createdComment = await prismaClient.comment.create({
    data: {
      text: comment,
      photo: {
        connect: {
          id: photoData?.id,
        },
      },
      user: {
        connect: {
          email,
        },
      },
    },
  })
  return createdComment
}

export async function deleteComment(commentId: string) {
  await prismaClient.comment.delete({
    where: {
      id: commentId,
    },
  })
}

export async function updateComment(text: string, commentId: string) {
  const comment = await prismaClient.comment.update({
    where: {
      id: commentId,
    },
    data: {
      text,
      updatedAt: new Date(),
    },
  })
  return comment
}
