import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ContentLoader from 'react-content-loader'
import { imageLoader } from '@/lib/imageLoader'

interface PartyCardProps {
  id: string
  cover: string
  date: string
  name: string
  publishDate: string | null
  priority?: boolean
}

// const card = tv({
//   base: '',
//   variants: {
//     isPublished: {
//       default: '',
//     },
//   },
// })

export default function PartyCard({
  id,
  date,
  cover,
  name,
  publishDate,
  priority = false,
}: PartyCardProps) {
  const isPublished = !!publishDate
  const [isNew, setIsNew] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (publishDate) {
      const publishTime = new Date(publishDate)
      const today = new Date()
      const diffDates =
        (today.getTime() - publishTime.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDates < 8) {
        setIsNew(true)
      }
    }
  }, [publishDate])

  return (
    <div className="z-10 aspect-[10/9] w-full px-4 pb-3 max-md:w-1/2 max-md:px-2 md:w-1/3 lg:w-1/4">
      <div className="group relative">
        <Link href={isPublished ? `/party/${id}` : ''}>
          {!isPublished && !isLoading && (
            <p className="absolute -right-2 -top-2 z-50 rounded-md bg-slate-700 px-3 py-2 shadow-lg transition-all group-hover:-right-3 group-hover:-top-3">
              Em breve
            </p>
          )}
          {isNew && !isLoading && (
            <p className="absolute -right-2 -top-2 z-50 rounded-md bg-purple-800 px-3 py-2 shadow-lg transition-all group-hover:-right-3 group-hover:-top-3">
              Novo!
            </p>
          )}
          <div className="flex flex-col overflow-hidden rounded-lg border-2 border-black bg-zinc-950 transition-all hover:shadow-lg hover:shadow-zinc-800">
            <div className="relative w-full overflow-hidden transition-all group-hover:brightness-95">
              {isLoading ? (
                <ContentLoader
                  viewBox="0 0 420 280"
                  backgroundColor="rgb(63, 63, 70)"
                  foregroundColor="rgb(39, 39, 42)"
                  style={{ position: 'absolute', zIndex: 1 }}
                >
                  <rect x="0" y="0" width="420" height="280" />
                </ContentLoader>
              ) : (
                ''
              )}
              <Image
                loader={imageLoader}
                src={cover}
                alt={`Cover image for party ${name}.`}
                width={420}
                height={280}
                priority={priority}
                className={
                  (!isPublished ? 'blur-md ' : '') + (isLoading && 'opacity-0')
                }
                onLoad={() => {
                  setIsLoading(false)
                }}
              />
            </div>
            <div className="mx-5 my-3 flex flex-col max-sm:mx-2.5 max-sm:my-2">
              {isLoading ? (
                <ContentLoader
                  width={120}
                  viewBox="0 0 120 24"
                  backgroundColor="rgb(63, 63, 70)"
                  foregroundColor="rgb(39, 39, 42)"
                >
                  <rect x="0" y="4" width="120" height="16" />
                </ContentLoader>
              ) : (
                <p className="text-base font-bold text-zinc-200 transition-all group-hover:pl-0.5 group-hover:text-white max-sm:text-sm">
                  {name}
                </p>
              )}
              {isLoading ? (
                <ContentLoader
                  width={68}
                  viewBox="0 0 68 16"
                  backgroundColor="rgb(63, 63, 70)"
                  foregroundColor="rgb(39, 39, 42)"
                >
                  <rect x="0" y="2" width="68" height="12" />
                </ContentLoader>
              ) : (
                <p className="text-xs text-zinc-400 transition-all group-hover:pl-1">
                  {date}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
