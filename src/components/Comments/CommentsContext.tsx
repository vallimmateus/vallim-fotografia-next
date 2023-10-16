import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'
import {
  HeartIcon,
  HeartFilledIcon,
  PaperPlaneIcon,
  UpdateIcon,
  ArrowRightIcon,
  PersonIcon,
} from '@radix-ui/react-icons'
import { VenetianMask } from 'lucide-react'

import { signIn, useSession } from 'next-auth/react'

import {
  ComponentProps,
  makeUseContext,
  useLightboxState,
} from 'yet-another-react-lightbox'

import { useRouter } from 'next/router'
import { DocumentReference, doc, setDoc } from 'firebase/firestore'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { CommentCard } from './CommentCard'

import { transformToFirestore } from './utils'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Comment, Photo } from '@/types'
import { db } from '@/lib/db'
import { cn } from '@/lib/utils'
import { GlobalProps } from '@/features/GlobalProps/GlobalProps'

// const SIDEBAR_WIDTH = 320

export type CommentsContextType = {
  open: boolean
  toggle: () => void
  photosList: Photo[] | null
}

const defaultCommentsProps = {
  photosList: [],
}
export const resolveCommentsProps = (comments: CommentsContextType) => ({
  ...defaultCommentsProps,
  ...comments,
})

const CommentsContext = createContext<CommentsContextType | null>(null)

export const useComments = makeUseContext(
  'useComments',
  'CommentsContext',
  CommentsContext,
)

