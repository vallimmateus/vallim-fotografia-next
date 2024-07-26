import Image, { ImageProps } from 'next/image'
import React, { DOMAttributes } from 'react'

import {
  RenderSlideProps,
  RenderThumbnailProps,
  Slide,
  isImageFitCover,
  isImageSlide,
  useLightboxProps,
  useLightboxState,
} from 'yet-another-react-lightbox'
import { PhotoWithUrlSigneds } from '@/types'

const Photo = React.memo((props: ImageProps) => {
  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      unoptimized={props.unoptimized}
      loading="lazy"
    />
  )
})

Photo.displayName = 'Photo'

function NextJsThumbnail({ slide, rect, imageFit }: RenderThumbnailProps) {
  const {
    on: { click },
  } = useLightboxProps()

  const { currentIndex } = useLightboxState()

  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit)

  if (
    !(
      isImageSlide(slide) &&
      typeof slide.width === 'number' &&
      typeof slide.height === 'number' &&
      typeof rect !== 'undefined'
    )
  )
    return undefined

  const width = !cover
    ? Math.round(
        Math.min(rect.width, (rect.height / slide.height) * slide.width),
      )
    : rect.width

  const height = !cover
    ? Math.round(
        Math.min(rect.height, (rect.width / slide.width) * slide.height),
      )
    : rect.height

  return (
    <div
      className="border-8 border-red-700"
      style={{ position: 'relative', width, height }}
    >
      <p>{slide.thumbnail || slide.src}</p>
      {/* <Photo
        src={slide.thumbnail || slide.src}
        alt={slide.alt || ''}
        width={slide.width}
        height={slide.height}
        loading="eager"
        draggable={false}
        placeholder={slide.blurDataURL ? 'blur' : undefined}
        style={{
          objectFit: cover ? 'cover' : 'contain',
          cursor: click ? 'pointer' : undefined,
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={
          offset === 0 ? () => click?.({ index: currentIndex }) : undefined
        }
        onError={slide.onError}
      /> */}
    </div>
  )
}

function NextJsImage({
  slide,
  offset,
  rect,
}: RenderSlideProps<Slide>): React.ReactNode {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps()

  const { currentIndex } = useLightboxState()

  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit)
  if (
    !(
      isImageSlide(slide) &&
      typeof slide.width === 'number' &&
      typeof slide.height === 'number' &&
      typeof rect !== 'undefined'
    )
  )
    return undefined

  const width = !cover
    ? Math.round(
        Math.min(rect.width, (rect.height / slide.height) * slide.width),
      )
    : rect.width

  const height = !cover
    ? Math.round(
        Math.min(rect.height, (rect.width / slide.width) * slide.height),
      )
    : rect.height
  return (
    <div
      className="relative overflow-hidden rounded border-8 border-red-700"
      style={{ width, height }}
    >
      <Photo
        src={slide.src}
        alt={slide.alt || ''}
        width={slide.width}
        height={slide.height}
        loading="eager"
        draggable={false}
        placeholder={'blurDataURL' in slide ? 'blur' : undefined}
        style={{
          objectFit: cover ? 'cover' : 'contain',
          // cursor: click ? 'pointer' : undefined,
          cursor: 'pointer',
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={
          offset === 0 ? () => click?.({ index: currentIndex }) : undefined
        }
        onError={slide.onError}
      />
    </div>
  )
}

function ImageCard({
  photo,
  onClick,
  reloadSignedUrls,
}: {
  photo: PhotoWithUrlSigneds
  onClick: DOMAttributes<HTMLDivElement>['onClick']
  reloadSignedUrls: (name: string) => Promise<void>
}) {
  return (
    <div
      onClick={onClick}
      className="relative aspect-[3/2] w-full cursor-pointer overflow-hidden rounded-md transition-all hover:shadow-lg hover:shadow-zinc-900"
    >
      <Photo
        src={photo.signedUrlMiniature}
        alt={photo.name}
        width={480}
        height={320}
        onError={() => reloadSignedUrls(photo.name)}
      />
    </div>
  )
}

export { Photo, NextJsImage, NextJsThumbnail, ImageCard }
