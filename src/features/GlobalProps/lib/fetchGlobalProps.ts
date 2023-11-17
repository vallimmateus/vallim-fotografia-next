import { db } from "@/lib/db"
import { CommentFS, GlobalProps, Party, Photo, User } from "@/types"
import {
  DocumentReference,
  Timestamp,
  collection,
  getDocs,
  onSnapshot
} from "firebase/firestore"

export async function fetchGlobalProps(): Promise<GlobalProps> {
  const partiesCol = collection(db, "parties")
  const partySnapshot = await getDocs(partiesCol)

  const photosCol = collection(db, "photos")
  const photosSnapshot = await getDocs(photosCol)

  let users: User[] = []
  const usersCol = collection(db, "users")
  onSnapshot(usersCol, (snap) => {
    users = snap.docs.map((doc) => {
      const data = doc.data() as Omit<User, "id">
      return { ...data, id: doc.id }
    })
  })
  // const usersSnapshot = await getDocs(usersCol)

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
      // eslint-disable-next-line prefer-const
      let { ref, ...data } = doc.data()
      ref = JSON.parse(JSON.stringify(ref)) as DocumentReference
      if (data.comments) {
        data.comments.map((comment: CommentFS) => {
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
    users
    // usersSnapshot.docs.map((doc) => {
    //   const data = doc.data()
    //   return { ...data, id: doc.id } as User
    // }),
  }
  return collections
}
