import { DocumentReference } from 'firebase/firestore'
import { Photo as PhotoPrismaType } from '@prisma/client'

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

type CommentFS = {
  id: string
  comment: string
  email: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

type ReportFS = {
  id: string
  report: string
  email: string
  createdAt: Timestamp
}

type PhotoFS = {
  ref: DocumentReference
  comments?: CommentFS[]
  likes?: Like[]
  reports?: ReportFS[]
}

type PhotoWithUrlSigneds = PhotoPrismaType & {
  signedUrlOriginal: string
  signedUrlMiniature: string
  signedUrlThumbnail: string
}
