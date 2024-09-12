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
// import { PhotoWithUrlSigneds } from '@/types'
import { Photo as PhotoProps } from 'react-photo-album'

const Photo = React.memo((props: ImageProps) => {
  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      unoptimized={props.unoptimized}
      loading="lazy"
      // className="w-full object-cover"
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
    !isImageSlide(slide) ||
    (slide.width && typeof slide.width !== 'number') ||
    (slide.height && typeof slide.height !== 'number') ||
    typeof rect === 'undefined'
  )
    return undefined
  console.log('B')

  const width =
    !cover && slide.width && slide.height
      ? Math.round(
          Math.min(rect.width, (rect.height / slide.height) * slide.width),
        )
      : rect.width

  const height =
    !cover && slide.width && slide.height
      ? Math.round(
          Math.min(rect.height, (rect.width / slide.width) * slide.height),
        )
      : rect.height

  return (
    <div
      className="border-8 border-red-700"
      style={{ position: 'relative', width, height }}
    >
      <Photo
        src={slide.thumbnail || slide.src}
        alt={slide.alt || ''}
        width={slide.width || rect.width}
        height={slide.height || rect.height}
        loading="eager"
        draggable={false}
        // placeholder={slide.blurDataURL ? 'blur' : undefined}
        style={{
          objectFit: cover ? 'cover' : 'contain',
          cursor: click ? 'pointer' : undefined,
        }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={() => click?.({ index: currentIndex })}
        onError={slide.onError}
      />
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
}: {
  photo: PhotoProps
  onClick: DOMAttributes<HTMLDivElement>['onClick']
}) {
  return (
    <div
      onClick={onClick}
      className="aspect-[3/2] cursor-pointer overflow-hidden rounded-md transition-all hover:shadow-lg hover:shadow-zinc-900"
    >
      <Photo
        src={photo.imageUrlId as string}
        alt={photo.alt || photo.title || ''}
        width={(256 * 3) / 2}
        height={256}
        // onError={() => reloadSignedUrls(photo.name)}
      />
    </div>
  )
}

export { Photo, NextJsImage, NextJsThumbnail, ImageCard }
