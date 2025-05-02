// app/api/events/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prismaClient } from '@/lib/prisma'
import { $Enums, Prisma } from '@prisma/client'

// Esquema de validação usando Zod
const searchParamsSchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'Must be a positive integer' })
    .default('10'),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: 'Must be a positive integer' })
    .default('1'),
  type: z
    .enum(
      Object.values($Enums.EventType) as [
        $Enums.EventType,
        ...$Enums.EventType[],
      ],
    )
    .optional(),
  organizationId: z.string().cuid().optional(),
  photographerId: z.string().cuid().optional(),
  slug: z.string().optional(),
  year: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .optional(),
})

/**
 * Handles GET requests to fetch events with pagination.
 *
 * This function extracts and validates query parameters from the request URL
 * using the Zod schema. If the validation fails, it returns a 400 status with
 * an error message. If the validation succeeds, it calculates the pagination
 * parameters and fetches the events from the database using Prisma.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a JSON response containing the events or an error message.
 *
 * @query {string} [limit=10] - The number of events to retrieve per page. Must be a positive integer.
 * @query {string} [page=1] - The page number to retrieve. Must be a positive integer.
 * @query {string} [type] - The type of events to filter by.
 * @query {string} [organizationId] - The ID of the organization to filter events by.
 * @query {string} [photographerId] - The ID of the photographer to filter events by.

 *
 * @throws {Error} - Throws an error if the query parameters are invalid or if there is an issue fetching events from the database.
 *
 * @example
 * // Example of a successful response
 * [
 *   {
 *     "id": "cm18p6n4e00003j6l9l1a2248",
 *     "name": "Festival of Lights",
 *     "createdAt": "2023-10-01T00:00:00.000Z",
 *     ...
 *   },
 *   ...
 * ]
 *
 * @example
 * // Example of an error response
 * {
 *   "error": "Invalid query parameters"
 * }
 */
export async function GET(req: Request) {
  const url = new URL(req.url)

  console.log(Object.fromEntries(url.searchParams))

  // Extrai e valida os searchParams
  const validation = searchParamsSchema.safeParse(
    Object.fromEntries(url.searchParams),
  )

  console.log(validation)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 },
    )
  }

  const { limit, page, type, organizationId, photographerId, slug, year } =
    validation.data
  const skip = (page - 1) * limit // Cálculo da paginação

  try {
    // Busca eventos do banco de dados com paginação
    const whereClause: Prisma.EventWhereInput = {}

    if (type) {
      whereClause.type = type
    }

    if (organizationId) {
      whereClause.organizationsOnEvents = {
        some: {
          organizationId,
        },
      }
    }

    if (photographerId) {
      whereClause.photographers = {
        some: {
          photographerId,
        },
      }
    }

    if (slug) {
      whereClause.slug = slug
    }

    if (year) {
      whereClause.date = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      }
    }

    const events = await prismaClient.event.findFirst({
      take: limit,
      skip,
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
      include: {
        completedValidators: true,
        photos: true,
        organizationsOnEvents: {
          include: {
            organization: true,
          },
        },
      },
    })

    // Retorna os eventos
    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

const bodySchema = z.object({
  name: z.string(),
  type: z.enum(['party', 'event']),
  description: z.string().optional(),
  logoFileName: z.string(),
  coverFileName: z.string(),
  slug: z.string(),
  date: z.date(),
  createdByUser: z.string().cuid(),
  organizationsOnEvents: z.array(
    z.object({
      organizationId: z.string().cuid(),
    }),
  ),
  pendingValidators: z.array(
    z.object({
      userId: z.string(),
    }),
  ),
  photographers: z.array(
    z.object({
      photographerId: z.string(),
    }),
  ),
})

/**
 * Handles POST requests to create a new event.
 *
 * This function parses and validates the request body using the Zod schema.
 * If the validation fails, it returns a 400 status with an error message.
 * If the validation succeeds, it creates a new event in the database using Prisma.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a JSON response containing the created event or an error message. * @body {string} name - The name of the event. * @body {string} type - The type of the event. Must be either 'party' or 'event'. * @body {string} [description] - An optional description of the event. * @body {string} logoFileName - The filename of the event's logo.*   ... * @body {string} coverFileName - The filename of the event's cover image. * ]
 * @body {string} slug - The slug for the event. * @body {Date} date - The date of the event.{ * @body {string} createdByUser - The ID of the user who created the event. Must be a valid CUID. * @body {Array<{organizationId: string}>} organizationsOnEvents - An array of organizations associated with the event. Each organization must have a valid CUID. * @body {Array<{userId: string}>} pendingValidators - An array of users pending validation for the event.
 * @body {Array<{photographerId: string}>} photographers - An array of photographers associated with the event. * * @throws {Error} - Throws an error if the request body is invalid or if there is an issue creating the event in the database. *onst * @example * // Example of a successful response// Extr *   "id": "cm18p6n4e00003j6l9l1a2248", *   "name": "Festival of Lights", *   "type": "event", *   "description": "A grand festival of lights.", *   "logoFileName": "festival-logo.png",se.js *   "coverFileName": "festival-cover.png",
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
 *   "error": "Invalid request body"
 * }
 */
export async function POST(req: Request) {
  const bodyParsed = bodySchema.safeParse(await req.json())

  if (!bodyParsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const event = await prismaClient.event.create({
      data: {
        name: bodyParsed.data.name,
        type: bodyParsed.data.type,
        description: bodyParsed.data.description,
        logoFileName: bodyParsed.data.logoFileName,
        coverFileName: bodyParsed.data.coverFileName,
        slug: bodyParsed.data.slug,
        date: bodyParsed.data.date,
        createdByUser: {
          connect: {
            id: bodyParsed.data.createdByUser,
          },
        },
        organizationsOnEvents: {
          createMany: {
            data: bodyParsed.data.organizationsOnEvents,
          },
        },
        pendingValidators: {
          createMany: {
            data: bodyParsed.data.pendingValidators,
          },
        },
        photographers: {
          createMany: {
            data: bodyParsed.data.photographers,
          },
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
