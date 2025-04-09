'use client'

import { Event, User } from '@prisma/client'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { imageLoader } from '@/lib/imageLoader'
import { cn } from '@/lib/utils'

import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import axios from 'axios'
import { format } from 'date-fns'
import { ChevronRightIcon, LogInIcon, LogOutIcon } from 'lucide-react'

export function Header() {
  const { status, data } = useSession()

  const [parties, setParties] = useState<Event[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [user, setUser] = useState<User>()

  const getUserData = useCallback(async (email: string) => {
    await axios
      .get('/api/user', { headers: { userEmail: email } })
      .then((res) => setUser(res.data.userData))
  }, [])

  const getParties = useCallback(async () => {
    // await axios
    //   .get('/api/events', { headers: { type: 'party', quantity: 4 } })
    //   .then((res) => setParties(res.data.eventData))
  }, [])

  const getEvents = useCallback(async () => {
    // await axios
    //   .get('/api/events', { headers: { type: 'event', quantity: 2 } })
    //   .then((res) => setEvents(res.data.eventData))
  }, [])

  const handleLoginCLick = async () => {
    await signIn()
  }

  const handleLogoutClick = async () => {
    await signOut()
  }

  const [clientWindowHeight, setClientWindowHeight] = useState(0)

  const handleScroll = () => {
    setClientWindowHeight(window.scrollY)
  }

  useEffect(() => {
    getParties()
    getEvents()
  }, [getEvents, getParties])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (data?.user?.email && !user) {
      getUserData(data?.user?.email)
    }
  }, [data, getUserData, user])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex w-screen flex-row items-center justify-center bg-zinc-950 shadow-lg shadow-black transition-all',
        {
          'h-20': clientWindowHeight <= 50,
          'h-14': clientWindowHeight > 50,
        },
      )}
    >
      <div className="grid w-full max-w-screen-xl items-center p-4 max-xl:px-10 max-md:grid-cols-2 md:grid-cols-3">
        <div>
          <Link href="/">
            <Image
              src="/vallim-fotografia.svg"
              alt="Vallim Fotografia logo"
              width={160}
              height={64}
              className="h-full max-h-16"
            />
          </Link>
        </div>

        <div className="flex justify-center max-md:hidden">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/category/party">
                  <NavigationMenuTrigger>
                    Festas Universitárias
                  </NavigationMenuTrigger>
                </NavigationMenuLink>
                {parties.length > 0 && (
                  <NavigationMenuContent className="p-4">
                    <ul className="grid gap-3 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      {parties[0] && (
                        <li className="row-span-4">
                          <NavigationMenuLink asChild>
                            <Link
                              className="group relative flex h-full w-full select-none flex-col overflow-hidden rounded-md bg-muted no-underline outline-none focus:shadow-md"
                              href={`/event/${new Date(
                                parties[0].date,
                              ).getFullYear()}/${parties[0].slug}`}
                            >
                              <div className="h-full w-full">
                                <Image
                                  loader={imageLoader}
                                  src={parties[0].coverUrl}
                                  alt={parties[0].name}
                                  width={(300 * 3) / 2}
                                  height={(200 * 3) / 2}
                                  className="h-full object-cover brightness-75 transition-all group-hover:brightness-90"
                                />
                              </div>
                              <div className="z-1 absolute flex h-full w-full flex-col justify-end p-2 transition-all group-hover:p-1">
                                <div className="flex h-1/3 w-full flex-col justify-center gap-2 rounded-md bg-zinc-400/30 p-4 backdrop-blur-sm transition-all group-hover:h-2/5 group-hover:p-5 group-hover:backdrop-blur-md">
                                  <p className="text-lg font-bold">
                                    {parties[0].name}
                                  </p>
                                  <p className="text-sm leading-tight text-zinc-200">
                                    {format(
                                      new Date(parties[0].date),
                                      'dd/MM/yyyy',
                                    )}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      )}
                      {parties.slice(1, 4).map((party) => (
                        <li key={party.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              href={`/event/${new Date(
                                party.date,
                              ).getFullYear()}/${party.slug}`}
                            >
                              <div className="text-sm font-medium leading-none">
                                {party.name}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {format(new Date(party.date), 'dd/MM/yyyy')}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/category/party"
                            className="flex h-full select-none items-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <p className="inline-flex w-full items-center gap-1 text-base font-semibold leading-none">
                              Ver mais <ChevronRightIcon className="h-4 w-4" />
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/category/party">
                  <NavigationMenuTrigger>Eventos</NavigationMenuTrigger>
                </NavigationMenuLink>
                {events.length > 0 && (
                  <NavigationMenuContent className="flex flex-col gap-3 p-4">
                    <div className="grid gap-3 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      {events.map((event, idx) => (
                        <div key={idx}>
                          <NavigationMenuLink asChild>
                            <Link
                              className="group relative flex h-56 w-full select-none flex-col overflow-hidden rounded-md bg-muted no-underline outline-none focus:shadow-md"
                              href={`/event/${new Date(
                                event.date,
                              ).getFullYear()}/${event.slug}`}
                            >
                              <div className="h-full w-full">
                                <Image
                                  loader={imageLoader}
                                  src={event.coverUrl}
                                  alt={event.name}
                                  width={(300 * 3) / 2}
                                  height={(200 * 3) / 2}
                                  className="h-full object-cover brightness-75 transition-all group-hover:brightness-90"
                                />
                              </div>
                              <div className="z-1 absolute flex h-full w-full flex-col justify-end p-2 transition-all group-hover:p-1">
                                <div className="flex h-1/3 min-h-fit w-full flex-col justify-center gap-2 rounded-md bg-zinc-400/30 p-4 backdrop-blur-sm transition-all group-hover:h-2/5 group-hover:p-5 group-hover:backdrop-blur-md">
                                  <p className="min-h-[1.75rem] truncate text-lg font-bold">
                                    {event.name}
                                  </p>
                                  <p className="text-sm leading-tight text-zinc-200">
                                    {format(new Date(event.date), 'dd/MM/yyyy')}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      ))}
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/category/event"
                        className="flex h-full select-none items-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <p className="inline-flex w-full items-center gap-1 text-base font-semibold leading-none">
                          Ver mais <ChevronRightIcon className="h-4 w-4" />
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
              {status === 'authenticated' &&
                ['admin', 'contentProducer'].includes(user?.role || 'user') && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      href="/anonymous"
                    >
                      Comentários anônimos 😈
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex justify-end max-md:hidden">
          {status === 'authenticated' && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback>
                    {user.name?.[0].toUpperCase()}
                  </AvatarFallback>
                  {user.image && <AvatarImage src={user.image} />}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <div className="text-sm font-medium leading-none">
                      {user.nickname || user.name}
                    </div>
                    <div className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={handleLogoutClick}
                >
                  <LogOutIcon size={16} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="justify-center gap-2"
              variant="outline"
              onClick={handleLoginCLick}
            >
              <LogInIcon size={16} />
              Fazer Login
            </Button>
          )}
        </div>

        <div className="flex justify-end md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex h-8 w-8 items-center justify-center p-2"
              >
                <HamburgerMenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              {status === 'authenticated' && user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {user.image && <AvatarImage src={user.image} />}
                        <AvatarFallback>
                          {user.name?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium leading-none">
                          {user.nickname || user.name}
                        </div>
                        <div className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                  <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleLoginCLick} className="gap-2">
                  <LogInIcon size={16} />
                  Fazer Login
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/category/party">Festas</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/category/event">Eventos</Link>
              </DropdownMenuItem>
              {status === 'authenticated' &&
                ['admin', 'contentProducer'].includes(user?.role || 'user') && (
                  <DropdownMenuItem>
                    <Link href="/anonymous">Comentários anônimos 😈</Link>
                  </DropdownMenuItem>
                )}
              {status === 'authenticated' && user && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={handleLogoutClick}
                  >
                    <LogOutIcon size={16} />
                    Log out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
