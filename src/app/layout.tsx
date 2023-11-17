import { Metadata } from "next"

import "./globals.css"
import { Footer } from "@/components/ui/footer"
import { Header } from "@/components/ui/header"
import { AuthProvider } from "@/providers/auth"

export const metadata: Metadata = {
  title: "Vallim Fotografia",
  description: "Bem-vindos ao meu site de fotografia!"
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <AuthProvider>
        <body className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
          <Header />
          {children}
          <Footer />
        </body>
      </AuthProvider>
    </html>
  )
}
