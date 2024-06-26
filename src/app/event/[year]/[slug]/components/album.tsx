'use client'

import { Event as EventPC, Photo as PhotoPC } from '@prisma/client'
import { useParams, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import PhotoAlbum, { Photo as PhotoRPA } from 'react-photo-album'

import NextJsImage from '@/components/NextJsImage'

import Comments from './comments'

import Lightbox from 'yet-another-react-lightbox'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/plugins/counter.css'
import Download from 'yet-another-react-lightbox/plugins/download'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Share from 'yet-another-react-lightbox/plugins/share'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

type AlbumProps = {
  thumbnails: PhotoRPA[]
  photos: PhotoPC[]
  event: EventPC
}

const imageSizes = [16, 32, 48, 64, 96, 128, 256, 384]
const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]

export default function Album({ event, photos, thumbnails }: AlbumProps) {
  const searchParams = useSearchParams()
  const photoNumber = Number(searchParams.get('photo'))
  const [index, setIndex] = useState(photoNumber || -1)
  const { slug, year }: { year: string; slug: string } = useParams()

  return (
    <div className="w-full">
      <PhotoAlbum
        photos={thumbnails}
        layout="rows"
        onClick={({ index }) => setIndex(index)}
        targetRowHeight={147}
        renderPhoto={NextJsImage}
      />
      <Lightbox
        slides={photos.map((photo, idx) => ({
          src: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}`,
          download: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}`,
          alt: photo.name,
          share: {
            url: `https://www.vallimfotografia.com.br/event/${year}/${slug}?photo=${idx}`,
            title: event.name,
            text: `Olha essa foto do evento ${event.name}`,
          },
          srcSet: imageSizes.concat(...deviceSizes).map((size) => ({
            src: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}=w${size}`,
            width: size,
            height: Math.round((2 / 3) * size),
          })),
        }))}
        on={{
          view: ({ index }) => {
            setIndex(index)
          },
        }}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slideshow={{ delay: 2500 }}
        // enable optional lightbox plugins
        plugins={[
          Share,
          Download,
          Fullscreen,
          Counter,
          Comments,
          Slideshow,
          Thumbnails,
          Zoom,
        ]}
        carousel={{
          finite: true,
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
        }}
      />
    </div>
  )
}
