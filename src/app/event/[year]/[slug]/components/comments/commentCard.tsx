"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import { CommentWithUserType } from "./commentsContext"

import { Pencil2Icon, PersonIcon, TrashIcon } from "@radix-ui/react-icons"
import axios from "axios"
import { format } from "date-fns"

type CommentCardProps = {
  comment: CommentWithUserType
  getComments: () => void
  getUser: () => void
}

export default function CommentCard({
  comment: {
    id,
    text,
    createdAt,
    updatedAt,
    user: { image, name, nickname, email }
  },
  getComments,
  getUser
}: CommentCardProps) {
  const { data } = useSession()
  const [editing, setEditing] = useState(false)
  const [editable, setEditable] = useState(false)
  const [commentText, setCommentText] = useState(text)
  const [loading, setLoading] = useState(false)
  // const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    const user = getUser()
    console.log(user)
    setEditable(data?.user?.email === email)
  }, [data])

  const handleEditComment = async () => {
    if (commentText.length === 0) {
      return
    }
    setLoading(true)
    await axios
      .patch("/api/comments", { text: commentText, id })
      .then(() => {
        setLoading(false)
        text = commentText
        setEditing(false)
        getComments()
      })
      .catch((err) => {
        alert(err)
        setCommentText(text)
        setLoading(false)
        setEditing(false)
      })
  }

  const handleDeleteComment = async () => {
    if (confirm("Tem certeza que deseja deletar esse comentário?")) {
      await axios.delete("/api/comments", { data: { id } }).then(() => {
        // setIsDeleted(true);
        getComments()
      })
    }
  }

  // if (isDeleted) {
  //   return;
  // }

  return (
    <div className="m-2 flex gap-3 rounded-md bg-zinc-700 p-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={image} alt={nickname || name} />
        <AvatarFallback>
          <PersonIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      {!editing ? (
        <div className="my-auto flex flex-1 flex-col items-center justify-center gap-2">
          <p className="w-full text-start text-sm text-zinc-100">
            <span className="text-zinc-400">
              {nickname || name}
              {": "}
            </span>
            {commentText}
          </p>
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-1">
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
                  onClick={handleDeleteComment}
                >
                  <TrashIcon className="h-3 w-3" />
                  Deletar
                </Button>
              )}
            </div>
            <p className="flex-1 cursor-default text-end text-[0.5rem] text-muted-foreground">
              {updatedAt
                ? format(new Date(updatedAt), "dd/MM/yyyy")
                : format(new Date(createdAt), "dd/MM/yyyy")}
            </p>
          </div>
        </div>
      ) : (
        <div className="my-auto flex flex-1 flex-col items-center justify-center gap-2">
          <Textarea
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value)
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
