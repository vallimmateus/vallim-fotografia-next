'use client'

import { useState } from 'react'

import {
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command'

import AllUsersList from './allUsersList'

type UserDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  submit: (userId: string) => void
}

export function UserDialog({ open, setOpen, submit }: UserDialogProps) {
  const [userId, setUserId] = useState('')

  const handleSelectUser = () => {
    if (userId) {
      submit(userId)
      setOpen(false)
    }
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      commandProps={{
        value: userId,
        onValueChange: (value) => setUserId(value),
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleSelectUser()
          }
        },
        onSubmit: (event) => {
          event.preventDefault()
          handleSelectUser()
        },
      }}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <AllUsersList handleSelectUser={handleSelectUser} />
        </CommandGroup>
      </CommandList>
      <CommandFooter>
        <button
          className="h-7 rounded-md pl-2 pr-1 text-xs font-bold text-zinc-600 hover:bg-zinc-800 hover:text-zinc-500"
          onClick={handleSelectUser}
        >
          Selecionar
          <kbd>↵</kbd>
        </button>
      </CommandFooter>
    </CommandDialog>
  )
}
