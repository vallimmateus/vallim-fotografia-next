'use server'

import { prismaClient } from '@/lib/prisma'

export async function fetchAllUsers({
  page,
  limit,
}: {
  page: number
  limit: number
}) {
  const skip = (page - 1) * limit
  return await prismaClient.user.findMany({
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      nickname: true,
      image: true,
    },
  })
}
