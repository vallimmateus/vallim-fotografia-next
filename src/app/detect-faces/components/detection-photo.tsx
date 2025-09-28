'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { FaceDetail } from '@aws-sdk/client-rekognition'
import { PhotoFace } from '@prisma/client'

export function FaceDetectionPhoto({
  photo,
}: {
  photo: {
    photoVersions: {
      photoId: string
      s3Key: string
    }[]
  } & {
    id: string
    createdAt: Date
    eventId: string
    originalName: string
    uploadedByUserId: string
  }
}) {
  const [faces, setFaces] = useState<FaceDetail[]>([])
  const [facesCreated, setFacesCreated] = useState<PhotoFace[]>([])
  const [loadingDetect, setLoadingDetect] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)

  const imageS3Key = photo.photoVersions[0].s3Key
  const imageUrl = `https://d3edmjeascdk88.cloudfront.net/${imageS3Key}`
  const imageS3Bucket = 'vallimfotografia'

  const handleDetectFaces = async () => {
    setLoadingDetect(true)
    const res = await fetch('/api/detect-faces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageS3Key, imageS3Bucket }),
    })
    const data = await res.json()
    setFaces(data.FaceDetails || [])
    setLoadingDetect(false)
  }

  const handleSaveDetection = async () => {
    setLoadingSave(true)
    if (faces.length === 0) {
      alert('Nenhum rosto detectado')
      setLoadingSave(false)
      return
    }
    if (!imageS3Key) {
      alert('Nenhuma imagem encontrada')
      setLoadingSave(false)
      return
    }
    if (!photo.id) {
      alert('Nenhuma foto encontrada')
      setLoadingSave(false)
      return
    }
    const res = await fetch('/api/save-detection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photoId: photo.id,
        s3Key: imageS3Key,
        faces,
      }),
    })
    const data = await res.json()
    console.log('data.faces', data.faces)
    setFacesCreated(data.faces || [])
    setLoadingSave(false)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded border border-blue-200 bg-zinc-800 p-4 shadow-sm shadow-blue-500">
      <div className="relative h-auto w-[500px]">
        <Image
          src={imageUrl}
          alt="Test Image"
          width={500}
          height={0}
          className="rounded"
          layout="responsive"
        />
        {faces.map((face, index) => {
          if (
            !face.BoundingBox ||
            !face.BoundingBox.Height ||
            !face.BoundingBox.Left ||
            !face.BoundingBox.Top ||
            !face.BoundingBox.Width
          )
            return null
          const faceCreated = facesCreated.filter(
            (f) =>
              f.photoId === photo.id &&
              face.BoundingBox &&
              f.boundingBoxHeight === face.BoundingBox.Height &&
              f.boundingBoxLeft === face.BoundingBox.Left &&
              f.boundingBoxTop === face.BoundingBox.Top &&
              f.boundingBoxWidth === face.BoundingBox.Width,
          )
          if (faceCreated.length > 0) {
            return (
              <HoverCard key={`${index}-created`}>
                <HoverCardTrigger
                  className="absolute rounded border border-green-200 shadow-sm shadow-green-500"
                  style={{
                    top: `${faceCreated[0].boundingBoxTop * 100}%`,
                    left: `${faceCreated[0].boundingBoxLeft * 100}%`,
                    width: `${faceCreated[0].boundingBoxWidth * 100}%`,
                    height: `${faceCreated[0].boundingBoxHeight * 100}%`,
                  }}
                />
                <HoverCardContent className="w-96 rounded bg-zinc-900 p-2 shadow">
                  <code>{JSON.stringify(faceCreated[0], null, 2)}</code>
                </HoverCardContent>
              </HoverCard>
            )
          } else {
            return (
              <HoverCard key={index}>
                <HoverCardTrigger
                  className="absolute rounded border border-blue-200 shadow-sm shadow-blue-500"
                  style={{
                    top: `${face.BoundingBox.Top * 100}%`,
                    left: `${face.BoundingBox.Left * 100}%`,
                    width: `${face.BoundingBox.Width * 100}%`,
                    height: `${face.BoundingBox.Height * 100}%`,
                  }}
                />
                <HoverCardContent className="w-96 rounded bg-zinc-900 p-2 shadow">
                  <code>
                    {JSON.stringify(
                      {
                        Confidence: face.Confidence,
                        EyesOpen: face.EyesOpen,
                        Quality: face.Quality,
                        Pose: face.Pose,
                        AgeRange: face.AgeRange,
                        Smile: face.Smile,
                        MainEmotion: face.Emotions?.reduce((prev, curr) =>
                          (curr.Confidence || 0) > (prev.Confidence || 0)
                            ? curr
                            : prev,
                        )?.Type,
                        EyeDirection: face.EyeDirection,
                        Eyeglasses: face.Eyeglasses,
                        FaceOccluded: face.FaceOccluded,
                        Gender: face.Gender,
                        Sunglasses: face.Sunglasses,
                      },
                      null,
                      2,
                    )}
                  </code>
                </HoverCardContent>
              </HoverCard>
            )
          }
        })}
      </div>
      <div className="flex flex-row gap-2">
        <Button
          onClick={handleDetectFaces}
          className="mt-4"
          disabled={loadingDetect}
        >
          {loadingDetect ? 'Detectando...' : 'Detectar Rostos'}
        </Button>
        <Button
          onClick={handleSaveDetection}
          className="mt-4"
          disabled={loadingSave}
        >
          {loadingSave ? 'Salvando...' : 'Salvar Detecção'}
        </Button>
      </div>
    </div>
  )
}
