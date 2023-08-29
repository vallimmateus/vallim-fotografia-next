import { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Inter, Rubik } from 'next/font/google'
import Image from 'next/image'

import { clsx } from "clsx";

const inter = Inter({ subsets: ['latin'] })
const rubik = Rubik({ subsets: ['latin'] })

import './globals.css'

export const metadata: Metadata = {
  title: 'Vallim Fotografia',
  description: 'Fotógrafo amador da universidade EEL-USP',
}

export default function App({ Component, pageProps }: AppProps) {
  const [clientWindowHeight, setClientWindowHeight] = useState(0);
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const handleScroll = () => {
    setClientWindowHeight(window.scrollY);
  };

  return (
    <div className={`${inter.className} bg-zinc-900 text-white`}>
      <header className={clsx('flex flex-row w-screen justify-center items-center bg-zinc-950 shadow-lg shadow-black z-10 sticky top-0 transition-all', {
        "h-20": clientWindowHeight <= 50,
        "h-14": clientWindowHeight > 50
      })}>
        <div className='flex flex-row justify-between mx-12 max-w-3xl w-full'>
          <Link href="/">
            <Image
              src="/vallim-fotografia.svg"
              alt="Vallim Fotografia logo"
              width={150}
              height={60} />
          </Link>
          <ul className='flex gap-5 items-center'>
            <Link href="/">Home</Link>
            <Link href="/about">Sobre mim</Link>
            <Link href="/party">Festas</Link>
          </ul>
        </div>
      </header>
      <Component {...pageProps} />
    </div>
  )
}
