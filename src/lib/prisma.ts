import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClient =
  globalForPrisma.prisma ||
  new PrismaClient().$extends({
    query: {
      photoFace: {
        async create({ args, query }) {
          const result = await query(args)

          // Verifica se há um userId associado
          if (result.userId) {
            const photo = await prismaClient.photo.findUnique({
              where: { id: result.photoId },
            })

            if (photo?.eventId) {
              // Cria a associação no PeopleOnEvents, se ainda não existir
              await prismaClient.peopleOnEvents.upsert({
                where: {
                  userId_eventId: {
                    userId: result.userId,
                    eventId: photo.eventId,
                  },
                },
                create: {
                  userId: result.userId,
                  eventId: photo.eventId,
                },
                update: {}, // Não precisa atualizar nada
              })
            }
          }

          return result
        },
        async update({ args, query }) {
          // Executa a operação original de atualização
          const result = await query(args)

          // Verifica se há um userId associado
          if (result.userId) {
            const photo = await prismaClient.photo.findUnique({
              where: { id: result.photoId },
            })

            if (photo?.eventId) {
              // Cria a associação no PeopleOnEvents, se ainda não existir
              await prismaClient.peopleOnEvents.upsert({
                where: {
                  userId_eventId: {
                    userId: result.userId,
                    eventId: photo.eventId,
                  },
                },
                create: {
                  userId: result.userId,
                  eventId: photo.eventId,
                },
                update: {}, // Não precisa atualizar nada
              })
            }
          }

          return result
        },
        async delete({ args, query }) {
          // Executa a operação original de exclusão
          const result = await query(args)

          // Verifica se o userId está associado
          if (result.userId) {
            const photo = await prismaClient.photo.findUnique({
              where: { id: result.photoId },
            })

            if (photo?.eventId) {
              // Verifica se existem outras PhotoFace associadas ao mesmo userId e eventId
              const remainingFaces = await prismaClient.photoFace.count({
                where: {
                  userId: result.userId,
                  photo: {
                    eventId: photo.eventId,
                  },
                },
              })

              // Se não houver mais associações, remove o registro de PeopleOnEvents
              if (remainingFaces === 0) {
                await prismaClient.peopleOnEvents.deleteMany({
                  where: {
                    userId: result.userId,
                    eventId: photo.eventId,
                  },
                })
              }
            }
          }

          return result
        },
      },
    },
  })

export { prismaClient }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