export default function CommentsComponent({
  comments: commentsProps,
  children,
}: ComponentProps & { comments: CommentsContextType }) {
  const { photosList } = resolveCommentsProps(commentsProps)
  const [newComment, setNewComment] = useState<string>('')
  const [anonymous, setAnonymous] = useState<boolean>(false)
  const [photoInfoLoading, setPhotoInfoLoading] = useState(false)

  const { asPath } = useRouter()

  // List of party's photos info
  const [listPhotosInfo, setListPhotosInfo] = useState<Photo[]>([])

  useEffect(() => {
    if (photosList) {
      setListPhotosInfo(photosList)
    }
  }, [photosList])

  // Current photo infos
  const [singlePhotoInfo, setSinglePhotoInfo] = useState<Photo>()

  const { data: session } = useSession()

  const { users } = GlobalProps.use()

  const [open, setOpen] = useState(false)
  const { currentSlide } = useLightboxState()

  if (open && !currentSlide) {
    setOpen(false)
  }

  useEffect(() => {
    if (currentSlide) {
      setPhotoInfoLoading(true)
      const currentPhotoInfo = listPhotosInfo.find((photo) => {
        return photo.id === currentSlide.src.split('uc?id=')[1]
      })
      setSinglePhotoInfo(currentPhotoInfo)
      setPhotoInfoLoading(false)
    }
  }, [open, currentSlide, listPhotosInfo])

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const context = useMemo(
    () => ({ open, toggle, photosList }),
    [open, toggle, photosList],
  )

  const toggleLiked = async () => {
    if (!session) {
      signIn()
    }
    if (session?.user?.email && currentSlide?.src) {
      setPhotoInfoLoading(true)
      let docRef: DocumentReference
      let data: Photo
      if (!singlePhotoInfo) {
        // Se a foto não existe no Firestore (singlePhotoInfo === undefined), cria um document no Firestore com a alteração
        const id = currentSlide.src.split('uc?id=')[1]
        docRef = doc(db, 'photos', id)
        data = {
          id,
          ref: doc(db, asPath),
          likes: [{ email: session.user.email }],
        }
      } else {
        // Se a foto já existe no Firestore, update (add ou remove)
        docRef = doc(db, 'photos', singlePhotoInfo.id)
        data = singlePhotoInfo
        if (
          !data.likes?.find((like) => {
            return like.email === session.user?.email
          })
        ) {
          // O usuário ainda não curtiu esta foto
          if (!data.likes) {
            // Não tem nenhuma curtida
            data = {
              ...data,
              likes: [{ email: session.user.email }],
            }
          } else {
            // Já tem pelo menos alguma curtida
            data.likes = [...data.likes, { email: session.user.email }]
          }
        } else {
          // O usuário já curtiu esta foto
          data.likes = data.likes.filter((like) => {
            return like.email !== session.user?.email
          })
        }
      }

      // Atualiza os states offline
      setSinglePhotoInfo(data)

      const currentSinglePhotoInfoIndex = listPhotosInfo.findIndex(
        (photo) => photo.id === data.id,
      )
      const newListPhotosInfo = [
        ...listPhotosInfo.slice(0, currentSinglePhotoInfoIndex),
        data,
        ...listPhotosInfo.slice(currentSinglePhotoInfoIndex + 1),
      ]
      setListPhotosInfo(newListPhotosInfo)

      // Tenta atualizar os dados no Firestore
      try {
        const { data: dataForFS } = transformToFirestore(data)
        await setDoc(docRef, dataForFS)
      } catch (error) {
        console.error(error)
        setSinglePhotoInfo(singlePhotoInfo)
        setListPhotosInfo(listPhotosInfo)
      } finally {
        setPhotoInfoLoading(false)
      }
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setPhotoInfoLoading(true)
    if (singlePhotoInfo?.id) {
      const docRef: DocumentReference = doc(db, 'photos', singlePhotoInfo.id)
      const data: Photo = singlePhotoInfo
      if (data.comments) {
        data.comments = data.comments.filter((comment) => {
          return comment.id !== commentId
        })

        // Atualiza os states offline
        setSinglePhotoInfo(data)

        const currentSinglePhotoInfoIndex = listPhotosInfo.findIndex(
          (photo) => photo.id === data.id,
        )
        const newListPhotosInfo = [
          ...listPhotosInfo.slice(0, currentSinglePhotoInfoIndex),
          data,
          ...listPhotosInfo.slice(currentSinglePhotoInfoIndex + 1),
        ]
        setListPhotosInfo(newListPhotosInfo)

        // Tenta atualizar os dados no Firestore
        try {
          const { data: dataForFS } = transformToFirestore(data)
          await setDoc(docRef, dataForFS)
        } catch (error) {
          console.error(error)
          setSinglePhotoInfo(singlePhotoInfo)
          setListPhotosInfo(listPhotosInfo)
        } finally {
          setPhotoInfoLoading(false)
        }
      }
    }
  }

  const handleNewComment = async () => {
    if (!session) {
      signIn()
    }
    if (
      session?.user?.email &&
      currentSlide?.src &&
      singlePhotoInfo?.id &&
      !!newComment &&
      newComment?.length > 0
    ) {
      setPhotoInfoLoading(true)
      let docRef: DocumentReference
      let data: Photo
      const newSingleComment: Comment = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        comment: newComment,
        email: anonymous ? 'anonymous' : session.user.email,
      }
      if (!singlePhotoInfo) {
        // Se a foto não existe no Firestore (singlePhotoInfo === undefined), cria um document no Firestore com a alteração
        const id = currentSlide.src.split('uc?id=')[1]
        docRef = doc(db, 'photos', id)
        data = {
          id,
          ref: doc(db, asPath),
          comments: [newSingleComment],
        }
      } else {
        // Se a foto já existe no Firestore, update
        docRef = doc(db, 'photos', singlePhotoInfo.id)
        data = singlePhotoInfo
        if (!data.comments) {
          // Não tem nenhum comentário
          data = {
            ...data,
            comments: [newSingleComment],
          }
        } else {
          // Já existe pelo menos algum comentário
          data.comments = [...data.comments, newSingleComment]
        }
      }

      // Atualiza os states offline
      setSinglePhotoInfo(data)

      const currentSinglePhotoInfoIndex = listPhotosInfo.findIndex(
        (photo) => photo.id === data.id,
      )
      const newListPhotosInfo = [
        ...listPhotosInfo.slice(0, currentSinglePhotoInfoIndex),
        data,
        ...listPhotosInfo.slice(currentSinglePhotoInfoIndex + 1),
      ]
      setListPhotosInfo(newListPhotosInfo)

      // Tenta atualizar os dados no Firestore
      try {
        const { data: dataForFS } = transformToFirestore(data)
        await setDoc(docRef, dataForFS)
      } catch (error) {
        console.error(error)
        setSinglePhotoInfo(singlePhotoInfo)
        setListPhotosInfo(listPhotosInfo)
      } finally {
        setPhotoInfoLoading(false)
      }
    }
    setNewComment('')
    setAnonymous(false)
  }

  const allLikes =
    singlePhotoInfo?.likes?.map((photo) => {
      const user = users.find((user) => user.email === photo.email)
      if (user) {
        return {
          nickname: user?.nickname,
          image: user.image,
          email: user.email,
        }
      }
      return { nickname: photo.email, email: photo.email }
    }) || []
  return (
    <CommentsContext.Provider value={context}>
      <div
        className={clsx(
          'absolute bottom-0 left-0 top-0 transition-all max-lg:right-0',
          {
            'lg:right-[320px]': open,
            'lg:right-0': !open,
          },
        )}
      >
        {children}
      </div>

      {currentSlide && (
        <div
          className={clsx(
            'absolute bottom-0 top-0 z-10 flex h-full max-h-screen w-[320px] flex-col bg-primary-foreground p-3 text-center transition-all',
            {
              'right-0': open,
              '-right-[320px]': !open,
            },
          )}
        >
          <div
            className={clsx('flex justify-start transition-all', {
              '-ml-6': open,
              'ml-0': !open,
            })}
          >
            <div className="z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-secondary shadow-md">
              <ArrowRightIcon onClick={toggle} className="h-6 w-6" />
            </div>
          </div>
          <div className="mb-2 flex flex-1 flex-col">
            {photoInfoLoading && !!singlePhotoInfo ? (
              <div className="flex flex-1 justify-center">
                <UpdateIcon className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ScrollArea className="-mt-6 flex-1">
                {singlePhotoInfo?.comments &&
                  singlePhotoInfo.comments.map((comment) => {
                    return (
                      <CommentCard
                        key={comment.id}
                        id={comment.id}
                        docId={singlePhotoInfo.id}
                        handleDeleteComment={() =>
                          handleDeleteComment(comment.id)
                        }
                        comment={comment}
                        editable={comment.email === session?.user?.email}
                      />
                    )
                  })}
              </ScrollArea>
            )}
            <div className="flex h-8 items-center gap-2">
              <button
                className="relative"
                onClick={toggleLiked}
                disabled={photoInfoLoading}
              >
                {singlePhotoInfo?.likes?.find((photo) => {
                  return photo.email === session?.user?.email
                }) ? (
                  <HeartFilledIcon className="h-7 w-7" />
                ) : (
                  <HeartIcon className="h-7 w-7" />
                )}
                <div className="absolute bottom-0 right-0 flex aspect-square w-3.5 items-center justify-center rounded-full bg-red-600 p-[2px]">
                  <p className="text-center text-[7px]">
                    {singlePhotoInfo?.likes?.length || '0'}
                  </p>
                </div>
              </button>
              <div className="z-50 flex h-7 flex-1 overflow-clip">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild defaultChecked>
                      <Button variant="ghost" className="h-7 w-64 px-2">
                        <p className="w-full truncate text-start text-xs">
                          {allLikes
                            .slice(0, 3)
                            .map((like) => {
                              return like.nickname
                            })
                            .join(', ')}
                        </p>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-secondary p-0 text-secondary-foreground">
                      <ScrollArea className="max-h-72 w-48 rounded-md border">
                        <div className="p-3 text-start">
                          <h4 className="mb-4 text-sm font-bold leading-none">
                            Likes
                          </h4>
                          {allLikes.map((like, idx) => {
                            const user = users.find(
                              (user) => user.email === like.email,
                            )
                            return (
                              <>
                                <div
                                  key={idx}
                                  className="w-42 flex items-center space-x-2"
                                >
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage
                                      src={user?.image}
                                      alt={user?.nickname}
                                    />
                                    <AvatarFallback>
                                      <PersonIcon className="h-3 w-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="truncate text-sm">
                                    {like.nickname}
                                  </p>
                                </div>
                                <Separator className="my-1 bg-zinc-500" />
                              </>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="flex flex-row space-x-2">
            <Textarea
              placeholder="Comente aqui!"
              onChange={(e) => setNewComment(e.target.value)}
              value={newComment}
              className={cn('resize-none transition-all', {
                'border-red-900 bg-red-500/5 text-red-100 placeholder:text-red-300/75':
                  anonymous,
              })}
            />
            <div className="grid grid-rows-2 space-y-1">
              <Button
                onClick={handleNewComment}
                className={cn('transition-all', {
                  'bg-red-700 text-white hover:bg-red-800': anonymous,
                })}
              >
                <PaperPlaneIcon />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Toggle
                      id="anonymous"
                      className="w-full"
                      onClick={() => setAnonymous(!anonymous)}
                      size="sm"
                    >
                      <VenetianMask size={16} />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px] bg-secondary text-start">
                    <p className="text-sm font-light text-secondary-foreground">
                      Comentário anônimo
                    </p>
                    <p className="text-[0.75rem] font-thin text-muted-foreground">
                      Se você enviar um comentário anônimo, não poderá editar
                      nem excluir.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}
    </CommentsContext.Provider>
  )
}
