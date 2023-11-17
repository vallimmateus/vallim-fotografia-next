"use client";
import Link from "next/link";
import Image from "next/image";
import Tilt from "react-parallax-tilt";

import { Event } from "@prisma/client";

import { imageLoader } from "@/lib/imageLoader";

interface LastEventsProps {
  event: Event;
}

export function LastEvent({ event }: LastEventsProps) {
  const isPublished = !!event.publishDate;
  return (
    <Link
      className="aspect-[3/2] h-full"
      key={event.id}
      href={
        isPublished ? `/event/${event.date.getFullYear()}/${event.slug}` : ""
      }
    >
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
        className="group relative flex rounded-xl"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="h-full w-full overflow-hidden rounded-xl border-2 border-black shadow-xl shadow-black">
          <Image
            loader={imageLoader}
            src={event.coverUrl}
            alt={`Cover image for event ${event.name}.`}
            width={420 * 1.5}
            height={280 * 1.5}
          />
        </div>
        <div className="z-1 absolute flex h-full w-full flex-col items-center justify-end [transform:_translateZ(60px)]">
          <div className="mb-8 flex max-h-[70px] min-h-[50px] w-full max-w-[250px] items-center justify-center rounded-md bg-zinc-400/30 p-4 backdrop-blur-sm transition-all group-hover:mb-0 group-hover:h-full group-hover:max-h-full group-hover:max-w-full group-hover:bg-zinc-600/30">
            {event.logoUrl ? (
              <Image
                loader={imageLoader}
                src={event.logoUrl}
                alt={`Logo image for event ${event.name}.`}
                width={250}
                height={250}
                className="h-full max-h-[250px] min-h-[70px] object-contain"
              />
            ) : (
              <p className="text-xl font-bold text-primary">{event.name}</p>
            )}
          </div>
        </div>
      </Tilt>
    </Link>
  );
}
