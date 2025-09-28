import { NextResponse } from 'next/server'
import { rekognition } from '@/lib/rekognition'
import { prismaClient } from '@/lib/prisma'
import {
  SearchFacesByImageCommand,
  IndexFacesCommand,
} from '@aws-sdk/client-rekognition'
import { z } from 'zod'
import { PhotoFace } from '@prisma/client'
import sharp from 'sharp'

const boundingBoxSchema = z.object({
  Width: z.number(),
  Height: z.number(),
  Left: z.number(),
  Top: z.number(),
})

const ageRangeSchema = z.object({
  Low: z.number().or(z.undefined()).optional(),
  High: z.number().or(z.undefined()).optional(),
})

const valueConfidenceBooleanSchema = z.object({
  Value: z.boolean(),
  Confidence: z.number(),
})

const genderSchema = z.object({
  Value: z
    .union([z.literal('Female'), z.literal('Male'), z.undefined()])
    .optional(),
  Confidence: z.union([z.number(), z.undefined()]).optional(),
})

const emotionsSchema = z.object({
  Value: z
    .union([
      z.literal('ANGRY'),
      z.literal('CALM'),
      z.literal('CONFUSED'),
      z.literal('DISGUSTED'),
      z.literal('FEAR'),
      z.literal('HAPPY'),
      z.literal('SAD'),
      z.literal('SURPRISED'),
      z.literal('UNKNOWN'),
    ])
    .or(z.string())
    .optional(),
  Confidence: z.number(),
})

const landmarksSchema = z.object({
  Value: z
    .union([
      z.literal('chinBottom'),
      z.literal('eyeLeft'),
      z.literal('eyeRight'),
      z.literal('leftEyeBrowLeft'),
      z.literal('leftEyeBrowRight'),
      z.literal('leftEyeBrowUp'),
      z.literal('leftEyeDown'),
      z.literal('leftEyeLeft'),
      z.literal('leftEyeRight'),
      z.literal('leftEyeUp'),
      z.literal('leftPupil'),
      z.literal('midJawlineLeft'),
      z.literal('midJawlineRight'),
      z.literal('mouthDown'),
      z.literal('mouthLeft'),
      z.literal('mouthRight'),
      z.literal('mouthUp'),
      z.literal('nose'),
      z.literal('noseLeft'),
      z.literal('noseRight'),
      z.literal('rightEyeBrowLeft'),
      z.literal('rightEyeBrowRight'),
      z.literal('rightEyeBrowUp'),
      z.literal('rightEyeDown'),
      z.literal('rightEyeLeft'),
      z.literal('rightEyeRight'),
      z.literal('rightEyeUp'),
      z.literal('rightPupil'),
      z.literal('upperJawlineLeft'),
      z.literal('upperJawlineRight'),
      z.undefined(),
    ])
    .or(z.string())
    .optional(),
  Confidence: z.union([z.number(), z.undefined()]).optional(),
})

const poseSchema = z.object({
  Roll: z.union([z.number(), z.undefined()]).optional(),
  Yaw: z.union([z.number(), z.undefined()]).optional(),
  Pitch: z.union([z.number(), z.undefined()]).optional(),
})

const imageQualitySchema = z.object({
  Brightness: z.union([z.number(), z.undefined()]).optional(),
  Sharpness: z.union([z.number(), z.undefined()]).optional(),
})

const eyeDirectionSchema = z.object({
  Yaw: z.union([z.number(), z.undefined()]).optional(),
  Pitch: z.union([z.number(), z.undefined()]).optional(),
  Confidence: z.union([z.number(), z.undefined()]).optional(),
})

const faceDetailSchema = z.object({
  BoundingBox: boundingBoxSchema,
  AgeRange: z.union([ageRangeSchema, z.undefined()]).optional(),
  Smile: valueConfidenceBooleanSchema,
  Eyeglasses: z.union([valueConfidenceBooleanSchema, z.undefined()]).optional(),
  Sunglasses: z.union([valueConfidenceBooleanSchema, z.undefined()]).optional(),
  Gender: z.union([genderSchema, z.undefined()]).optional(),
  Beard: z.union([valueConfidenceBooleanSchema, z.undefined()]).optional(),
  Mustache: z.union([valueConfidenceBooleanSchema, z.undefined()]).optional(),
  EyesOpen: z.union([valueConfidenceBooleanSchema, z.undefined()]).optional(),
  MouthOpen: z.union([valueConfidenceBooleanSchema, z.undefined()]).optional(),
  Emotions: z.array(emotionsSchema),
  Landmarks: z.union([z.array(landmarksSchema), z.undefined()]).optional(),
  Pose: z.union([poseSchema, z.undefined()]).optional(),
  Quality: z.union([imageQualitySchema, z.undefined()]).optional(),
  Confidence: z.number(),
  FaceOccluded: z
    .union([valueConfidenceBooleanSchema, z.undefined()])
    .optional(),
  EyeDirection: z.union([eyeDirectionSchema, z.undefined()]).optional(),
})

const bodySchema = z.object({
  photoId: z.string(),
  s3Key: z.string(),
  faces: z.array(faceDetailSchema),
})

