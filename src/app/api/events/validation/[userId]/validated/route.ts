import { prismaClient } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const searchParamsSchema = z.object({
  userId: z.string().cuid(),
})

/**
 * Handles GET requests to retrieve events validated by a specific user.
 *
 * This function parses and validates the request parameters using the Zod schema.
 * If the validation fails, it returns a 400 status with an error message.
 * If the validation succeeds, it fetches the events validated by the user from the database using Prisma.
 *
 * @param {Request} _req - The incoming request object.
 * @param {Object} context - The context object containing route parameters.
 * @param {Object} context.params - The route parameters.
 * @param {string} context.params.userId - The ID of the user whose validated events are to be retrieved. Must be a valid CUID.
 * @returns {Promise<Response>} - A promise that resolves to a JSON response containing the list of events or an error message.
 *
 * @throws {Error} - Throws an error if there is an issue fetching the events from the database.
 *
 * @example
 * // Example of a successful response
 * [
 *   {
 *     "id": "cm18p6n4e00003j6l9l1a2248",
 *     "name": "Festival of Lights",
 *     "type": "event",
 *     "description": "A grand festival of lights.",
 *     "logoFileName": "festival-logo.png",
 *     "coverFileName": "festival-cover.png",
 *     "slug": "festival-of-lights",
 *     "date": "2023-12-01T00:00:00.000Z",
 *     "createdByUser": "cklv5u9z10001jr8bdrm3eufb",
 *     "organizationsOnEvents": [
 *       { "organizationId": "cklv5u9z10001jr8bdrm3eufb" }
 *     ],
 *     "completedValidators": [
 *       { "userId": "cklv5u9z10001jr8bdrm3eufb" }
 *     ],
 *     "photographers": [
 *       { "photographerId": "cklv5u9z10001jr8bdrm3eufb" }
 *     ]
 *   }
 * ]
 *
 * @example
 * // Example of an error response
 * {
 *   "error": "Invalid request parameters"
 * }
 */
export async function GET(
  _req: Request,
  { params }: { params: { userId: string } },
) {
  const bodyParsed = searchParamsSchema.safeParse(params)

  if (bodyParsed.error) {
    return NextResponse.json({ error: bodyParsed.error }, { status: 400 })
  }

  const { userId } = bodyParsed.data

  try {
    // Busca eventos que o usuário validou
    const events = await prismaClient.event.findMany({
      where: {
        completedValidators: {
          some: {
            userId,
          },
        },
      },
    })

    // Retorna a lista de eventos
    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
