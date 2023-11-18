'use client'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface GoogleProvidersProps {
  children: ReactNode
}

export default function GoogleProviders({ children }: GoogleProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>
}
