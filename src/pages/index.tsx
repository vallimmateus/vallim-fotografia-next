import type { GetStaticProps } from 'next';
import { collection, getDocs } from 'firebase/firestore/lite';

import {db} from "../lib/db.js"
import PartyCard from '../components/partyCard';

export interface MultiFid {
  fid: string,
  name: string
}

export interface Party {
  fid: string | MultiFid[],
  name: string,
  cover: string,
  date: string,
  publishDate: string | null
}

export interface Parties {
  parties: {
    id: string,
    fid: string | MultiFid[],
    name: string,
    cover: string,
    date: string,
    publishDate: string | null}[]
}


export const getStaticProps: GetStaticProps<Parties> = async () => {
  const partiesCol = collection(db, 'parties');
  const partySnapshot = await getDocs(partiesCol);
  const partyList: Parties = {parties: partySnapshot.docs.map(doc => {
    const data = doc.data() as Party
    return {id: doc.id, ...data}
  })}
  const partyListSorted = partyList.parties.sort((a, b) => {return (a.date < b.date) ? 1 : -1})

  return { props: { parties: partyListSorted }, revalidate: 60*60*24}
}

export default function Home({parties}: Parties) {
  return (
    <main className="flex flex-col items-center">
      <h1>Home</h1>
      <div className='mt-14 flex flex-row gap-10 max-w-screen flex-wrap mx-16 justify-center'>
        {parties?.length === 0 ? (
          <div>Loading...</div>
        ) : (
          parties?.map((party) => {
            return (
                <PartyCard
                  date={party.date}
                  cover={party.cover}
                  name={party.name}
                  isNew={!party.publishDate}
                  id={party.id}
                  key={party.id} />
            )
          })
          )}
      </div>
    </main>
  )
}
