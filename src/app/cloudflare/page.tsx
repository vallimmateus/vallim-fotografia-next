'use client'
import axios from 'axios'
import { useState } from 'react'
import {
  type FileState,
  MultiImageDropzone,
} from '@/components/ui/multi-image-dropzone'
import { Button } from '@/components/ui/button'
import { GetObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3'
import { r2 } from '@/lib/cloudflare'
import Image from 'next/image'

export default function Page() {
  const [fileStates, setFileStates] = useState<FileState[]>([])
  const [url, setUrl] = useState('')

  function updateFileProgress(key: string, progress: FileState['progress']) {
    setFileStates((fileStates) => {
      const newFileStates = structuredClone(fileStates)
      const fileState = newFileStates.find((fileState) => fileState.key === key)
      if (fileState) {
        fileState.progress = progress
      }
      return newFileStates
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-3 pt-7">
      <h1>Cloudflare R2</h1>
      <MultiImageDropzone
        value={fileStates}
        dropzoneOptions={{
          maxSize: 1024 * 1024 * 5,
          maxFiles: 1000,
        }}
        onChange={(files) => {
          setFileStates(files)
        }}
        onFilesAdded={async (addedFiles) => {
          console.log('onFilesAdded')
          setFileStates([...fileStates, ...addedFiles])
          await Promise.all(
            addedFiles.map(async (addedFileState) => {
              try {
                const file = addedFileState.file as File
                const responseUrl = await axios.post('/api/get-signed-url', {
                  path: file.name,
                  contentType: file.type,
                })

                const signedUrl = responseUrl.data.signedUrl as string

                await axios.put(signedUrl, file, {
                  headers: {
                    'Content-Type': file.type,
                  },
                  onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                      let progress: FileState['progress']
                      if (progressEvent.loaded === progressEvent.total) {
                        progress = 'COMPLETE'
                      } else if (progressEvent.loaded < progressEvent.total) {
                        progress = Math.round(
                          (progressEvent.loaded * 100) / progressEvent.total,
                        )
                      } else {
                        progress = 'ERROR'
                      }
                      updateFileProgress(addedFileState.key, progress)
                    }
                  },
                })
              } catch (error) {
                console.error(error)
              }
            }),
          )
          // await Promise.all(
          //   addedFiles.map(async (addedFileState) => {
          //     try {
          //       const res = await edgestore.publicFiles.upload({
          //         file: addedFileState.file,
          //         onProgressChange: async (progress) => {
          //           updateFileProgress(addedFileState.key, progress)
          //           if (progress === 100) {
          //             // wait 1 second to set it to complete
          //             // so that the user can see the progress bar at 100%
          //             await new Promise((resolve) => setTimeout(resolve, 1000))
          //             updateFileProgress(addedFileState.key, 'COMPLETE')
          //           }
          //         },
          //       })
          //       console.log(res)
          //     } catch (err) {
          //       updateFileProgress(addedFileState.key, 'ERROR')
          //     }
          //   }),
          // )
        }}
      />
      <Button
        onClick={async () => {
          const res = await axios.get('/api/get-signed-url')
          const url = res.data.url as string
          setUrl(url)
        }}
      >
        ListBuckets
      </Button>
      {url && <img src={url} alt="Picture of the author" />}
    </div>
  )
}
