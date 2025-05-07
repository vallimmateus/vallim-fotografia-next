import { ImageResponse } from 'next/og'

import { getCoverImage } from './actions'

// Image metadata
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({
  params,
}: {
  params: { slug: [string, string] }
}) {
  const { slug } = params
  const [year, slugPart] = slug
  const cover = await getCoverImage({ year, slug: slugPart })
  if (!cover.src || !cover.eventName) {
    return new Response('Not Found', { status: 404 })
  }
  return new ImageResponse(
    (
      <div className="h-full w-full">
        <img
          src={`/images/${cover.src}`}
          alt={`${cover.eventName} - Cover image`}
          className="h-full w-full object-contain object-center"
        />
        <img
          src={`/images/${cover.src.split('/original/')[0]}/logo.webp`}
          alt={`${cover.eventName} - Logo event`}
          className="z-10 px-10 py-5"
        />
      </div>
    ),
    {
      ...size,
      debug: true,
    },
  )
}
