'use client'
import { DownloadCloudIcon, Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import useDownloader from 'react-use-downloader'

type ImageDownloaderType = {
  imageUrlId: string
  eventName: string
  fileName: string
}

export default function ImageDownloader({
  imageUrlId,
  eventName,
  fileName,
}: ImageDownloaderType) {
  const { download, cancel, isInProgress } = useDownloader()
  return (
    <div className="max-w-1/3 group relative aspect-[3/2] overflow-hidden">
      <Image
        src={`https://lh4.googleusercontent.com/d/${imageUrlId}=w250`}
        alt={eventName}
        width={100}
        height={100}
        unoptimized
        className="h-auto w-auto object-cover"
      />
      {isInProgress ? (
        <div
          className="absolute right-1 top-1 flex h-fit w-fit cursor-pointer items-center justify-center rounded-full bg-zinc-300/50 p-1.5 group-hover:right-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:rounded-none group-hover:bg-zinc-300/70"
          onClick={cancel}
        >
          <Loader2Icon className="animate-spin" size={24} />
        </div>
      ) : (
        <div
          className="absolute right-1 top-1 flex h-fit w-fit cursor-pointer items-center justify-center rounded-full bg-zinc-300/50 p-1.5 group-hover:right-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:rounded-none group-hover:bg-zinc-300/70"
          onClick={() =>
            download(
              `https://lh4.googleusercontent.com/d/${imageUrlId}`,
              fileName,
            )
          }
        >
          <DownloadCloudIcon size={24} />
        </div>
      )}
    </div>
  )
}
