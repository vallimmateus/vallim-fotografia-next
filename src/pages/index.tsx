import type { InferGetStaticPropsType } from 'next'

import Head from 'next/head'
import PartyCard from '../components/partyCard'
import { GlobalProps } from '@/features/GlobalProps/GlobalProps'

export const getStaticProps = GlobalProps.getStaticProps(async () => ({
  props: {},
}))

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

export default function Home({ parties }: PageProps) {
  return (
    <>
      <Head>
        <title>Vallim Fotografia</title>
        <meta property="og:title" content="Vallim Fotografia" />
        <meta
          property="og:description"
          content="Site para divulgação de todas as fotos tiradas em eventos."
        />
        <meta property="og:image" content="/logo_square.jpg" />
      </Head>
      <main className="flex flex-col items-center">
        <div className="max-w-screen mx-16 mt-14 flex flex-row flex-wrap justify-center max-sm:mx-4">
          {parties.map((party, idx) => {
            return (
              <PartyCard
                date={party.date}
                cover={party.cover}
                name={party.name}
                publishDate={party.publishDate}
                id={party.id}
                key={party.id}
                priority={idx <= 7}
              />
            )
          })}
        </div>
      </main>
    </>
  )
}
