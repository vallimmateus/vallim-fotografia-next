'use client'
import { ScrollArea } from '@/components/ui/scroll-area'

import { User } from '@prisma/client'
import CommentCard from './commentCard'
import { CommentWithUserType } from './commentsContext'

type CommentsListProps = {
  comments: CommentWithUserType[]
  getComments: () => void
  getUser: () => Promise<User>
}

export default function CommentsList({
  comments,
  getComments,
  getUser,
}: CommentsListProps) {
  return (
    <ScrollArea className="-mt-6 flex-1">
      {comments.map((comment) => (
        <CommentCard
          comment={comment}
          key={comment.id}
          getComments={getComments}
          getUser={getUser}
        />
      ))}
    </ScrollArea>
  )
}
