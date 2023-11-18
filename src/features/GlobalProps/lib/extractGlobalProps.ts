import { GlobalProps } from '@/types'
import { defaultGlobalPropsContextValue } from '../contexts/GlobalPropsContext'

const isParty = <Party>(arg: unknown): arg is Party => true
const isPhoto = <Photo>(arg: unknown): arg is Photo => true
const isUser = <User>(arg: unknown): arg is User => true

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractGlobalProps(data: any): GlobalProps {
  if (!data) return defaultGlobalPropsContextValue

  // Do it the correct way with type validation and default values
  return {
    parties: isParty(data.parties) ? data.parties : [],
    photos: isPhoto(data.photos) ? data.photos : [],
    users: isUser(data.users) ? data.users : [],
  }

  // Or do it the lazy, error prone way if you trust your pageProps to have
  // the correct shape
  // return data as GlobalProps;
}
