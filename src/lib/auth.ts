import { PrismaAdapter } from '@auth/prisma-adapter'
import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prismaClient } from './prisma'
import { env } from '@/env'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
}
