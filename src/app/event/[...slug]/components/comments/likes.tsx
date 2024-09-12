import { useSession } from 'next-auth/react'
import { Fragment, memo, useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { LikesWithUserType } from './commentsContext'

import { HeartFilledIcon, HeartIcon, PersonIcon } from '@radix-ui/react-icons'
import axios from 'axios'
import { useLightboxState } from 'yet-another-react-lightbox'

type LikesProps = {
  likes: LikesWithUserType[]
  getLikes: () => void
  handleLoginCLick: () => void
}

function Likes({ likes, getLikes, handleLoginCLick }: LikesProps) {
  const { data, status } = useSession()
  const { currentSlide } = useLightboxState()

  const [liked, setLiked] = useState(
    likes.some((like) => like.User.email === data?.user?.email),
  )

  useEffect(() => {
    if (status === 'authenticated' && data?.user) {
      setLiked(likes.some((like) => like.User.email === data.user?.email))
    }
  }, [data, currentSlide, status, likes])

  const toggleLiked = async () => {
    if (status !== 'authenticated') {
      handleLoginCLick()
      return
    }
    if (!liked === true) {
      await axios.post('/api/likes', {
        photoName: currentSlide?.title,
        email: data?.user?.email,
      })
    } else {
      await axios.delete('/api/likes', {
        data: {
          id: likes.find((like) => like.User.email === data?.user?.email)?.id,
        },
      })
    }
    setLiked((prev) => !prev)
    getLikes()
  }

  return (
    <div className="flex h-8 items-center justify-start gap-2">
      <Button
        variant="link"
        className="relative h-7 w-7 p-0"
        onClick={toggleLiked}
        disabled={status !== 'authenticated'}
      >
        {liked ? (
          <HeartFilledIcon className="h-7 w-7" />
        ) : (
          <HeartIcon className="h-7 w-7" />
        )}
        {likes.length !== 0 && (
          <div className="absolute bottom-0 right-0 flex aspect-square h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 p-[2px]">
            <p className="text-center text-[7px]">{likes.length}</p>
          </div>
        )}
      </Button>
      {likes.length !== 0 && (
        <div className="z-50 flex h-7 flex-1 overflow-clip">
          <TooltipProvider>
            <Tooltip delayDuration={400}>
              <TooltipTrigger asChild defaultChecked>
                <Button variant="ghost" className="h-7 w-64 px-2">
                  <p className="w-full truncate text-start text-xs font-semibold">
                    {likes
                      .slice(0, 3)
                      .map((like) => {
                        return like.User.nickname || like.User.name
                      })
                      .join(', ')}
                  </p>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-secondary p-0 text-secondary-foreground">
                <ScrollArea className="flex h-72 w-48 flex-col rounded-md border p-3">
                  <h4 className="mb-4 text-sm font-bold leading-none">Likes</h4>
                  {likes.map((like, idx) => {
                    return (
                      <Fragment key={idx}>
                        {idx !== 0 && (
                          <Separator className="my-1 bg-zinc-500" />
                        )}
                        <div className="w-42 flex items-center space-x-2">
                          <Avatar className="h-4 w-4">
                            <AvatarImage
                              src={like.User.image || ''}
                              alt={
                                like.User.nickname || (like.User.name as string)
                              }
                            />
                            <AvatarFallback>
                              <PersonIcon className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <p className="cursor-default truncate text-sm">
                            {like.User.nickname || like.User.name}
                          </p>
                        </div>
                      </Fragment>
                    )
                  })}
                </ScrollArea>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}

export default memo(Likes)
