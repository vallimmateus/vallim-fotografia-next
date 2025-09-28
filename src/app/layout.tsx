import { Metadata } from 'next'

import { Footer } from '@/components/ui/footer'
import { Header } from '@/components/ui/header'
import { Providers } from '@/providers'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Vallim Fotografia',
  description: 'Bem-vindos ao meu site de fotografia!',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-title" content="Vallim Fotografia" />
      </head>
      <body className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
        <Providers>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
