import React, { useState } from 'react'
import { Pencil2Icon, PersonIcon, TrashIcon } from '@radix-ui/react-icons'

import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore/lite'
import { Textarea } from '../ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { Photo } from '@/types'
import { GlobalProps } from '@/features/GlobalProps/GlobalProps'

interface CommentCardProps {
  comment: {
    id: string
    comment: string
    email: string
    createdAt: string
    updatedAt?: string
  }
  id: string
  docId: string
  handleDeleteComment: () => void
  editable?: boolean
}

export function CommentCard({
  comment,
  id,
  docId,
  handleDeleteComment,
  editable,
}: CommentCardProps) {
  const [commentText, setCommentText] = useState(comment.comment)
  const [commentEditText, setCommentEditText] = useState(comment.comment)
  const [editing, setEditing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | undefined>(
    comment.updatedAt ? new Date(comment.updatedAt) : undefined,
  )
  const [loading, setLoading] = useState(false)

  const { users } = GlobalProps.use()

  const createdAt = new Date(comment.createdAt)

  const handleEditComment = async () => {
    if (commentEditText.length === 0) {
      return
    }
    setLoading(true)
    const newUpdatedAt = new Date()
    setUpdatedAt(newUpdatedAt)
    setCommentText(commentEditText)
    setEditing(false)
    try {
      const docRef = doc(db, 'photos', docId)
      const docSnap = await getDoc(docRef)
      const docData = docSnap.data() as Omit<Photo, 'id' | 'comments'> & {
        comments: {
          id: string
          comment: string
          email: string
          createdAt: Timestamp
          updatedAt?: Timestamp
        }[]
      }
      if (docData.comments) {
        const commentIndex = docData.comments.findIndex(
          (comment) => comment.id === id,
        )
        docData.comments[commentIndex].comment = commentEditText
        docData.comments[commentIndex].updatedAt =
          Timestamp.fromDate(newUpdatedAt)
        await setDoc(docRef, docData)
      }
    } catch {
      setUpdatedAt(updatedAt)
      setCommentText(commentText)
    } finally {
      setLoading(false)
    }
  }

  const user = users.find((user) => user.email === comment.email)

  return (
    <div className="m-2 flex gap-3 rounded-md bg-zinc-700 p-2">
      <Avatar className="h-6 w-6">
        {user && <AvatarImage src={user?.image} alt={user?.nickname} />}
        <AvatarFallback>
          <PersonIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      {!editing ? (
        <div className="my-auto flex flex-1 flex-col items-center justify-center gap-2">
          <p className="w-full text-start text-sm text-zinc-100">
            <span className="text-zinc-400">
              {comment?.email === 'anonymous' ? 'Anônimo' : user?.nickname}
              {': '}
            </span>
            {commentText}
          </p>
          <div className="flex w-full">
            {editable && (
              <Button
                className="max-h-5 w-fit gap-1 px-1.5 py-1 text-[0.5rem]"
                variant="ghost"
                onClick={() => setEditing(true)}
              >
                <Pencil2Icon className="h-3 w-3" />
                Editar
              </Button>
            )}
            {editable && (
              <Button
                className="max-h-5 w-fit gap-1 px-1.5 py-1 text-[0.5rem]"
                variant="ghost"
                onClick={() => handleDeleteComment()}
              >
                <TrashIcon className="h-3 w-3" />
                Deletar
              </Button>
            )}
            <p className="flex-1 cursor-default text-end text-[0.5rem] text-muted-foreground">
              {updatedAt
                ? updatedAt.toLocaleString()
                : createdAt.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="my-auto flex flex-1 flex-col items-center justify-center gap-2">
          <Textarea
            value={commentEditText}
            onChange={(e) => {
              setCommentEditText(e.target.value)
            }}
            disabled={loading}
          />
          <Button
            className="h-4 w-fit gap-1 px-2 py-1 text-[0.5rem]"
            onClick={handleEditComment}
            disabled={loading}
            variant="ghost"
          >
            Salvar
          </Button>
        </div>
      )}
    </div>
  )
}
