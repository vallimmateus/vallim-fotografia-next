import { createContext } from 'react'
import { Photo } from '@/types'

export const PhotosOfPartyContext = createContext<Photo[]>([])
