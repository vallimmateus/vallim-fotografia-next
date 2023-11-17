"use client";
import { imageLoader } from "@/lib/imageLoader";
import { Url } from "next/dist/shared/lib/router/router";
import Image from "next/image";
import Link from "next/link";

type OrganizationProps = {
  logoUrl: string;
  name: string;
  link: Url;
};

export function Organization({ logoUrl, name, link }: OrganizationProps) {
  return (
    <Link href={link}>
      <Image
        loader={imageLoader}
        width={128}
        height={128}
        src={logoUrl}
        alt={name}
        className="h-32 w-32 object-contain drop-shadow-[0_0_5px_#e4e4e770] transition-all hover:scale-105"
      />
    </Link>
  );
}
