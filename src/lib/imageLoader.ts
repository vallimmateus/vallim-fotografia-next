import { ImageLoaderProps } from "next/image"

export function imageLoader({ src, width }: ImageLoaderProps) {
  return `https://lh4.googleusercontent.com/d/${src}${width && `=w${width}`}`
}
