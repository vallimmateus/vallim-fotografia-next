import type { Metadata } from 'next'
import type { AppProps } from 'next/app'

import './globals.css'
import { GlobalProps } from '@/features/GlobalProps/GlobalProps'
import Layout from '@/components/Layout'
import GoogleProviders from '@/components/GoogleProviders'
import { GlobalPropsContextProvider } from '@/features/GlobalProps/contexts/GlobalPropsContext'

export const metadata: Metadata = {
  title: 'Vallim Fotografia',
  description: 'Fotógrafo da universidade EEL-USP',
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalPropsContextProvider globalProps={GlobalProps.extract(pageProps)}>
      <div className="bg-zinc-900 text-white">
        <GoogleProviders>
          <Layout {...pageProps}>
            <Component {...pageProps} />
          </Layout>
        </GoogleProviders>
      </div>
    </GlobalPropsContextProvider>
  )
}
