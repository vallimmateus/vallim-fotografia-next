import { Button } from '@/components/ui/button'
import { useUserDialog } from '@/context/UserDialogContext'
import { usePhoto } from '@/hooks/usePhoto'
import { useUserRoles } from '@/hooks/useUserRole'
import { useCurrentPhotoId } from '@/context/useCurrentPhotoId'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@radix-ui/react-hover-card'
import { UserIcon, Users, LogIn } from 'lucide-react'
import { signIn } from 'next-auth/react'

export function FaceHoverCard({
  faceId,
  index,
  callbackUrl,
}: {
  faceId: string
  index: number
  callbackUrl: string
}) {
  const { openUserDialog } = useUserDialog()
  const { user } = useUserRoles()
  const { useFace, useFaceAssociation } = usePhoto()
  const photoId = useCurrentPhotoId()
  const { data: face, isLoading } = useFace(photoId, faceId)

  if (isLoading) {
    return <div className="h-64 w-64 animate-pulse bg-gray-200" />
  }
  console.log('face', face)

  if (!face) {
    return <div className="h-64 w-64 bg-red-200">Face not found</div>
  }

  const handleAssociateUserToFace = async (userId: string, faceId?: string) => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const faceAssociation = useFaceAssociation({
        userId,
        faceId,
      })
      await faceAssociation.mutateAsync()
    } catch (error) {
      console.error('Error associating user to face:', error)
    }
  }

  const handleOpenUserDialog = (faceId: string) => {
    openUserDialog((userId) => handleAssociateUserToFace(userId, faceId))
  }

  return (
    <HoverCard key={face.id} openDelay={200}>
      <HoverCardTrigger
        className="duration-2000 absolute animate-fade-in rounded border-2 border-solid border-primary opacity-10 transition-opacity hover:opacity-100 hover:shadow-lg active:opacity-100"
        style={{
          top: `${Math.max((face.boundingBoxTop - face.boundingBoxHeight * 0.1) * 100, 0)}%`,
          left: `${Math.max((face.boundingBoxLeft - face.boundingBoxWidth * 0.1) * 100, 0)}%`,
          width: `${face.boundingBoxWidth * 1.2 * 100}%`,
          height: `${face.boundingBoxHeight * 1.2 * 100}%`,
          animationDelay: `${index * 0.07}s`,
        }}
      />
      <HoverCardContent className="w-60">
        {face.userId ? (
          <p>Face associada</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <UserIcon className="h-8 w-8 rounded-full bg-muted stroke-muted-foreground p-2" />
              <p className="text-sm font-semibold">Desconhecido</p>
            </div>
            {user !== null ? (
              <>
                <Button
                  className="w-full"
                  onClick={() => {
                    handleAssociateUserToFace(user.id, face.id)
                  }}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Sou eu</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleOpenUserDialog(face.id)
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Associar alguém</span>
                </Button>
              </>
            ) : (
              <>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  Entre para usar essa funcionalidade
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={async () => {
                    await signIn('google', {
                      callbackUrl,
                    })
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Continue com o Google</span>
                </Button>
              </>
            )}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
