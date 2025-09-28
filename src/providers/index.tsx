'use client'

import { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as Auth from './auth'
import * as User from './user'
import { UsersProvider } from '@/context/UsersContext'

const queryClient = new QueryClient()

export const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Auth.AuthProvider>
        <User.UserProvider>
          <UsersProvider>{children}</UsersProvider>
        </User.UserProvider>
      </Auth.AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
