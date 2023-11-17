"use client"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

import { format } from "date-fns/esm"

type ValidatedProps = {
  userValidator: User
  publishDate: Date
  link: string
}

export default function Validated({
  userValidator,
  publishDate,
  link
}: ValidatedProps) {
  const router = useRouter()
  return (
    <div className="w-full flex-1">
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Este evento já foi validado!</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário{" "}
              <span className="text-bold text-white">
                {userValidator?.nickname || userValidator?.name}
              </span>{" "}
              validou este evento em{" "}
              <span className="text-bold text-white">
                {format(publishDate, "dd/MM/yyyy")}
              </span>
              . Por favor, clique em continuar para voltar à página do evento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push(link)}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
