'use client'
import { User } from '@prisma/client'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import CopyComment from './components/copy-comment'
import ImageDownloader from './components/image-downloader'

type LastComments = ({
  photo: {
    event: {
      name: string
      type: string
      slug: string
      logoUrl: string | null
    }
  } & {
    id: string
    imageUrlId: string
    name: string
    eventId: string
  }
} & {
  id: string
  text: string
  createdAt: Date
  updatedAt: Date | null
  photoId: string
  userId: string
})[]

export default function Page() {
  const { status, data } = useSession()
  const [lastComments, setLastComments] = useState<LastComments>([])
  const [user, setUser] = useState<User>()
  const [showComments, setShowComments] = useState(false)

  const getUserData = useCallback(async (email: string) => {
    await axios
      .get('/api/user', { headers: { userEmail: email } })
      .then((res) => setUser(res.data.userData))
  }, [])

  const getAllAnonymousComments = useCallback(async () => {
    await axios
      .get('/api/anonymous-comments')
      .then((res) => setLastComments(res.data.lastComments))
      .then(() => setShowComments(true))
  }, [])

  useEffect(() => {
    if (data?.user?.email && !user) {
      getUserData(data?.user?.email)
    }
  }, [data, getUserData, user])

  useEffect(() => {
    if (status === 'authenticated' && user) {
      if (['admin', 'contentProducer'].includes(user?.role)) {
        getAllAnonymousComments()
      } else if (user?.role === 'user') {
        redirect('/')
      }
    } else if (status === 'unauthenticated') {
      redirect('/')
    }
  }, [getAllAnonymousComments, user, status])

  if (showComments) {
    return (
      <div className="flex flex-1 flex-col items-center py-12">
        <h1 className="border-b-[1px] pb-2 text-5xl font-bold">
          Comentários anônimos 😈
        </h1>
        <ul className="flex w-full flex-wrap items-center justify-center gap-8 py-4">
          {lastComments &&
            lastComments.map((comment, idx) => {
              return (
                <li
                  key={idx}
                  className="flex h-36 w-full max-w-md gap-4 overflow-hidden rounded-lg border-2 border-black bg-zinc-950 transition-all hover:shadow-lg hover:shadow-zinc-800"
                >
                  <ImageDownloader
                    eventName={comment.photo.event.name}
                    imageUrlId={comment.photo.imageUrlId}
                    fileName={comment.photo.name}
                  />
                  <div className="flex flex-1 flex-col gap-2 py-2 pr-2">
                    <p className="font-bold text-zinc-300">
                      {comment.photo.event.name}
                    </p>
                    <CopyComment text={comment.text} />
                  </div>
                </li>
              )
            })}
        </ul>
      </div>
    )
  } else {
    return <h1>Carregando...</h1>
  }
}
