import {
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY,
  },
})

export const uploadToS3 = async (
  buffer: Buffer,
  fileName: string,
  contentType: File['type'],
) => {
  const params: PutObjectCommandInput = {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
  }
  console.log('params', params)

  try {
    const command = new PutObjectCommand(params)
    await s3.send(command)
    return fileName
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw error
  }
}

export const getFromS3 = (fileS3Key: string) => {
  const params: GetObjectCommandInput = {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
    Key: fileS3Key,
  }

  try {
    const command = new GetObjectCommand(params)
    return s3.send(command)
  } catch (error) {
    console.error('Error getting from S3:', error)
    throw error
  }
}
