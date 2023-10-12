import { DocumentReference } from 'firebase/firestore/lite'

type MultiFid = {
  fid: string
  name: string
}

type Party = {
  id: string
  fid: string | MultiFid[]
  name: string
  cover: string
  date: string
  publishDate: string | null
}

type Comment = {
  id: string
  comment: string
  email: string
  createdAt: string
  updatedAt?: string
}

type Like = {
  email: string
}

type Report = {
  id: string
  report: string
  email: string
  createdAt: string
}

type Photo = {
  id: string
  ref: DocumentReference
  comments?: Comment[]
  likes?: Like[]
  reports?: Report[]
}

type User = {
  id: string
  email: string
  image: string
  name: string
  nickname: string
  role?: 'admin' | 'editor'
}

type GlobalProps = {
  parties: Party[]
  photos: Photo[]
  users: User[]
}
