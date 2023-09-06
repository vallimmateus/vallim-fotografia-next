import { ImageLoaderProps } from 'next/image'

export function imageLoader({ src }: ImageLoaderProps) {
  return `https://drive.google.com/uc?id=${src}`
}