export async function POST(req: Request) {
  const COLLECTION_ID = process.env.REKOGNITION_COLLECTION_ID!

  try {
    const body = await req.json()
    const { s3Key, faces, photoId } = bodySchema.parse(body)

    const photoFaceExists = await prismaClient.photoFace.findFirst({
      where: {
        photoId,
      },
    })

    if (photoFaceExists) {
      return NextResponse.json(
        { error: 'Faces already detected for this photo' },
        { status: 400 },
      )
    }

    const createdFaces: PhotoFace[] = []

    const resImage = await fetch(
      `https://www.vallimfotografia.com.br/images/${s3Key}`,
    )

    if (!resImage.ok) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const arrayBuffer = await resImage.arrayBuffer()
    const originalImageBuffer = Buffer.from(arrayBuffer)

    const originalImageSharp = await sharp(originalImageBuffer)
    const { width: imageWidth, height: imageHeight } =
      await originalImageSharp.metadata()

    console.log('Image metadata:', {
      width: imageWidth,
      height: imageHeight,
    })
    if (!imageWidth || !imageHeight) {
      return NextResponse.json(
        { error: 'Image metadata not found' },
        { status: 404 },
      )
    }

    for (const face of faces) {
      const box = face.BoundingBox

      // Converte bounding box proporcional em valores absolutos (pixels)
      const left = Math.round(box.Left! * imageWidth)
      const top = Math.round(box.Top! * imageHeight)
      const width = Math.round(box.Width! * imageWidth)
      const height = Math.round(box.Height! * imageHeight)

      const paddingPercent = 0.2 // 20%

      const padX = Math.round(width * paddingPercent)
      const padY = Math.round(height * paddingPercent)

      // Calcula nova área com padding, garantindo que não ultrapasse os limites da imagem
      let extractLeft = Math.max(0, left - padX)
      let extractTop = Math.max(0, top - padY)
      let extractWidth = Math.min(imageWidth - extractLeft, width + padX * 2)
      let extractHeight = Math.min(imageHeight - extractTop, height + padY * 2)

      // Corrigir limites que ultrapassem a imagem
      if (extractLeft < 0) extractLeft = 0
      if (extractTop < 0) extractTop = 0
      if (extractLeft + extractWidth > imageWidth)
        extractWidth = imageWidth - extractLeft
      if (extractTop + extractHeight > imageHeight)
        extractHeight = imageHeight - extractTop

      if (width <= 0 || height <= 0) {
        console.warn('Skipping face due to invalid crop area', {
          left,
          top,
          width,
          height,
          imageWidth,
          imageHeight,
        })
        continue
      }

      if (
        !(
          left >= 0 &&
          top >= 0 &&
          width > 0 &&
          height > 0 &&
          left + width <= imageWidth &&
          top + height <= imageHeight
        )
      ) {
        console.warn('Skipping invalid bounding box')
        continue
      }

      let croppedFaceBuffer: Buffer
      try {
        croppedFaceBuffer = await sharp(originalImageBuffer)
          .extract({
            left: extractLeft,
            top: extractTop,
            width: extractWidth,
            height: extractHeight,
          })
          .jpeg() // recomendo garantir formato suportado
          .toBuffer()
      } catch (error) {
        console.error('Error cropping image:', {
          error,
          left,
          top,
          width,
          height,
          imageWidth,
          imageHeight,
        })
        continue
      }
      const uint8Array = new Uint8Array(croppedFaceBuffer)

      // 1. Buscar rosto na coleção
      const searchCommand = new SearchFacesByImageCommand({
        CollectionId: COLLECTION_ID,
        Image: {
          Bytes: uint8Array,
        },
        FaceMatchThreshold: 95,
        MaxFaces: 1,
      })

      let rekognitionId: string | null = null

      try {
        const searchResult = await rekognition.send(searchCommand)
        const match = searchResult.FaceMatches?.[0]
        rekognitionId = match?.Face?.FaceId ?? null
      } catch (error) {
        console.warn('Error searching face in collection:', error)
        continue
      }

      // 2. Se não encontrou, indexar
      if (!rekognitionId) {
        const indexCommand = new IndexFacesCommand({
          CollectionId: COLLECTION_ID,
          Image: {
            Bytes: uint8Array,
          },
          DetectionAttributes: ['ALL'],
          ExternalImageId: photoId,
        })

        const indexResult = await rekognition.send(indexCommand)
        rekognitionId = indexResult.FaceRecords?.[0].Face?.FaceId ?? null
      }

      // 3. Salvar no banco
      const createdPhotoFace = await prismaClient.photoFace.create({
        data: {
          photo: {
            connect: {
              id: photoId,
            },
          },
          faceRekognitionId: rekognitionId,
          boundingBoxTop: face.BoundingBox.Top,
          boundingBoxLeft: face.BoundingBox.Left,
          boundingBoxWidth: face.BoundingBox.Width,
          boundingBoxHeight: face.BoundingBox.Height,
          userId: undefined,
          confidence: face.Confidence,
          mainEmotion:
            face.Emotions.reduce(
              (prev, current) => {
                return prev.Confidence > current.Confidence ? prev : current
              },
              { Value: 'UNKNOWN', Confidence: 0 },
            ).Value ?? 'UNKNOWN',
          smile: face.Smile.Value,
          smileConfidence: face.Smile.Confidence,
        },
      })

      createdFaces.push(createdPhotoFace)
    }

    return NextResponse.json(
      {
        message: 'Faces detected and saved successfully',
        faces: createdFaces,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error saving faces:', error)
    return NextResponse.json(
      {
        message: 'Error saving faces',
        error,
      },
      { status: 500 },
    )
  }
}
