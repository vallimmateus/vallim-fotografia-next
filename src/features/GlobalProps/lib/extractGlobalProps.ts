import { defaultGlobalPropsContextValue } from '../contexts/GlobalPropsContext'

const isParty = <Party>(arg: any): arg is Party => true

export function extractGlobalProps(data: any): GlobalProps {
  if (!data) return defaultGlobalPropsContextValue

  // Do it the correct way with type validation and default values
  return {
    parties: isParty(data.parties) ? data.parties : [],
  }

  // Or do it the lazy, error prone way if you trust your pageProps to have
  // the correct shape
  // return data as GlobalProps;
}
