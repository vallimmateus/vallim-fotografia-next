import type { Metadata } from "next";
import type { AppProps } from "next/app";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { GlobalProps } from "@/features/GlobalProps/GlobalProps";
import Layout from "@/components/Layout";
import { GlobalPropsContextProvider } from "@/features/GlobalProps/contexts/GlobalPropsContext";

export const metadata: Metadata = {
  title: "Vallim Fotografia",
  description: "Fotógrafo da universidade EEL-USP",
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalPropsContextProvider globalProps={GlobalProps.extract(pageProps)}>
      <div className="bg-zinc-900 text-white">
        <SessionProvider session={pageProps.session}>
          <Layout {...pageProps}>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </div>
    </GlobalPropsContextProvider>
  );
}
