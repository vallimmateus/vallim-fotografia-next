'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { fetchAllUsers } from '@/app/event/[year]/[slug]/actions/fetchAllUsers'

type User = {
  id: string
  name: string
  image: string | null
  nickname: string | null
}

type UsersContextType = {
  allUsers: User[]
  isLoading: boolean
  loadMoreUsers: () => Promise<void>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function loadInitialUsers() {
      setIsLoading(true)
      try {
        const users = await fetchAllUsers({ page: 1, limit: 50 })
        setAllUsers(users)
      } finally {
        setIsLoading(false)
      }
    }
    loadInitialUsers()
  }, [])

  async function loadMoreUsers() {
    setIsLoading(true)
    try {
      const nextPage = page + 1
      const users = await fetchAllUsers({ page: nextPage, limit: 50 })
      setAllUsers((prevUsers) => [...prevUsers, ...users])
      setPage(nextPage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UsersContext.Provider value={{ allUsers, isLoading, loadMoreUsers }}>
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider')
  }
  return context
}
