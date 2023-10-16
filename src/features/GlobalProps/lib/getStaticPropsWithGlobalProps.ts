import {
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { fetchGlobalProps } from './fetchGlobalProps'
import { GlobalProps } from '@/types'

export function getStaticPropsWithGlobalProps<
  T extends Record<string, unknown>,
>(
  getStaticProps: (
    ctx: GetStaticPropsContext,
    globalProps: GlobalProps,
  ) => Promise<GetStaticPropsResult<T>>,
): GetStaticProps<T & GlobalProps> {
  // Construct getStaticProps function
  return async (ctx: GetStaticPropsContext) => {
    // Fetch global props
    const globalProps = await fetchGlobalProps()

    // Run getStaticProps with user defined getStaticProps, provide context
    // and global props
    const result = await getStaticProps(ctx, globalProps)

    // If redirect or notFound in result, return result as is, in this case
    // no page props will be provided
    if ('redirect' in result || 'notFound' in result) {
      return result
    }

    // Return combined page props and global props as page props
    return {
      props: {
        ...result.props,
        ...globalProps,
      },
      // revalidate: result.revalidate,
    }
  }
}
