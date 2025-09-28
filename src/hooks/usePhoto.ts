import { PhotoFace } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function usePhoto() {
  const queryClient = useQueryClient()

  const usePhotoFaces = (photoId: string) => {
    return useQuery<PhotoFace[]>({
      queryKey: ['photo', photoId],
      queryFn: async () => {
        const res = await fetch(`/api/photo/${photoId}/faces`)
        if (!res.ok) {
          throw new Error('Error fetching photo faces')
        }
        const data = await res.json()
        return data.faces as PhotoFace[]
      },
      refetchOnWindowFocus: false,
    })
  }

  const useFace = (photoId: string, faceId: string) => {
    return useQuery<PhotoFace>({
      queryKey: ['face', faceId],
      queryFn: async () => {
        const res = await fetch(`/api/photo/${photoId}/${faceId}`)
        if (!res.ok) {
          throw new Error('Error fetching face')
        }
        const data = await res.json()
        return data.face as PhotoFace
      },
      refetchOnWindowFocus: false,
    })
  }

  const useFaceAssociation = ({
    userId,
    faceId,
  }: {
    userId: string
    faceId?: string
  }) => {
    return useMutation({
      mutationKey: ['face', 'associate', userId, faceId],
      mutationFn: async () => {
        const res = await fetch('/api/faces/associate', {
          method: 'POST',
          body: JSON.stringify({ userId, faceId }),
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) {
          throw new Error('Error associating face')
        }
        return res.json()
      },
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ['face', faceId] })
        const previousFace = queryClient.getQueryData<PhotoFace>([
          'face',
          faceId,
        ])
        queryClient.setQueryData(
          ['face', faceId],
          (old: PhotoFace | undefined) => {
            if (old) {
              return { ...old, userId: faceId ? old.userId : null }
            }
            return old
          },
        )
        return { previousFace }
      },
      onError: (err, _variables, context) => {
        console.error('Error associating face:', err)
        queryClient.setQueryData(['face', faceId], context?.previousFace)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['face', faceId] })
      },
    })
  }

  const useFaceDisassociation = ({
    userId,
    faceId,
  }: {
    userId: string
    faceId?: string
  }) => {
    return useMutation({
      mutationKey: ['face', 'disassociate', userId, faceId],
      mutationFn: async () => {
        const res = await fetch('/api/faces/disassociate', {
          method: 'POST',
          body: JSON.stringify({ userId, faceId }),
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) {
          throw new Error('Error disassociating face')
        }
        return res.json()
      },
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ['face', faceId] })
        const previousFace = queryClient.getQueryData<PhotoFace>([
          'face',
          faceId,
        ])
        queryClient.setQueryData(
          ['face', faceId],
          (old: PhotoFace | undefined) => {
            if (old) {
              return { ...old, userId: faceId ? old.userId : null }
            }
            return old
          },
        )
        return { previousFace }
      },
      onError: (err, _variables, context) => {
        console.error('Error associating face:', err)
        queryClient.setQueryData(['face', faceId], context?.previousFace)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['face', faceId] })
      },
    })
  }

  return { usePhotoFaces, useFace, useFaceAssociation, useFaceDisassociation }
}
