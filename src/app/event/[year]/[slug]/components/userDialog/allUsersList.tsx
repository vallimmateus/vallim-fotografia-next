'use client'

import { CommandItem } from '@/components/ui/command'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { PersonIcon } from '@radix-ui/react-icons'
import { useUsers } from '@/context/UsersContext'
import { useEffect, useRef } from 'react'
import { Command } from 'cmdk'

type AllUsersListProps = {
  handleSelectUser: () => void
}

export default function AllUsersList({ handleSelectUser }: AllUsersListProps) {
  const { allUsers, isLoading, loadMoreUsers } = useUsers()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current || isLoading) return

      const { scrollTop, scrollHeight, clientHeight } = listRef.current
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        loadMoreUsers()
      }
    }

    const listElement = listRef.current
    listElement?.addEventListener('scroll', handleScroll)
    return () => listElement?.removeEventListener('scroll', handleScroll)
  }, [isLoading, loadMoreUsers])

  return (
    <div ref={listRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {allUsers.map((user) => (
        <CommandItem value={user.id} key={user.id} onSelect={handleSelectUser}>
          <Avatar>
            <AvatarImage
              src={user.image || ''}
              alt={user.nickname || user.name}
            />
            <AvatarFallback>
              {user.nickname?.charAt(0) || user.name?.charAt(0) || (
                <PersonIcon />
              )}
            </AvatarFallback>
          </Avatar>
          <span>{user.nickname || user.name}</span>
        </CommandItem>
      ))}
      {isLoading && <Command.Loading>Loading...</Command.Loading>}
    </div>
  )
}
