import { createContext, useContext, useState, ReactNode } from 'react'
import { UserDialog } from '@/app/event/[year]/[slug]/components/userDialog'

interface UserDialogContextProps {
  openUserDialog: (submit: (userId: string) => void) => void
}

const UserDialogContext = createContext<UserDialogContextProps | undefined>(
  undefined,
)

export const UserDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [submitCallback, setSubmitCallback] = useState<
    (userId: string) => void
  >(() => () => {})

  const openUserDialog = (submit: (userId: string) => void) => {
    setSubmitCallback(() => submit)
    setIsOpen(true)
  }

  return (
    <UserDialogContext.Provider value={{ openUserDialog }}>
      {children}
      <UserDialog open={isOpen} setOpen={setIsOpen} submit={submitCallback} />
    </UserDialogContext.Provider>
  )
}

export const useUserDialog = (): UserDialogContextProps => {
  const context = useContext(UserDialogContext)
  if (!context) {
    throw new Error('useUserDialog must be used within a UserDialogProvider')
  }
  return context
}
