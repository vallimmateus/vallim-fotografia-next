import { Comment, Like, User } from '@prisma/client'
import { signIn, useSession } from 'next-auth/react'
import {
  Suspense,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import CommentsList from './commentsList'
import Likes from './likes'

import { PaperPlaneIcon, UpdateIcon } from '@radix-ui/react-icons'
import axios from 'axios'
import { ArrowRightIcon, VenetianMask } from 'lucide-react'
import {
  ComponentProps,
  makeUseContext,
  useLightboxState,
} from 'yet-another-react-lightbox'

export type CommentsContextType = {
  open: boolean
  toggle: () => void
}

export type CommentWithUserType = Comment & {
  user: {
    name: string
    nickname: string
    image: string
    email: string
    id: string
  }
}

export type LikesWithUserType = Like & {
  user: {
    name: string
    nickname: string
    image: string
    email: string
    id: string
  }
}

const CommentsContext = createContext<CommentsContextType | null>(null)

export const useCommentsContext = makeUseContext(
  'useComments',
  'CommentsContext',
  CommentsContext,
)

export default function CommentsComponent({ children }: ComponentProps) {
  const { currentSlide } = useLightboxState()
  const { data, status } = useSession()
  const [open, setOpen] = useState(false)
  const [newComment, setNewComment] = useState<string>('')

  const [comments, setComments] = useState<CommentWithUserType[]>([])
  const [likes, setLikes] = useState<LikesWithUserType[]>([])
  const [anonymous, setAnonymous] = useState<boolean>(true)

  useEffect(() => {
    if (open && !currentSlide) {
      setOpen(false)
    }
  }, [open, currentSlide])

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const context = useMemo(
    () => ({
      open,
      toggle,
    }),
    [open, toggle],
  )

  const handleLoginCLick = async () => {
    await signIn()
  }

  const getComments = useCallback(async () => {
    await axios
      .get('/api/comments', { headers: { photoName: currentSlide?.alt } })
      .then((res) => {
        setComments(res.data.comments)
      })
  }, [currentSlide])

  const getLikes = useCallback(async () => {
    await axios
      .get('/api/likes', { headers: { photoName: currentSlide?.alt } })
      .then((res) => {
        setLikes(res.data.likes)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [currentSlide])

  const getUser = useCallback(async () => {
    const user = await axios.get('/api/user', {
      headers: { userEmail: data?.user?.email },
    })
    return user.data.userData as User
  }, [data?.user?.email])

  const handleNewComment = async () => {
    if (status === 'unauthenticated' && !anonymous) {
      signIn()
    } else if (status === 'loading') {
      alert('Aguarde um momento...')
      return
    }
    if (newComment.length === 0) {
      alert('O comentário não pode estar vazio.')
      return
    }
    await axios
      .post('/api/comments', {
        comment: newComment,
        photoName: currentSlide?.alt,
        email: anonymous ? 'anonymous' : data?.user?.email,
      })
      .then(() => {
        setNewComment('')
        getComments()
      })
  }

  useEffect(() => {
    getComments()
    getLikes()
  }, [currentSlide, getComments, getLikes])

  useEffect(() => {
    if (status === 'authenticated') {
      setAnonymous(false)
    }
  }, [currentSlide, status])

  return (
    <CommentsContext.Provider value={context}>
      <div
        className={cn(
          'absolute bottom-0 left-0 top-0 max-h-screen max-w-full transition-all max-lg:right-0',
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
          className={cn(
            'absolute bottom-0 top-0 z-10 h-full max-h-screen w-[320px] bg-black transition-all',
            {
              'right-0': open,
              '-right-[320px]': !open,
            },
          )}
        >
          <div className="flex h-full w-full flex-col rounded-es bg-primary-foreground p-3 text-center">
            <div
              className={cn('flex justify-start transition-all', {
                '-ml-6': open,
                'ml-0': !open,
              })}
            >
              <div className="z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-secondary shadow-md">
                <ArrowRightIcon onClick={toggle} className="h-6 w-6" />
              </div>
            </div>
            <div className="mb-2 flex flex-1 flex-col">
              <Suspense
                fallback={
                  <div className="flex flex-1 justify-center">
                    <UpdateIcon className="h-6 w-6 animate-spin" />
                  </div>
                }
              >
                <CommentsList
                  comments={comments}
                  getComments={getComments}
                  getUser={getUser}
                />
              </Suspense>
            </div>
            <div className="flex flex-col gap-2">
              <Suspense fallback={<p>Loading...</p>}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      className={cn({ 'cursor-default': anonymous })}
                    >
                      <Likes
                        likes={likes}
                        getLikes={getLikes}
                        handleLoginCLick={handleLoginCLick}
                      />
                    </TooltipTrigger>
                    {status === 'unauthenticated' && anonymous && (
                      <TooltipContent className="max-w-[250px] bg-secondary text-start">
                        <p className="text-sm font-light text-secondary-foreground">
                          Curtida anônima
                        </p>
                        <p className="text-[0.75rem] font-thin text-muted-foreground">
                          Faça login para curtir com seu nome
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </Suspense>
              <div className="relative flex flex-row gap-2">
                {/* {status !== 'authenticated' && (
                  <div className="absolute left-0 top-0 z-10 -m-2 flex h-[calc(100%+1rem)] w-[calc(100%+1rem)] flex-col items-center justify-center gap-2 rounded bg-zinc-600/40 backdrop-blur-sm">
                    <Label className="w-2/3">
                      Você precisa realizar o login antes de comentar ou curtir
                    </Label>
                    <Button size="sm" onClick={handleLoginCLick}>
                      Login
                    </Button>
                  </div>
                )} */}
                <Textarea
                  placeholder="Comente aqui..."
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
                          disabled={
                            status === 'loading' ||
                            (status === 'unauthenticated' && anonymous)
                          }
                        >
                          <VenetianMask size={16} />
                        </Toggle>
                      </TooltipTrigger>
                      {status === 'unauthenticated' && anonymous ? (
                        <TooltipContent className="max-w-[250px] bg-secondary text-start">
                          <p className="text-sm font-light text-secondary-foreground">
                            Comentário anônimo
                          </p>
                          <p className="text-[0.75rem] font-thin text-muted-foreground">
                            Faça login para comentar com seu nome
                          </p>
                        </TooltipContent>
                      ) : (
                        <TooltipContent className="max-w-[250px] bg-secondary text-start">
                          <p className="text-sm font-light text-secondary-foreground">
                            Comentário anônimo
                          </p>
                          <p className="text-[0.75rem] font-thin text-muted-foreground">
                            Se você enviar um comentário anônimo, não poderá
                            editar nem excluir.
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </CommentsContext.Provider>
  )
}
