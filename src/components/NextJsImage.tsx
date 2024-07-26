import Image from 'next/image'
import type { RenderPhotoProps } from 'react-photo-album'

export default function NextJsImage({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle,
  layout: { index },
}: RenderPhotoProps) {
  return (
    <div
      className="overflow-hidden rounded"
      style={{ ...wrapperStyle, position: 'relative' }}
    >
      <div className="absolute aspect-square min-h-fit min-w-fit rounded-full bg-red-500 p-2">
        <p>{index.toString()}</p>
      </div>
      <Image
        fill
        src={photo}
        unoptimized
        loading="lazy"
        placeholder={'blurDataURL' in photo ? 'blur' : undefined}
        {...{ alt, title, sizes, className, onClick }}
      />
    </div>
  )
}
