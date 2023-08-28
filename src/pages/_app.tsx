import type { AppProps } from 'next/app'
 
// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />
// }

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vallim Fotografia',
  description: 'Fotógrafo amador da universidade EEL-USP',
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.className} bg-black text-white`}>
      <div className='h-16 flex flex-row justify-center'>
        <div className='flex flex-row justify-between mx-12 max-w-3xl w-full'>
          <Image
            src="/vallim-fotografia.svg"
            alt="Vallim Fotografia logo"
            width={150}
            height={60} />
          <ul className='flex gap-3'>
            <Link href="/">Home</Link>
            <Link href="/about">Sobre mim</Link>
            <Link href="/party">Festas</Link>
          </ul>
        </div>
      </div>
      <Component {...pageProps} />
    </div>
  )
}
