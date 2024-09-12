import { Photo as PhotoRPA } from 'react-photo-album'

declare module 'react-photo-album' {
  interface Photo extends PhotoRPA {
    src?: string
    imageUrlId?: string
    eventId?: string
    title: string
  }
}
