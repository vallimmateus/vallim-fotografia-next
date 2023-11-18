import { ReactNode, createContext, useContext } from 'react'

import { GlobalProps } from '@/types'

// Default value for global props
export const defaultGlobalPropsContextValue: GlobalProps = {
  parties: [],
  photos: [],
  users: [],
}

// Global props context
export const GlobalPropsContext = createContext<GlobalProps>(
  defaultGlobalPropsContextValue,
)

// Global props context provider props
export interface GlobalPropsContextProviderProps {
  children?: ReactNode
  globalProps: GlobalProps
}

// Global props context provider
export function GlobalPropsContextProvider(
  props: GlobalPropsContextProviderProps,
) {
  return (
    <GlobalPropsContext.Provider value={props.globalProps}>
      {props.children}
    </GlobalPropsContext.Provider>
  )
}

// Utility hook to access global props
export function useGlobalProps() {
  return useContext(GlobalPropsContext)
}
