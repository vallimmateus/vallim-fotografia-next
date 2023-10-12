import {
  DocumentReference,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore/lite'
import { db } from '@/lib/db'
import { GlobalProps, Party, Photo, User } from '@/types'

export async function fetchGlobalProps(): Promise<GlobalProps> {
  const partiesCol = collection(db, 'parties')
  const partySnapshot = await getDocs(partiesCol)

  const photosCol = collection(db, 'photos')
  const photosSnapshot = await getDocs(photosCol)

  const usersCol = collection(db, 'users')
  const usersSnapshot = await getDocs(usersCol)

  const collections: GlobalProps = {
    parties: partySnapshot.docs
      .map((doc) => {
        const data = doc.data() as Party
        return { ...data, id: doc.id }
      })
      .sort((a, b) => {
        return a.date < b.date ? 1 : -1
      }),
    photos: photosSnapshot.docs.map((doc) => {
      let { ref, ...data } = doc.data()
      ref = JSON.parse(JSON.stringify(ref)) as DocumentReference
      if (data.comments) {
        data.comments.map((comment) => {
          const createdAt = comment.createdAt as Timestamp
          comment.createdAt = createdAt.toDate().toISOString()
          if (comment?.updatedAt) {
            const updatedAt = comment.updatedAt as Timestamp
            comment.updatedAt = updatedAt.toDate().toISOString()
          }
          return comment
        })
      }
      return { ...data, ref, id: doc.id } as Photo
    }),
    users: usersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return { ...data, id: doc.id } as User
    }),
  }
  return collections
}
