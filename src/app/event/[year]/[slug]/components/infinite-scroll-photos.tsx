'use client'

import { useCallback, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { getUrlSigned } from '../actions'
import { Loader2 } from 'lucide-react'
import { NextJsImage, ImageCard, NextJsThumbnail } from './photo'
import { useParams, useSearchParams } from 'next/navigation'

import Lightbox from 'yet-another-react-lightbox'
import {
  Counter,
  Download,
  Fullscreen,
  Share,
  Slideshow,
  Thumbnails,
  Zoom,
} from 'yet-another-react-lightbox/plugins'
import Comments from './comments'
import 'yet-another-react-lightbox/plugins/counter.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'
import { PhotoWithUrlSigneds } from '@/types'

export function InfiniteScrollPhotos({
  photosUrls,
  eventId,
}: {
  photosUrls: PhotoWithUrlSigneds[]
  eventId: string
}) {
  const [photos, setPhotos] = useState<PhotoWithUrlSigneds[]>(
    photosUrls.slice(0, 24),
  )
  const { ref, inView, entry } = useInView()
  const searchParams = useSearchParams()
  const photoNumber = Number(searchParams.get('photo'))
  const [index, setIndex] = useState(photoNumber || -1)
  const { slug, year }: { year: string; slug: string } = useParams()

  const reloadSignedUrls = useCallback(
    async (name: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const urls = await getUrlSigned(name, eventId)
      setPhotos((prev) => {
        return prev.map((photo) => {
          if (photo.name === name && photo.eventId === eventId) {
            return { ...photo, ...urls }
          }
          return photo
        })
      })
    },
    [eventId],
  )

  const loadMorePhotos = useCallback(async () => {
    const newPhotos = photosUrls.slice(photos.length, photos.length + 5 * 6)
    if (newPhotos.length > 0) {
      setPhotos((prev) => [...(prev.length ? prev : []), ...newPhotos])
    } else {
      entry?.target.remove()
    }
  }, [entry, photos, photosUrls])

  useEffect(() => {
    if (inView) {
      loadMorePhotos()
    }
  }, [inView, loadMorePhotos])
  return (
    <div className="flex flex-col gap-3">
      <div className="grid w-full grid-flow-row grid-cols-6 gap-5 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {photos.map((photo, idx) => {
          return (
            <ImageCard
              photo={photo}
              key={photo.id.concat(idx.toString())}
              onClick={() => setIndex(idx)}
              reloadSignedUrls={reloadSignedUrls}
            />
          )
        })}
      </div>
      <div ref={ref} className="flex h-20 w-full items-center justify-center">
        <Loader2 size={48} color="#fff" className="animate-spin" />
      </div>
      <Lightbox
        slides={
          photosUrls.map((photo, idx) => ({
            src: photo.signedUrlOriginal,
            alt: photo.name,
            title: photo.name,
            share: {
              url: `https://www.vallimfotografia.com.br/event/${year}/${slug}?photo=${idx}`,
              title: eventId,
              text: `Olha essa foto do evento ${eventId}`,
            },
            thumbnail: photo.signedUrlThumbnail,
            onError: () => reloadSignedUrls(photo.name),
          }))
          //   (photo, idx) => ({
          //   src: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}`,
          //   download: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}`,
          //   alt: photo.name,
          //   share: {
          //     url: `https://www.vallimfotografia.com.br/event/${year}/${slug}?photo=${idx}`,
          //     title: event.name,
          //     text: `Olha essa foto do evento ${event.name}`,
          //   },
          // })
        }
        on={{
          view: ({ index }) => {
            setIndex(index)
          },
        }}
        toolbar={
          {
            // buttons
          }
        }
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slideshow={{ delay: 2500 }}
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
        thumbnails={{
          showToggle: true,
          padding: 0,
          border: 0,
          borderRadius: 5,
        }}
        render={{
          slide: NextJsImage,
          thumbnail: NextJsThumbnail,
        }}
      />
    </div>
  )
}
