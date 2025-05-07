import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

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

  const coverData = await readFile(join(process.cwd(), 'images', cover.src))
  const coverSrc = Uint8Array.from(coverData).buffer

  const logoData = await readFile(
    join(
      process.cwd(),
      'images',
      cover.src.split('/original/')[0],
      'logo.webp',
    ),
  )
  const logoSrc = Uint8Array.from(logoData).buffer

  return new ImageResponse(
    (
      <div className="h-full w-full">
        <img
          src={coverSrc}
          alt={`${slugPart} - Cover image`}
          className="h-full w-full object-contain object-center"
        />
        <img
          src={logoSrc}
          alt={`${slugPart} - Logo event`}
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
