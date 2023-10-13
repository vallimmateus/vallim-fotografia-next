import React, { ReactNode, useEffect, useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { Inter, Rubik, Oswald } from 'next/font/google'
import { signOut, useSession } from 'next-auth/react'

import clsx from 'clsx'
import { v4 as uuidv4 } from 'uuid'

import { ChevronRightIcon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import { doc, setDoc } from 'firebase/firestore/lite'
import SigninButton from './SigninButton'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { cn } from '@/lib/utils'
import { Party, User } from '@/types'
import { GlobalProps } from '@/features/GlobalProps/GlobalProps'
import { db } from '@/lib/db'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
})
const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
})

interface LayoutProps {
  children: ReactNode
  parties: Party[]
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'

export default function Layout({ children, parties }: LayoutProps) {
  const { data: session } = useSession()
  const { users } = GlobalProps.use()

  const [openDialog, setOpenDialog] = useState(false)
  const [nickname, setNickname] = useState(session?.user?.name || '')
  const [me, setMe] = useState<User>()

  useEffect(() => {
    try {
      const { users } = GlobalProps.use()
      const me = users.find((user) => user.email === session?.user?.email)
      setMe(me)
      if (
        !users.find((user) => user.email === session?.user?.email) &&
        session?.user
      ) {
        setOpenDialog(true)
        setNickname(session?.user?.name || '')
      }
    } catch (error) {
      console.error(error)
    }
    // const getMe = async () => {
    //   const usersRef = collection(db, 'users')
    //   const usersSnap = await getDocs(usersRef)
    //   const users: User[] = usersSnap.docs.map((user) => {
    //     const data = user.data() as Omit<User, 'id'>
    //     return { ...data, id: user.id }
    //   })
    //   const me = users.find((user) => user.email === session?.user?.email)
    //   setMe(me)
    //   return [users, me]
    // }
    //  else {
    // getMe()
    // }
  }, [session, users])

  const [clientWindowHeight, setClientWindowHeight] = useState(0)

  const handleScroll = () => {
    setClientWindowHeight(window.scrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-50 flex w-screen flex-row items-center justify-center bg-zinc-950 shadow-lg shadow-black transition-all',
          {
            'h-20': clientWindowHeight <= 50,
            'h-14': clientWindowHeight > 50,
          },
        )}
      >
        {/* <div className='flex flex-row justify-between mx-12 max-w-3xl w-full'> */}
        {/* Mobile */}
        <div className="flex w-full max-w-screen-xl items-center justify-between p-4 max-xl:px-10 lg:hidden">
          <Link href="/">
            <Image
              className="max-h-10"
              src="/logo.svg"
              alt="Vallim Fotografia logo"
              width={98}
              height={60}
            />
          </Link>
          <div className="flex flex-row items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 w-10 p-0">
                  <HamburgerMenuIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <Link href="/">
                  <DropdownMenuItem>Home</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/parties">
                  <DropdownMenuItem>Festas Universitárias</DropdownMenuItem>
                </Link>
                <DropdownMenuItem disabled>Eventos</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Orçamentos</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <SigninButton me={me} />
          </div>
        </div>
        {/* Desktop */}
        <div className="grid w-full max-w-screen-xl grid-cols-3 items-center p-4 max-xl:px-10 max-lg:hidden">
          <Link href="/">
            <Image
              src="/vallim-fotografia.svg"
              alt="Vallim Fotografia logo"
              width={150}
              height={60}
            />
          </Link>
          <div className="flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" passHref legacyBehavior>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    Festas Universitárias
                  </NavigationMenuTrigger>
                  {parties && (
                    <NavigationMenuContent className="p-4">
                      <ul className="grid gap-3 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                        <li className="row-span-4">
                          <NavigationMenuLink asChild>
                            <Link
                              className="group relative flex h-full w-full select-none flex-col overflow-hidden rounded-md bg-muted no-underline outline-none focus:shadow-md"
                              href={`/parties/${parties[0]?.id}`}
                            >
                              <div className="h-full w-full">
                                <Image
                                  src={`https://drive.google.com/uc?id=${parties[0]?.cover}`}
                                  alt={parties[0]?.name}
                                  unoptimized
                                  width={(300 * 3) / 2}
                                  height={(200 * 3) / 2}
                                  className="h-full object-cover brightness-75 transition-all group-hover:brightness-90"
                                />
                              </div>
                              <div className="z-1 absolute flex h-full w-full flex-col justify-end p-2 transition-all group-hover:p-1">
                                <div className="flex h-1/3 w-full flex-col justify-center gap-2 rounded-md bg-zinc-400/30 p-4 backdrop-blur-sm transition-all group-hover:h-2/5 group-hover:p-5 group-hover:backdrop-blur-md">
                                  <p className="text-lg font-bold">
                                    {parties[0]?.name}
                                  </p>
                                  <p className="text-sm leading-tight text-zinc-200">
                                    {parties[0]?.date}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        {parties.slice(1, 4).map((party) => (
                          <ListItem
                            key={party.id}
                            title={party.name}
                            href={`/parties/${party.id}`}
                          >
                            {party.date}
                          </ListItem>
                        ))}
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/parties"
                              className="flex h-full select-none items-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <p className="inline-flex w-full items-center gap-1 text-base font-semibold leading-none">
                                Ver mais{' '}
                                <ChevronRightIcon className="h-4 w-4" />
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  )}
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/event" passHref legacyBehavior>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Eventos
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex justify-end">
            <SigninButton me={me} />
          </div>
        </div>
      </header>
      <main
        className={`${inter.variable} ${rubik.variable} ${oswald.variable}`}
      >
        <Dialog open={openDialog} onOpenChange={() => signOut()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Termine de criar a sua conta.</DialogTitle>
              <DialogDescription>
                Escolha um apelido para aparecer como o seu usuário.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  disabled={!!session?.user?.name}
                  defaultValue={session?.user?.name || ''}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-mail
                </Label>
                <Input
                  id="email"
                  disabled={!!session?.user?.email}
                  defaultValue={session?.user?.email || ''}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname" className="text-right">
                  Apelido
                </Label>
                <Input
                  id="nickname"
                  autoFocus
                  className="col-span-3"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={() => signOut()}>
                Logout
              </Button>
              <Button
                onClick={async () => {
                  if (
                    session?.user?.email &&
                    session.user.image &&
                    session.user.name &&
                    nickname.length > 0
                  ) {
                    const id = uuidv4()
                    const docRef = doc(db, 'users', id)
                    const data: Omit<User, 'id'> = {
                      email: session.user.email,
                      name: session.user.name,
                      image: session.user.image,
                      nickname,
                    }
                    try {
                      await setDoc(docRef, data)
                      setMe({ ...data, id })
                      setOpenDialog(false)
                    } catch (error) {
                      console.error(error)
                    }
                  }
                }}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {children}
      </main>
    </>
  )
}
