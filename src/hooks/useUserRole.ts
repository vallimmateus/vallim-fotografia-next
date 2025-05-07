'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { Role, User } from '@prisma/client'
import axios from 'axios'

export function useUserRoles() {
  const { data } = useSession()
  const [roles, setRoles] = useState<Role[] | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!data?.user?.email) {
        setError('User email is not available')
        return
      }
      setIsLoading(true)
      await axios
        .get('/api/user', { headers: { userEmail: data.user.email } })
        .then((res) => {
          setRoles(res.data.userData.roles)
          setUser(res.data.userData)
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false))
    }

    fetchUserRole()
  }, [data?.user?.email])

  return { roles, isLoading, error, user }
}
