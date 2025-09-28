import {
  RekognitionClient,
  DetectFacesCommand,
  DetectFacesCommandInput,
  DetectFacesCommandOutput,
  CompareFacesCommand,
  CompareFacesCommandInput,
  CompareFacesCommandOutput,
} from '@aws-sdk/client-rekognition'

export const rekognition = new RekognitionClient({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY,
  },
})

export const detectFaces = async (
  imageS3Key: string,
  imageS3Bucket: string,
): Promise<DetectFacesCommandOutput> => {
  const params: DetectFacesCommandInput = {
    Image: {
      S3Object: {
        Bucket: imageS3Bucket,
        Name: imageS3Key,
      },
    },
    Attributes: ['ALL'],
  }

  try {
    const command = new DetectFacesCommand(params)
    const data = await rekognition.send(command)
    return data
  } catch (error) {
    console.error('Error detecting faces:', error)
    throw error
  }
}

export const compareFaces = async (
  sourceImage: Buffer,
  targetImage: Buffer,
  sourceS3Key: string,
  targetS3Key: string,
  imageS3Bucket: string,
): Promise<CompareFacesCommandOutput> => {
  const params: CompareFacesCommandInput = {
    SourceImage: {
      S3Object: {
        Bucket: imageS3Bucket,
        Name: sourceS3Key,
      },
    },
    TargetImage: {
      S3Object: {
        Bucket: imageS3Bucket,
        Name: targetS3Key,
      },
    },
    SimilarityThreshold: 90,
  }

  try {
    const command = new CompareFacesCommand(params)
    const data = await rekognition.send(command)
    return data
  } catch (error) {
    console.error('Error comparing faces:', error)
    throw error
  }
}
