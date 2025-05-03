import { prismaClient } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'

const searchParamsSchema = z.object({
  eventId: z.string().cuid(),
})

/**
 * Handles GET requests to retrieve details of a specific event.
 *
 * This function parses and validates the request parameters using the Zod schema.
 * If the validation fails, it returns a 400 status with an error message.
 * If the validation succeeds, it fetches the event details from the database using Prisma.
 *
 * @param {NextRequest} req - The incoming request object.
 * @param {Object} context - The context object containing route parameters.
 * @param {Object} context.params - The route parameters.
 * @param {string} context.params.eventId - The ID of the event to retrieve. Must be a valid CUID.
 * @returns {Promise<Response>} - A promise that resolves to a JSON response containing the event details or an error message.
 * @throws {Error} - Throws an error if there is an issue retrieving the event from the database.
 *
 * @example
 * // Example of a successful response
 * {
 *   "id": "cm18p6n4e00003j6l9l1a2248",
 *   "name": "Festival of Lights",
 *   "type": "event",
 *   "description": "A grand festival of lights.",
 *   "logoFileName": "festival-logo.png",
 *   "coverFileName": "festival-cover.png",
 *   "slug": "festival-of-lights",
 *   "date": "2023-12-01T00:00:00.000Z",
 *   "createdByUser": "cklv5u9z10001jr8bdrm3eufb",
 *   "organizationsOnEvents": [
 *     { "organizationId": "cklv5u9z10001jr8bdrm3eufb" }
 *   ],
 *   "pendingValidators": [
 *     { "userId": "cklv5u9z10001jr8bdrm3eufb" }
 *   ],
 *   "photographers": [
 *     { "photographerId": "cklv5u9z10001jr8bdrm3eufb" }
 *   ]
 * }
 *
 * @example
 * // Example of an error response
 * {
 *   "error": "Invalid request parameters"
 * }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  const bodyParsed = searchParamsSchema.safeParse(params)

  if (!bodyParsed.success) {
    return NextResponse.json({ error: bodyParsed.error }, { status: 400 })
  }

  const { eventId } = bodyParsed.data

  try {
    // Busca um evento específico no banco de dados
    const event = await prismaClient.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Retorna o evento específico
    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
