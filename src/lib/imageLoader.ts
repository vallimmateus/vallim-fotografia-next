import { ImageLoaderProps } from 'next/image'
import { z } from 'zod'

export function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.includes('googleusercontent.com')) {
    return `${src}${width && `=w${width}`}`
    // } else if (src.includes('r2.cloudflarestorage.com')) {
    //   if (src.includes('&w=') && width) {
    //     src = src.replace(/&w=\d{1,}/, `&w=${width}`)
    //   } else if (width) {
    //     src = `${src}&w=${width}`
    //   }
    //   if (src.includes('&q=') && quality) {
    //     src = src.replace(/&q=\d{1,}/, `&q=${quality}`)
    //   } else if (quality) {
    //     src = `${src}&q=${quality}`
    //   }
    //   return src
  } else {
    // 1yJihankBNS_ythlX5enl-r_qalIDvAWF
    const googleIdSchema = z.string().length(33)
    if (googleIdSchema.safeParse(src).success) {
      return `https://lh4.googleusercontent.com/d/${src}${
        width && `=w${width}`
      }`
    } else {
      return src
    }
  }
}

const hoursInSeconds = 60 ** 2

export async function loaderR2({ src }: ImageLoaderProps) {
  const photo = src
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL

  const response = await fetch(
    `${baseUrl}/api/get-signed-url?${new URLSearchParams({
      photo,
    })}`,
    {
      method: 'GET',
      next: {
        revalidate: 2 * hoursInSeconds,
      },
    },
  )

  const url: {
    signedUrl: string
    message: string
  } = await response.json()

  return url.signedUrl
}
