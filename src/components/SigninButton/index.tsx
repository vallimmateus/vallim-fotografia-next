'use client'
import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { PersonIcon } from '@radix-ui/react-icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@/types'

type SignInButtonProps = {
  me?: User
}

function SigninButton({ me }: SignInButtonProps) {
  const { data: session } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative ml-4 h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {me && <AvatarImage src={me.image} alt={me.name} />}
            <AvatarFallback>
              <PersonIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {session && me ? (
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{me.nickname}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {me.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem disabled>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut()}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      ) : (
        <DropdownMenuContent>
          <DropdownMenuItem className="cursor-pointer" onClick={() => signIn()}>
            Login
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )

  //   if (session && session.user) {
  //     return (
  //       <div className="ml-auto flex gap-4">
  //         <p className="text-sky-600">{session.user.name}</p>
  //         <button
  //           className="text-red-600"
  //           onClick={() => {
  //             signOut()
  //           }}
  //         >
  //           Sign Out
  //         </button>
  //       </div>
  //     )
  //   } else {
  //     return (
  //       <button
  //         className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-secondary text-secondary"
  //         onClick={() => signIn()}
  //       >
  //         <PersonIcon className="h-8 w-8" />
  //       </button>
  //     )
  //   }
}

export default SigninButton
