import clsx from 'clsx'
import Link from 'next/link'
import Image from 'next/image'
import { ReactNode, useEffect, useState } from 'react'
import { Inter, Rubik, Oswald } from 'next/font/google'
import { LiveSearch } from './LiveSearch'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
})
const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
})

type LayoutProps = {
  parties: { parties: Party[] }
  children: ReactNode
}

export default function Layout({ parties, children }: LayoutProps) {
  const [results, setResults] = useState<Party[]>()
  const [selectedParty, setSelectedParty] = useState<Party>()

  type changeHandler = React.ChangeEventHandler<HTMLInputElement>
  const handleChange: changeHandler = ({ target }) => {
    if (!target.value.trim()) {
      return setResults([])
    }
    const filteredValue = parties.parties.filter((party) =>
      party.name.toLowerCase().startsWith(target.value),
    )
    setResults(filteredValue)
  }

  const [clientWindowHeight, setClientWindowHeight] = useState(0)

  const handleScroll = () => {
    setClientWindowHeight(window.scrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  })
  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-50 flex w-screen flex-row items-center justify-center bg-zinc-950 shadow-lg shadow-black transition-all',
          {
            'h-20': clientWindowHeight <= 50,
            'h-14': clientWindowHeight > 50,
          },
        )}
      >
        {/* <div className='flex flex-row justify-between mx-12 max-w-3xl w-full'> */}
        <div className="flex w-full max-w-screen-xl items-center justify-between p-4 max-xl:px-10">
          <Link href="/">
            <Image
              className="max-sm:hidden"
              src="/vallim-fotografia.svg"
              alt="Vallim Fotografia logo"
              width={150}
              height={60}
            />
            <Image
              className="sm:hidden"
              src="/logo.svg"
              alt="Vallim Fotografia logo"
              width={98}
              height={60}
            />
          </Link>
          {/* <ul className="flex items-center gap-5">
            <Link href="/">Festas</Link>
            <Link href="/about">Sobre mim</Link>
          </ul> */}
          <div>
            <LiveSearch
              results={results}
              onChange={handleChange}
              onSelect={(item) => setSelectedParty(item)}
              value={selectedParty?.name}
              renderItem={(item) => {
                return <p>{item.name}</p>
              }}
            />
          </div>
        </div>
      </header>
      <main
        className={`${inter.variable} ${rubik.variable} ${oswald.variable}`}
      >
        {children}
      </main>
    </>
  )
}
