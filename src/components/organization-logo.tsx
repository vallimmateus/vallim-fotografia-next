import Image from 'next/image'
import Link from 'next/link'

import { Organization } from '@prisma/client'

type OrganizationProps = {
  organization: Organization
}

export async function OrganizationLogo({
  organization: { slug, name, logoS3Key },
}: OrganizationProps) {
  return (
    <Link href={`/organization/${slug}`}>
      <Image
        // loader={imageLoader}
        width={128}
        height={128}
        src={`/images/${logoS3Key}`}
        alt={name}
        className="h-32 w-32 object-contain drop-shadow-[0_0_5px_#e4e4e770] transition-all hover:scale-105"
      />
    </Link>
  )
}
