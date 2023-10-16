'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import clsx from 'clsx'
import Tilt from 'react-parallax-tilt'

import { imageLoader } from '@/lib/imageLoader'
import { Party } from '@/types'
import useWindowDimensions from '@/hooks/useWindowDimensions'

interface LastPartiesProps {
  parties: Party[]
}

export default function LastParties({ parties }: LastPartiesProps) {
  const { width } = useWindowDimensions()
  const [mapped, setMapped] = useState([parties[1], parties[0], parties[2]])
  useEffect(() => {
    if (width) {
      if (width >= 768) {
        setMapped([parties[1], parties[0], parties[2]])
      } else {
        setMapped([parties[0], parties[1], parties[2]])
      }
    }
  }, [width, parties])
  return (
    <div className="my-6 flex max-md:max-w-sm max-md:flex-col max-md:gap-6 md:w-[80%] md:max-w-7xl md:items-end">
      {mapped.map((party, idx) => {
        const isPublished = !!party.publishDate
        return (
          <Link key={party.id} href={isPublished ? `/parties/${party.id}` : ''}>
            <Tilt
              transitionSpeed={700}
              tiltMaxAngleX={5}
              tiltMaxAngleY={10}
              glareEnable
              perspective={1000}
              glareMaxOpacity={0.2}
              glareBorderRadius="6px"
              gyroscope={true}
              scale={1.1}
              className={clsx(
                'group relative flex aspect-[3/2] overflow-hidden rounded-md border-2 border-black shadow-xl shadow-black',
                {
                  'md:z-10 md:-mx-[10%] md:w-[120%]': idx === 1,
                  'md:mb-4 md:w-full': idx !== 1,
                },
              )}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="h-full w-full">
                <Image
                  loader={imageLoader}
                  src={party.cover}
                  alt={`Cover image for party ${party.name}.`}
                  width={420 * 1.5}
                  height={280 * 1.5}
                />
              </div>
              <div className="z-1 absolute flex h-full w-full flex-col items-center justify-end">
                <div className="mb-4 h-[50px] w-full max-w-[250px] rounded-md bg-zinc-400/30 p-4 backdrop-blur-sm transition-all group-hover:mb-0 group-hover:h-full group-hover:max-w-full group-hover:bg-zinc-600/30" />
              </div>
              <div className="z-1 absolute flex h-full w-full flex-col items-center justify-end [transform:_translateZ(60px)]">
                <div className="mb-4 flex h-[50px] w-full max-w-[250px] items-center justify-center">
                  <p className="text-xl font-bold text-primary">{party.name}</p>
                </div>
              </div>
            </Tilt>
          </Link>
        )
      })}
    </div>
  )
}
