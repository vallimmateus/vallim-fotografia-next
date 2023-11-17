import Image from "next/image"
import type { RenderPhotoProps } from "react-photo-album"

import { Trash2Icon } from "lucide-react"

export default function NextJsImage({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle
}: RenderPhotoProps) {
  return (
    <div
      className="relative overflow-hidden rounded"
      style={{ ...wrapperStyle }}
    >
      <div className="absolute right-1 top-1 z-10 cursor-pointer rounded-full bg-gray-800 p-2 transition-all hover:bg-red-700">
        <Trash2Icon width={20} height={20} onClick={() => {}} />
      </div>
      <Image
        fill
        src={photo}
        unoptimized={true}
        loading="lazy"
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
        {...{ alt, title, sizes, className, onClick }}
      />
    </div>
  )
}
