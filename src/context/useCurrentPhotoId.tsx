import { createContext, useContext } from 'react'

// Contexto para armazenar o photoId atual
const CurrentPhotoIdContext = createContext<string | null>(null)

// Hook para fornecer o photoId atual
export function useCurrentPhotoId() {
  const photoId = useContext(CurrentPhotoIdContext)
  if (photoId === null) {
    throw new Error(
      'useCurrentPhotoId deve ser usado dentro de um CurrentPhotoIdProvider',
    )
  }
  return photoId
}

// Provider para envolver componentes que precisam acessar o photoId
export function CurrentPhotoIdProvider({
  children,
  photoId,
}: {
  children: React.ReactNode
  photoId: string
}) {
  return (
    <CurrentPhotoIdContext.Provider value={photoId}>
      {children}
    </CurrentPhotoIdContext.Provider>
  )
}
