'use client'

import { User } from '@prisma/client'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react'

export const UserContext = createContext(undefined as User | undefined)

export const UserProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User>()
  const { data } = useSession()

  const getUserData = useCallback(async (email: string) => {
    await axios
      .get('/api/user', { headers: { userEmail: email } })
      .then((res) => setUser(res.data.userData))
  }, [])

  useEffect(() => {
    if (data?.user?.email && !user) {
      getUserData(data?.user?.email)
    }
  }, [data, getUserData, user])

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}
