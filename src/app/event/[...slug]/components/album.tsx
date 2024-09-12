'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { useInView } from 'react-intersection-observer'

import { fetchPhotos, fetchSinglePhoto } from '../actions'
import { PhotoWithUrlSigneds } from '@/types'
import { ImageCard } from './photo'

import Lightbox, { Slide } from 'yet-another-react-lightbox'
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
import { Loader2 } from 'lucide-react'
import { revalidateTag } from 'next/cache'
import PhotoAlbum from 'react-photo-album'
import { Photo, Prisma } from '@prisma/client'
import { basePath } from '@/lib/constants'
import { getAllSignedUrl } from '../page'

const offsetToFetchLightbox = 15
const offsetToFetchMiniatures = 50

export default function Album({
  initialPhotos,
  eventId,
}: {
  initialPhotos: PhotoWithUrlSigneds[]
  eventId: string
}) {
  const [photos, setPhotos] = useState<PhotoWithUrlSigneds[]>(initialPhotos)

  const params = useParams()
  const [year, slug] = params.slug as [string, string]

  const searchParams = useSearchParams()
  const photoParam = searchParams.get('photo')
  const photoNumber = photoParam === null ? undefined : Number(photoParam) - 1
  const [index, setIndex] = useState(
    photoNumber !== undefined ? photoNumber : -1,
  )

  const { ref, inView } = useInView()

  const photosToLoad = 50

  const handleLoadMorePhotos = async () => {
    const loadStart = photos.filter(
      (photo) =>
        photo.signedUrlMiniature &&
        photo.signedUrlOriginal &&
        photo.signedUrlThumbnail,
    ).length
    const loadEnd = loadStart + photosToLoad
    const newPhotos = await Promise.all([
      ...photos.slice(loadStart, loadEnd).map(async (photo) => {
        return {
          ...photo,
          signedUrlOriginal: await getAllSignedUrl(photo.name, eventId),
          signedUrlMiniature: await getAllSignedUrl(
            photo.name,
            eventId,
            'miniature',
          ),
          signedUrlThumbnail: await getAllSignedUrl(
            photo.name,
            eventId,
            'thumbnail',
          ),
        }
      }),
    ])
    setPhotos((prev) => {
      const photos = prev.map((photo) => {
        if (newPhotos.some((newPhoto) => newPhoto.id === photo.id)) {
          return newPhotos.find(
            (newPhoto) => newPhoto.name === photo.name,
          ) as PhotoWithUrlSigneds
        }
        return photo
      })
      return photos
    })
  }

  const handleLoadSinglePhoto = async (id: string | string[]) => {
    const targetedPhotos = photos.filter((photo) => {
      if (typeof id === 'string') {
        return photo.id === id
      } else {
        return id.includes(photo.id)
      }
    })
    const newPhotos = await Promise.all([
      ...targetedPhotos.map(async (photo) => {
        return {
          ...photo,
          signedUrlOriginal: await getAllSignedUrl(photo.name, eventId),
          signedUrlMiniature: await getAllSignedUrl(
            photo.name,
            eventId,
            'miniature',
          ),
          signedUrlThumbnail: await getAllSignedUrl(
            photo.name,
            eventId,
            'thumbnail',
          ),
        }
      }),
    ])
    setPhotos((prev) => {
      const photos = prev.map((photo) => {
        if (newPhotos.some((newPhoto) => newPhoto.id === photo.id)) {
          return newPhotos.find(
            (newPhoto) => newPhoto.name === photo.name,
          ) as PhotoWithUrlSigneds
        }
        return photo
      })
      return photos
    })
  }

  useEffect(() => {
    if (inView) {
      handleLoadMorePhotos()
    }
  }, [inView])

  const offsetThumbnails = 5
  useEffect(() => {
    const thumbPhotos = photos
      .slice(index - offsetThumbnails, index + 1 + offsetThumbnails)
      .filter(
        (photo) =>
          !photo.signedUrlMiniature ||
          !photo.signedUrlThumbnail ||
          !photo.signedUrlOriginal,
      )
    if (thumbPhotos.length > 0) {
      handleLoadSinglePhoto(thumbPhotos.map((photo) => photo.id))
    }
  }, [index])

  // useEffect(() => {
  //   const firstThumb =
  //     index - offsetToFetchLightbox < 0 ? 0 : index - offsetToFetchLightbox
  //   const lastThumb =
  //     index + offsetToFetchLightbox > photos.length - 1
  //       ? photos.length - 1
  //       : index + offsetToFetchLightbox
  //   if (index >= 0) {
  //     const photosInThumb = [
  //       ...photos.slice(firstThumb, index),
  //       photos[index],
  //       ...photos.slice(index + 1, lastThumb + 1),
  //     ]
  //     if (photosInThumb.some((photo) => !photo.id)) {
  //       const indexToFetch = photosInThumb
  //         .map((photo, idx) => {
  //           if (!photo.id) {
  //             return firstThumb + idx
  //           } else {
  //             return undefined
  //           }
  //         })
  //         .filter((idx) => idx !== undefined)
  //       indexToFetch.forEach((idx) => {
  //         fetchPhotos(eventId, 1, idx).then((newPhotosPrisma) => {
  //           const newPhoto = newPhotosPrisma[0]
  //           if (!newPhoto) {
  //             return
  //           }
  //           setPhotos((prev) => {
  //             const newPhotos = [...prev]
  //             if (!newPhotos[idx].id) {
  //               newPhotos[idx] = newPhoto
  //             }
  //             return newPhotos
  //           })
  //         })
  //       })
  //     }
  //   }
  // }, [index])

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full">
        <PhotoAlbum
          photos={photos
            .filter(
              (photo) =>
                photo.signedUrlMiniature &&
                photo.signedUrlOriginal &&
                photo.signedUrlThumbnail,
            )
            .map((photo) => ({
              height: 256,
              width: 384,
              title: photo.name,
              alt: photo.name,
              key: photo.id,
              imageUrlId: photo.signedUrlMiniature,
              eventId,
            }))}
          layout="rows"
          onClick={({ index }) => setIndex(index)}
          targetRowHeight={256}
          renderRowContainer={({
            rowContainerProps: { style, ...rowContainerProps },
            children,
            rowsCount,
            rowIndex,
          }) => (
            <>
              <div
                {...rowContainerProps}
                className="mb-5 flex justify-center gap-5"
              >
                {children}
              </div>
              {rowsCount === rowIndex + 1 &&
                photos.length < initialPhotos.length && <p>última linha</p>}
            </>
          )}
          spacing={20}
          rowConstraints={{
            maxPhotos: 5,
          }}
          renderPhoto={({ photo, imageProps }) => {
            return (
              <ImageCard
                key={photo.key}
                photo={photo}
                onClick={imageProps.onClick}
              />
            )
          }}
        />
      </div>
      {photos.filter(
        (photo) =>
          photo.signedUrlMiniature &&
          photo.signedUrlOriginal &&
          photo.signedUrlThumbnail,
      ).length < photos.length && (
        <div ref={ref} className="flex h-20 w-full items-center justify-center">
          <Loader2 size={48} color="#fff" className="animate-spin" />
        </div>
      )}
      <Lightbox
        slides={
          photos.map((photo, idx) => ({
            src: photo.signedUrlOriginal,
            alt: photo.name,
            title: photo.name,
            share: {
              url: `https://www.vallimfotografia.com.br/event/${year}/${slug}?photo=${idx}`,
              title: eventId,
              text: `Olha essa foto do evento ${eventId}`,
            },
            thumbnail: photo.signedUrlThumbnail,
            onError: async () => {
              if (!photo.id) {
                revalidateTag(`photo-original-${eventId}-${photo.name}`)
                revalidateTag(`photo-miniature-${eventId}-${photo.name}`)
                revalidateTag(`photo-thumbnail-${eventId}-${photo.name}`)
              } else {
                const reloadedImage = await fetchSinglePhoto(eventId, idx)
                if (reloadedImage) {
                  setPhotos((prev) => {
                    const newPhotos = [...prev]
                    newPhotos[idx] = reloadedImage
                    return newPhotos
                  })
                }
              }
            },
          })) as Slide[]
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
        // render={
        //   {
        //     slide: NextJsImage,
        //     thumbnail: (props) => <NextJsThumbnail {...props} />,
        //   }
        // }
      />
    </div>
  )
}
