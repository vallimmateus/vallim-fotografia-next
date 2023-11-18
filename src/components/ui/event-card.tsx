'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import ContentLoader from 'react-content-loader'

import { imageLoader } from '@/lib/imageLoader'
import { cn } from '@/lib/utils'

type EventCardProps = {
  date?: string
  name?: string
  cover?: string
  logo?: string[]
}

export default function EventCard({ cover, date, name, logo }: EventCardProps) {
  const [isLoadingCover, setIsLoadingCover] = useState(true)
  const [isLoadingName, setIsLoadingName] = useState(true)
  const [isLoadingDate, setIsLoadingDate] = useState(true)

  useEffect(() => {
    if (date) {
      setIsLoadingDate(false)
    } else {
      setIsLoadingDate(true)
    }
  }, [date])

  useEffect(() => {
    if (name) {
      setIsLoadingName(false)
    } else {
      setIsLoadingName(true)
    }
  }, [name])

  return (
    <div className="z-10 w-full max-w-sm">
      <div className="group relative">
        <div className="flex flex-col overflow-hidden rounded-lg border-2 border-black bg-zinc-950 transition-all hover:shadow-lg hover:shadow-zinc-800">
          <div className="absolute bottom-10 right-2 z-30 flex w-1/4 justify-center">
            {logo &&
              logo.length > 0 &&
              logo.map(
                (logoUrl, index) =>
                  logoUrl &&
                  logoUrl !== '' && (
                    <Image
                      loader={imageLoader}
                      alt={`Logo of organization`}
                      src={logoUrl}
                      width={40}
                      height={40}
                      className={cn('h-10 w-10 object-contain shadow', {
                        '-ml-5': index > 0,
                      })}
                      key={index}
                    />
                  ),
              )}
          </div>
          <div className="relative w-full overflow-hidden transition-all group-hover:brightness-95">
            {isLoadingCover && (
              <ContentLoader
                viewBox="0 0 420 280"
                backgroundColor="rgb(63, 63, 70)"
                foregroundColor="rgb(39, 39, 42)"
                className="absolute"
              >
                <rect x="0" y="0" width="420" height="280" />
              </ContentLoader>
            )}
            {cover && (
              <Image
                loader={imageLoader}
                src={cover}
                alt={`Cover image for party ${name}.`}
                width={420}
                height={280}
                className={cn({ 'opacity-0': isLoadingCover })}
                onLoad={() => {
                  setIsLoadingCover(false)
                }}
              />
            )}
          </div>
          <div className="mx-5 my-3 flex flex-col max-sm:mx-2.5 max-sm:my-2">
            {isLoadingName ? (
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
            {isLoadingDate ? (
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
      </div>
    </div>
  )
}
