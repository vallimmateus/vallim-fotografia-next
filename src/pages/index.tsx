import type { InferGetStaticPropsType } from 'next'

import PartyCard from '../components/partyCard'
import { GlobalProps } from '@/features/GlobalProps/GlobalProps'

export const getStaticProps = GlobalProps.getStaticProps(async () => ({
  props: {},
  revalidate: 60 * 60 * 24,
}))

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

export default function Home({ parties }: PageProps) {
  return (
    <main className="flex flex-col items-center">
      <div className="max-w-screen mx-16 mt-14 flex flex-row flex-wrap justify-center">
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
        {/* {parties?.length === 0 ? (
          <div>Loading...</div>
        ) : (
          
          )} */}
      </div>
    </main>
  )
}
