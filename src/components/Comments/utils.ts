import { Timestamp } from 'firebase/firestore'
import { Comment, Photo, Report, CommentFS, PhotoFS, ReportFS } from '@/types'

type transformToFirestoreProps = {
  id: string
  data: PhotoFS
}

type transformToNextProps = {
  data: Photo
}

export const transformToFirestore = (
  data: Photo,
): transformToFirestoreProps => {
  let dataFS: PhotoFS = { ref: data.ref }
  if (data?.comments) {
    const newComments: CommentFS[] = data.comments.map((comment) => {
      const {
        // eslint-disable-next-line unused-imports/no-unused-vars
        updatedAt: oldUpdatedAt,
        // eslint-disable-next-line unused-imports/no-unused-vars
        createdAt: oldCreatedAt,
        ...rest
      } = comment
      const createdAt = Timestamp.fromDate(new Date(comment.createdAt))
      if (comment?.updatedAt) {
        const updatedAt = Timestamp.fromDate(new Date(comment.updatedAt))
        return { ...rest, createdAt, updatedAt }
      }
      return { ...rest, createdAt }
    })
    dataFS = { ...dataFS, comments: newComments }
  }
  if (data?.reports) {
    const newReports: ReportFS[] = data.reports.map((report) => {
      const { createdAt: _, ...rest } = report
      const createdAt = Timestamp.fromDate(new Date(report.createdAt))
      return { ...rest, createdAt }
    })
    dataFS = { ...dataFS, reports: newReports }
  }
  if (data?.likes) {
    dataFS = { ...dataFS, likes: data.likes }
  }
  return { id: data.id, data: dataFS }
}

export const transformToNext = (
  data: PhotoFS,
  id: string,
): transformToNextProps => {
  let dataNext: Photo = { id, ref: data.ref }
  if (data?.comments) {
    const newComments: Comment[] = data.comments.map((comment) => {
      const {
        // eslint-disable-next-line unused-imports/no-unused-vars
        updatedAt: oldUpdatedAt,
        // eslint-disable-next-line unused-imports/no-unused-vars
        createdAt: oldCreatedAt,
        ...rest
      } = comment
      const createdAt = (comment.createdAt as Timestamp).toDate().toISOString()
      if (comment?.updatedAt) {
        const updatedAt = (comment.updatedAt as Timestamp)
          .toDate()
          .toISOString()
        return { ...rest, createdAt, updatedAt }
      }
      return { ...rest, createdAt }
    })
    dataNext = { ...dataNext, comments: newComments }
  }
  if (data?.reports) {
    const newReports: Report[] = data.reports.map((report) => {
      const { createdAt: _, ...rest } = report
      const createdAt = (report.createdAt as Timestamp).toDate().toISOString()
      return { ...rest, createdAt }
    })
    dataNext = { ...dataNext, reports: newReports }
  }
  if (data?.likes) {
    dataNext = { ...dataNext, likes: data.likes }
  }
  return { data: dataNext }
}
