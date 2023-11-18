import {
  GlobalPropsContextProvider,
  useGlobalProps,
} from './contexts/GlobalPropsContext'
import { extractGlobalProps } from './lib/extractGlobalProps'
import { getStaticPropsWithGlobalProps } from './lib/getStaticPropsWithGlobalProps'

// Defines the public API
export const GlobalProps = {
  getStaticProps: getStaticPropsWithGlobalProps,
  getEmptyStaticProps: getStaticPropsWithGlobalProps(async () => ({
    props: {},
  })),
  Provider: GlobalPropsContextProvider,
  use: useGlobalProps,
  extract: extractGlobalProps,
}
