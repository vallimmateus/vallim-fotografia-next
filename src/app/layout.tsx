import { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { AuthProvider } from "@/providers/auth";

export const metadata: Metadata = {
  title: "Vallim Fotografia",
  description: "Bem-vindos ao meu site de fotografia!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
