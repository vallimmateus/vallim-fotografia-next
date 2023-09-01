import type { Metadata } from 'next'
import type { AppProps } from 'next/app'

import './globals.css'
import { GlobalPropsContextProvider } from '@/features/GlobalProps/contexts/GlobalPropsContext'
import { GlobalProps } from '@/features/GlobalProps/GlobalProps'
import Layout from '@/components/Layout'

export const metadata: Metadata = {
  title: 'Vallim Fotografia',
  description: 'Fotógrafo da universidade EEL-USP',
}

export default function App({ Component, pageProps }: AppProps) {
  const parties = GlobalProps.extract(pageProps)
  return (
    <GlobalPropsContextProvider globalProps={parties}>
      <div className="bg-zinc-900 text-white">
        <Layout parties={parties}>
          <Component {...pageProps} />
        </Layout>
      </div>
    </GlobalPropsContextProvider>
  )
}
