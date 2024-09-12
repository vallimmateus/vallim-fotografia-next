'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Organization } from '@prisma/client'
import { Suspense } from 'react'

type OrganizationProps = {
  organization: Organization & {
    signedUrl: string
  }
}

export async function OrganizationLogo({
  organization: { slug, name, signedUrl },
}: OrganizationProps) {
  return (
    <Suspense fallback={<h2>{name}</h2>}>
      <Link href={`/organization/${slug}`}>
        <Image
          // loader={imageLoader}
          width={128}
          height={128}
          src={signedUrl}
          alt={name}
          className="h-32 w-32 object-contain drop-shadow-[0_0_5px_#e4e4e770] transition-all hover:scale-105"
        />
      </Link>
    </Suspense>
  )
}
