import { collection, getDocs } from 'firebase/firestore/lite'
import { db } from '@/lib/db'

export async function fetchGlobalProps(): Promise<GlobalProps> {
  const partiesCol = collection(db, 'parties')
  const partySnapshot = await getDocs(partiesCol)
  const partyList: GlobalProps = {
    parties: partySnapshot.docs.map((doc) => {
      const data = doc.data() as Party
      return { ...data, id: doc.id }
    }),
  }
  const partyListSorted = partyList.parties.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })

  return { parties: partyListSorted }
}
