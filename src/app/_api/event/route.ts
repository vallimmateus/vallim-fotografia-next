import { prismaClient } from '@/lib/prisma'
import { $Enums } from '@prisma/client'
import { id } from 'date-fns/locale'
import { NextRequest, NextResponse } from 'next/server'
import { date, z } from 'zod'

const eventTypes = Object.values($Enums.EventType) as [
  $Enums.EventType,
  ...$Enums.EventType[],
]

/**
 * Handles GET requests to fetch event data based on the provided headers.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a JSON response containing the event data or an error message.
 *
 * @header {string} type - The type of the event to filter by. Must be one of the predefined event types.
 * @header {string} quantity - The number of events to retrieve. Must be a positive integer.
 *
 * @throws {Error} - Throws an error if the required headers are missing or if the validation fails.
 *
 * @example
 * // Example of a successful response
 * {
 *   "eventData": [
 *     {
 *       "id": 1,
 *       "type": "conference",
 *       "date": "2023-10-01T00:00:00.000Z",
 *       ...
 *     },
 *     ...
 *   ],
 *   "message": "success"
 * }
 *
 * @example
 * // Example of an error response
 * {
 *   "message": "Quantity must be a positive integer"
 * }
 */
export async function GET(req: Request) {
  const eventSchema = z.object({
    type: z.enum(eventTypes),
    quantity: z.string().refinement(
      (value) => {
        return (
          !isNaN(Number(value)) &&
          Number.isInteger(Number(value)) &&
          Number(value) > 0
        )
      },
      { message: 'Quantity must be a positive integer', code: 'custom' },
    ),
  })
  const type = req.headers.get('type')
  const quantity = req.headers.get('quantity')
  try {
    if (!type || !quantity) throw new Error('Missing headers')
    const parsed = eventSchema.parse({ type, quantity })
    const eventData = await prismaClient.event.findMany({
      where: {
        type: parsed.type,
      },
      orderBy: {
        date: 'desc',
      },
      take: parseInt(parsed.quantity),
    })
    return NextResponse.json({ eventData, message: 'success' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const eventSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    slug: z.string().regex(/^[a-zA-Z0-9-]+$/, {
      message: 'Slug must contain only a-z, A-Z, 0-9, and -',
    }),
    type: z.enum(eventTypes),
    date: z.date(),
    publishDate: z.date().optional(),
    validateByUserEmail: z.string().email(),
    coverFileName: z.string(),
    logoFileName: z.string(),
  })
  const parsedBody = eventSchema.parse(await req.json())
  try {
    const event = await prismaClient.event.create({
      data: {
        name: parsedBody.name,
        description: parsedBody.description,
        slug: parsedBody.slug,
        type: parsedBody.type,
        date: parsedBody.date,
        publishDate: parsedBody.publishDate,
        coverFileName: parsedBody.coverFileName,
        logoFileName: parsedBody.logoFileName,
        User: {
          connect: {
            email: parsedBody.validateByUserEmail,
          },
        },
      },
    })
    return NextResponse.json({ event }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}

export async function UPDATE(req: NextRequest, res: NextResponse) {
  const eventSchema = z.object({
    id: z.string().cuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    slug: z
      .string()
      .regex(/^[a-zA-Z0-9-]+$/, {
        message: 'Slug must contain only a-z, A-Z, 0-9, and -',
      })
      .optional(),
    type: z.enum(eventTypes).optional(),
    date: z.date().optional(),
    publishDate: z.date().optional(),
    validateByUserEmail: z.string().email().optional(),
    coverFileName: z.string().optional(),
    logoFileName: z.string().optional(),
  })
  // const { id, name, date, type, location, description } = await req.json()
  try {
    // const event = await prismaClient.event.update({
    //   where: {
    //     id,
    //   },
    //   data: {
    //     name,
    //     date,
    //     type,
    //     location,
    //     description,
    //   },
    // })
    return NextResponse.json({ event }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
