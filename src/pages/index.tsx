import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore/lite';

import {db} from "../lib/db.js"
import PartyCard from '../components/partyCard';

interface Party {
  fid: string | object,
  name: string,
  cover: string,
  date: string,
  publishDate: string | null
}

interface Parties {
  parties: Party[]
}

export async function getServerSideProps() {
  const partiesCol = collection(db, 'parties');
  const partySnapshot = await getDocs(partiesCol);
  const partyList = partySnapshot.docs.map(doc => doc.data());
  const partyListSorted = partyList.sort((a, b) => (a.date < b.date) ? 1 : -1)

  return { props: { parties: partyListSorted }}
}

export default function Home({parties}: Parties) {
  return (
    <main className="flex flex-col items-center">
      <h1>Home</h1>
      <div className='mt-14 flex flex-row gap-10 max-w-screen flex-wrap mx-16 justify-center'>
        {parties?.length === 0 ? (
          <div>Loading...</div>
        ) : (
          parties?.map((party, idx) => {
            return (
                <PartyCard
                  date={party.date}
                  cover={party.cover}
                  name={party.name}
                  fid={party.fid}
                  isNew={!party.publishDate}
                  key={idx} />
            )
          })
          )}
      </div>
    </main>
  )
}
