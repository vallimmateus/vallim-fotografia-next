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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <div className='h-10 flex flex-row justify-center'>
          <div className='flex flex-row justify-between mx-12 max-w-3xl w-full'>
            <Image
              src="/vercel.svg"
              alt="Vallim Fotografia logo"
              width={83}
              height={20} />
            <ul className='flex gap-3'>
              <Link href="/">Home</Link>
              <Link href="/about">Sobre mim</Link>
              <Link href="/party">Festas</Link>
            </ul>
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}
