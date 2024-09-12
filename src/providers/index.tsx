'use client'

import { PropsWithChildren } from 'react'
import * as Auth from './auth'
import * as User from './user'

export const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Auth.AuthProvider>
      <User.UserProvider>{children}</User.UserProvider>
    </Auth.AuthProvider>
  )
}
