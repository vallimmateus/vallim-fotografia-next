'use client'

import { useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'

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
import PhotoAlbum from 'react-photo-album'
import { Prisma } from '@prisma/client'

type PhotoWithVersions = Prisma.PhotoGetPayload<{
  include: {
    photoVersions: {
      select: {
        id: true
        photoId: true
        type: true
        fileName: true
        s3Key: true
        width: true
        height: true
        format: true
      }
    }
  }
}>

export default function Album({
  initialPhotos,
  eventId,
}: {
  initialPhotos: PhotoWithVersions[]
  eventId: string
}) {
  const photos = initialPhotos

  const params = useParams()
  const [year, slug] = params.slug as [string, string]

  const searchParams = useSearchParams()
  const photoParam = searchParams.get('photo')
  const photoNumber = photoParam === null ? undefined : Number(photoParam) - 1
  const [index, setIndex] = useState(
    photoNumber !== undefined ? photoNumber : -1,
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full">
        <PhotoAlbum
          photos={photos.map((photo) => ({
            height: 256,
            width: 384,
            title: photo.originalName,
            alt: photo.originalName,
            key: photo.id,
            imageUrlId: `/images/${
              photo.photoVersions.find(
                (photoVersion) => photoVersion.type === 'miniature',
              )?.s3Key
            }`,
            eventId,
          }))}
          layout="rows"
          onClick={({ index }) => setIndex(index)}
          targetRowHeight={256}
          renderRowContainer={({
            rowContainerProps: { ...rowContainerProps },
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
      <Lightbox
        slides={
          photos.map((photo, idx) => ({
            src: `/images/${
              photo.photoVersions.find(
                (photoVersion) => photoVersion.type === 'original',
              )?.s3Key
            }`,
            alt: photo.originalName,
            title: photo.originalName,
            share: {
              url: `https://www.vallimfotografia.com.br/event/${year}/${slug}?photo=${idx}`,
              title: eventId,
              text: `Olha essa foto do evento ${eventId}`,
            },
            thumbnail: `/images/${
              photo.photoVersions.find(
                (photoVersion) => photoVersion.type === 'thumbnail',
              )?.s3Key
            }`,
          })) as Slide[]
        }
        on={{
          view: ({ index }) => {
            setIndex(index)
          },
        }}
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
      />
    </div>
  )
}
