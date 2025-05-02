'use client'

import { FileState } from '@/components/ui/multi-image-dropzone'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { z } from 'zod'
import { OrganizationWithLogo } from '..'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import createSlug from '../utils/createSlug'
import axios from 'axios'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SingleImageDropzone } from '@/components/ui/single-image-dropzone'
import { Button } from '@/components/ui/button'
import { createOrganization } from './actions/createOrganization'

const MB_BYTES = 1024 ** 2
const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const FormOrganizationSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }),
  slug: z.string({ required_error: 'Slug é obrigatório' }),
  image: z.instanceof(File).superRefine((f, ctx) => {
    // First, add an issue if the mime type is wrong.
    if (!ACCEPTED_MIME_TYPES.includes(f.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `File must be one of [${ACCEPTED_MIME_TYPES.join(
          ', ',
        )}] but was ${f.type}`,
      })
    }
    // Next add an issue if the file size is too large.
    if (f.size > 2 * MB_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        type: 'array',
        message: `The file must not be larger than ${2 * MB_BYTES} bytes: ${
          f.size
        }`,
        maximum: 2 * MB_BYTES,
        inclusive: true,
      })
    }
  }),
})

type InputsOrganization = z.infer<typeof FormOrganizationSchema>

type UploadFileState = FileState & {
  total: number
}

export function NewOrganization({
  organizationName,
  setOrganizationName,
  setOrganizations,
  setDialogOpen,
}: {
  organizationName?: string
  setOrganizationName?: (name: string) => void
  setOrganizations?: Dispatch<SetStateAction<OrganizationWithLogo[]>>
  setDialogOpen?: Dispatch<SetStateAction<boolean>>
}) {
  const [progressUpload, setProgressUpload] = useState<UploadFileState>()
  const [isLoading, setIsLoading] = useState(false)
  const [newOrganization, setNewOrganization] = useState<OrganizationWithLogo>()

  const form = useForm<InputsOrganization>({
    resolver: zodResolver(FormOrganizationSchema),
    defaultValues: organizationName
      ? {
          name: organizationName,
          slug: createSlug(organizationName),
        }
      : {
          name: '',
          slug: '',
        },
  })

  const processForm: SubmitHandler<InputsOrganization> = async ({
    image,
    name,
    slug,
  }) => {
    setIsLoading(true)
    try {
      const fileToUpload: UploadFileState = {
        file: image,
        key: `organization/${slug}/${image.name.split('.')[0]}.webp`,
        total: image.size,
        progress: 'PENDING',
      }

      setProgressUpload(fileToUpload)

      const formData = new FormData()
      formData.append('file', image)
      formData.append('fileS3Key', fileToUpload.key)
      formData.append('options', JSON.stringify({ maxSize: 512, quality: 100 }))

      // upload da logo para o s3
      const fileS3Key = await axios
        .post('/api/image', formData, {
          onUploadProgress: (progressEvent) => {
            let progress: FileState['progress'] = 0
            if (progressEvent.progress) {
              progress = progressEvent.progress * 100
            } else if (progressEvent.total && progressEvent.loaded) {
              progress = (progressEvent.loaded / progressEvent.total) * 100
            }
            if (progress >= 100) {
              progress = 'COMPLETE'
            }
            setProgressUpload((file) => {
              if (file) {
                return { ...file, progress }
              }
              return file
            })
          },
        })
        .then((response) => {
          return response.data.fileS3Key
        })
        .catch((error) => {
          console.error('Error uploading file:', error)
          setProgressUpload((file) => {
            if (file) {
              return { ...file, progress: 'ERROR' }
            }
            return file
          })
          throw error
        })

      // criar organização no prisma
      const organization = await createOrganization({
        name,
        slug,
        logoOriginalName: image.name,
        logoS3Key: fileS3Key.startsWith('/') ? fileS3Key : `/${fileS3Key}`,
        logoUploadedByUserId: 'cma3a80hi0000th4kb6izxt0n',
        adminMembers: ['cma3a80hi0000th4kb6izxt0n'],
      })

      // colocar o setOrganizations no final de todo o processForm
      setNewOrganization(organization)
    } catch (error) {
      console.error('Error creating organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!progressUpload) return

    const progressString = Array.isArray(progressUpload)
      ? progressUpload
          .map((file: UploadFileState) => {
            if (file.progress === 'COMPLETE') {
              return 'COMPLETO'
            } else if (file.progress === 'ERROR') {
              return 'ERRO'
            } else {
              return `${file.progress}%`
            }
          })
          .every((progress: string) => progress === 'COMPLETO')
      : false

    if (progressString && newOrganization) {
      setIsLoading(!progressString)
      form.reset()
      setDialogOpen && setDialogOpen(false)
      setOrganizations &&
        setOrganizations((organizations) =>
          [...organizations, newOrganization].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressUpload])

  return (
    <div className="grid gap-4 py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)}>
          {/* name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      setOrganizationName && setOrganizationName(e.target.value)
                      form.setValue('slug', createSlug(e.target.value))
                    }}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      form.setValue('slug', createSlug(e.target.value))
                    }}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Logo */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <SingleImageDropzone
                    {...field}
                    width={200}
                    height={200}
                    onChange={(file) => {
                      field.onChange(file)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* <DialogClose asChild> */}
          <Button disabled={isLoading} type="submit">
            Salvar organização
          </Button>
          {/* </DialogClose> */}
        </form>
      </Form>
    </div>
  )
}
