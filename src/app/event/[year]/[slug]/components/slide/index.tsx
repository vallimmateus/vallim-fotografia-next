import Image from 'next/image'
import type { RenderSlideProps, Slide } from 'yet-another-react-lightbox'
import { usePhoto } from '@/hooks/usePhoto'
import { FaceHoverCard } from './faceHoverCard'
import { CurrentPhotoIdProvider } from '@/context/useCurrentPhotoId'

export function Slide({ slide, offset }: RenderSlideProps<Slide>) {
  const { usePhotoFaces } = usePhoto()
  const { data: faces, isLoading: isLoadingFaces } = usePhotoFaces(
    slide.photoId,
  )

  if (slide.type !== 'image') {
    return null
  }

  return (
    <CurrentPhotoIdProvider photoId={slide.photoId}>
      <div
        className="relative flex max-h-full max-w-full items-center justify-center"
        style={{
          aspectRatio: `${slide.width} / ${slide.height}`,
        }}
      >
        {faces &&
          offset === 0 &&
          !isLoadingFaces &&
          faces.length > 0 &&
          faces
            .sort((a, b) => a.boundingBoxLeft - b.boundingBoxLeft)
            .map((face, index) => (
              <FaceHoverCard
                key={face.id}
                faceId={face.id}
                index={index}
                callbackUrl={slide.share.url}
              />
            ))}
        <Image
          src={slide.src}
          alt={slide.alt || slide.title?.toString() || ''}
          draggable={false}
          className="h-full w-full object-contain"
          width={slide.width}
          height={slide.height}
          style={{
            maxWidth: `min(100%, ${slide.width}px)`,
            maxHeight: `min(100%, ${slide.height}px)`,
          }}
        />
      </div>
    </CurrentPhotoIdProvider>
  )
}
