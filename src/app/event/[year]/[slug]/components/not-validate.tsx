"use client"
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

export default function NotValidate() {
  const router = useRouter()
  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Sinto muito, as fotos ainda não foram lançadas 😕
          </AlertDialogTitle>
          <AlertDialogDescription>
            Espere um pouco mais que a equipe de organização do evento está
            fazendo as últimas verificações nas fotos e retorne mais tarde neste
            link.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => router.back()}>
            Voltar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
