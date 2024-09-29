import { Metadata } from 'next'

import { Footer } from '@/components/ui/footer'
import { Header } from '@/components/ui/header'
import { Providers } from '@/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vallim Fotografia',
  description: 'Bem-vindos ao meu site de fotografia!',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <Providers>
        <body className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
          {/* <Header /> */}
          {children}
          <Footer />
        </body>
      </Providers>
    </html>
  )
}
