import { prismaClient } from '@/lib/prisma'
import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'About Acme'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

async function getCoverImage({ year, slug }: { year: string; slug: string }) {
  const event = await prismaClient.event.findFirst({
    where: {
      AND: [
        { slug },
        {
          date: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
          },
        },
      ],
    },
    select: {
      coverFileName: true,
      name: true,
    },
  })
  const photo = await prismaClient.photoVersion.findFirst({
    where: {
      AND: [{ fileName: event?.coverFileName }, { type: 'original' }],
    },
  })
  return {
    src: photo?.s3Key,
    eventName: event?.name,
  }
}

// Image generation
export default async function Image({
  params,
}: {
  params: { slug: string; year: string }
}) {
  const cover = await getCoverImage(params)

  if (!cover.src || !cover.eventName) {
    return new ImageResponse(
      (
        // ImageResponse JSX element
        <div
          style={{
            fontSize: 128,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          About Acme
        </div>
      ),
      // ImageResponse options
      {
        // For convenience, we can re-use the exported opengraph-image
        // size config to also set the ImageResponse's width and height.
        ...size,
      },
    )
  }

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
        }}
      >
        <img
          src={`https://www.vallimfotografia.com.br/images/${cover.src}`}
          alt={`${cover.eventName} - Cover image`}
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            filter: 'brightness(50%) contrast(80%) grayscale(30%) blur(10px)',
            zIndex: 0,
          }}
        />
        <img
          src={`https://www.vallimfotografia.com.br/images/${cover.src.split('/original/')[0]}/logo.png`}
          alt={`${cover.eventName} - Logo event`}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
            zIndex: 10,
            padding: '150px 70px',
            filter:
              'drop-shadow(1px 1px 5px #0003) drop-shadow(-1px -1px 5px #0003)',
            WebkitFilter:
              'drop-shadow(1px 1px 5px #0003) drop-shadow(-1px -1px 5px #0003)',
          }}
        />
        <img
          src="http://www.vallimfotografia.com.br/vallim-fotografia.svg"
          alt="Logo Vallim Fotografia"
          width={200}
          height={100}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            objectFit: 'contain',
            objectPosition: 'center center',
            zIndex: 5,
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    },
  )
}
