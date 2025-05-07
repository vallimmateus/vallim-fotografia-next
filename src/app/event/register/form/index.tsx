'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Organization } from '@prisma/client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  UploadCloudIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Check,
  ChevronsUpDown,
  PlusIcon,
} from 'lucide-react'

import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'

import { SingleImageDropzone } from '@/components/ui/single-image-dropzone'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Separator } from '@/components/ui/separator'
import axios, { AxiosRequestConfig } from 'axios'
import {
  FileState,
  MultiImageDropzone,
} from '@/components/ui/multi-image-dropzone'
import PhotoAlbum from 'react-photo-album'
import { redirect } from 'next/navigation'
import { useUserRoles } from '@/hooks/useUserRole'
import { s3Paths } from '@/lib/constants'
import { createPrismaEvent } from './actions/create-event'
import { createPrismaPhotos } from './actions/create-photos'
import createSlug from './utils/createSlug'
import { NewOrganization } from './new-organization'

const MB_BYTES = 1024 ** 2
const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const imageTypesToExtension: Record<File['type'], 'webp' | 'jpg' | 'png'> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

export type OrganizationWithLogo = Organization & {
  logoUrl?: string
}

export const FormDataSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }),
  slug: z
    .string({
      required_error: 'Slug é obrigatório',
    })
    .regex(
      /^[a-zA-Z0-9-]+$/,
      'Slug deve conter apenas caracteres alfanuméricos e "-"',
    ),
  type: z.union([z.literal('party'), z.literal('event')]),
  eventLogo: z.any().superRefine((f, ctx) => {
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
  date: z.date({ required_error: 'Data é obrigatória' }),
  publishedAt: z.date().optional(),
  organizations: z.array(z.custom<OrganizationWithLogo>(), {
    required_error: 'Inclua pelo menos uma organização',
  }),

  photos: z
    .array(
      z.object({
        file: z.any().superRefine((f, ctx) => {
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
          // if (f.size > 2 * MB_BYTES) {
          //   ctx.addIssue({
          //     code: z.ZodIssueCode.too_big,
          //     type: 'array',
          //     message: `The file must not be larger than ${2 * MB_BYTES} bytes: ${
          //       f.size
          //     }`,
          //     maximum: 2 * MB_BYTES,
          //     inclusive: true,
          //   })
          // }
        }),
        key: z.string(),
      }),
      {
        required_error: 'Fotos são obrigatórias',
      },
    )
    .min(1, 'Adicione pelo menos uma foto'),
  coverKey: z.string(),
  // .refine((key, ctx) => {
  //   const photos = ctx.parent.photos as { key: string }[]
  //   if (!photos.some((photo) => photo.key === key)) {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: 'coverKey must be one of the keys in photos',
  //     })
  //     return false
  //   }
  //   return true
  // }),
  // .instanceof(File, { message: 'Imagem de capa é obrigatória' })
  // .superRefine((f, ctx) => {
  //   // First, add an issue if the mime type is wrong.
  //   if (!ACCEPTED_MIME_TYPES.includes(f.type)) {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: `File must be one of [${ACCEPTED_MIME_TYPES.join(
  //         ', ',
  //       )}] but was ${f.type}`,
  //     })
  //   }
  //   // Next add an issue if the file size is too large.
  //   // if (f.size > 2 * MB_BYTES) {
  //   //   ctx.addIssue({
  //   //     code: z.ZodIssueCode.too_big,
  //   //     type: 'array',
  //   //     message: `The file must not be larger than ${2 * MB_BYTES} bytes: ${
  //   //       f.size
  //   //     }`,
  //   //     maximum: 2 * MB_BYTES,
  //   //     inclusive: true,
  //   //   })
  //   // }
  // }),
})

export type Inputs = z.infer<typeof FormDataSchema>

type StepsProps = {
  id: string
  name: string
  fields?: Array<keyof Inputs>
}[]

export function FormEvent({
  initialOrganizations,
}: {
  initialOrganizations: OrganizationWithLogo[]
}) {
  const { isLoading: isLoadingUser, roles, user } = useUserRoles()

  const [currentStep, setCurrentStep] = useState(0)
  const [organizations, setOrganizations] =
    useState<OrganizationWithLogo[]>(initialOrganizations)
  const [file, setFile] = useState<File>()
  const [filesStates, setFilesStates] = useState<FileState[]>([])
  const [organizationName, setOrganizationName] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: 'party',
      organizations: [],
      photos: [],
      coverKey: '',
    },
  })

  if (isLoadingUser) return <div>Loading...</div>
  if (!roles?.includes('admin') || !user) {
    redirect('/')
  }

  const steps: StepsProps = [
    {
      id: 'Step 1',
      name: 'Informações do evento',
      fields: [
        'name',
        'slug',
        'type',
        'eventLogo',
        'date',
        'publishedAt',
        'organizations',
      ],
    },
    {
      id: 'Step 2',
      name: 'Fotos',
      fields: ['photos'],
    },
    {
      id: 'Step 3',
      name: 'Escolher capa',
      fields: ['coverKey'],
    },
    {
      id: 'Step 3',
      name: 'Finalizar',
    },
  ]

  const updateProgress = (key: string, increment: number | 'ERROR') => {
    setFilesStates((files) => {
      const selectedFile = files.find((f) => f.key === key)
      if (!selectedFile) return files

      let newProgress: FileState['progress']

      if (increment === 'ERROR') {
        newProgress = 'ERROR'
      } else {
        if (
          selectedFile.progress === 'COMPLETE' ||
          selectedFile.progress === 'ERROR'
        ) {
          return files
        } else if (selectedFile.progress === 'PENDING') {
          newProgress = Math.min(increment, 100)
        } else {
          newProgress = Math.min(selectedFile.progress + increment, 100)
        }
        if (newProgress >= 100) {
          newProgress = 'COMPLETE'
        }
      }

      return files.map((f) =>
        f.key === key ? { ...selectedFile, progress: newProgress } : f,
      )
    })
  }

  const uploadImage = async (
    file: File,
    key: string,
    options?: {
      maxSize?: number
      quality?: number
      format?: 'webp' | 'jpeg' | 'jpg' | 'png'
      onUploadProgress?: AxiosRequestConfig<FormData>['onUploadProgress']
      onError?: () => void
    },
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileS3Key', key)
    formData.append('options', JSON.stringify(options))

    await axios
      .post('/api/image', formData, {
        onUploadProgress: options?.onUploadProgress ?? undefined,
      })
      .catch((error) => {
        console.error('Error uploading image:', error)
        if (options?.onError) {
          options.onError()
        }
      })
  }

  const processForm: SubmitHandler<Inputs> = async ({
    name,
    slug,
    type,
    eventLogo,
    date,
    publishedAt,
    organizations,
    photos,
    coverKey,
  }) => {
    setIsLoading(true)

    console.log({
      name,
      slug,
      type,
      eventLogo,
      date,
      publishedAt,
      organizations,
      photos,
      coverKey,
    })

    setIsLoading(false)

    // upload das imagens no s3
    await Promise.all([
      ...photos.map(async (photo) => {
        await Promise.all([
          // uploadImage original
          uploadImage(
            photo.file,
            `${s3Paths.folders.event}/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${slug}/original/${photo.key}`,
            {
              quality: 100,
              format: imageTypesToExtension[photo.file.type],
              onUploadProgress: (progressEvent) => {
                let progress = 0
                if (progressEvent.progress) {
                  progress = progressEvent.progress * 100
                } else if (progressEvent.total && progressEvent.loaded) {
                  progress = (progressEvent.loaded / progressEvent.total) * 100
                }
                updateProgress(photo.file.name, progress / 3)
              },
              onError: () => {
                updateProgress(photo.file.name, 'ERROR')
              },
            },
          ),
          // uploadImage miniature
          uploadImage(
            photo.file,
            `${s3Paths.folders.event}/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${slug}/miniature/${photo.key}`,
            {
              maxSize: 512,
              quality: 80,
              onUploadProgress: (progressEvent) => {
                let progress = 0
                if (progressEvent.progress) {
                  progress = progressEvent.progress * 100
                } else if (progressEvent.total && progressEvent.loaded) {
                  progress = (progressEvent.loaded / progressEvent.total) * 100
                }
                updateProgress(photo.file.name, progress / 3)
              },
              onError: () => {
                updateProgress(photo.file.name, 'ERROR')
              },
            },
          ),
          // uploadImage thumbnail
          uploadImage(
            photo.file,
            `${s3Paths.folders.event}/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${slug}/thumbnail/${photo.key}`,
            {
              maxSize: 128,
              quality: 60,
              onUploadProgress: (progressEvent) => {
                let progress = 0
                if (progressEvent.progress) {
                  progress = progressEvent.progress * 100
                } else if (progressEvent.total && progressEvent.loaded) {
                  progress = (progressEvent.loaded / progressEvent.total) * 100
                }
                updateProgress(photo.file.name, progress / 3)
              },
              onError: () => {
                updateProgress(photo.file.name, 'ERROR')
              },
            },
          ),
        ])
      }),
      uploadImage(
        eventLogo,
        `${s3Paths.folders.event}/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${slug}/logo.webp`,
        {
          format: 'webp',
          quality: 100,
        },
      ),
    ])

    // amazon rekognition

    // se todas estiverem ok, criar as fotos no prisma e vincular com o evento
    // criar evento no prisma
    const event = await createPrismaEvent({
      coverFileName: coverKey,
      date,
      name,
      slug,
      type,
      createdByUser: {
        connect: {
          id: user?.id,
        },
      },
      organizationsOnEvents: {
        createMany: {
          data: organizations.map((org) => ({
            organizationId: org.id,
          })),
        },
      },
      photographers: {
        create: {
          photographer: {
            connect: {
              id: 'cma4mtjgc0000thfoy9ngaxsm',
            },
          },
        },
      },
    })

    // criar as fotos no prisma
    const photosOnPrisma = await createPrismaPhotos({
      data: photos.map((photo) => ({
        file: photo.file,
        fileS3Path: `${s3Paths.folders.event}/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${slug}`,
        originalName: photo.file.name,
      })),
      eventId: event.id,
      uploadedByUserId: user?.id,
    })

    console.log('event created', event)
    console.log('photos created', photosOnPrisma)
  }

  type FieldName = keyof Inputs

  const next = async () => {
    const fields = steps[currentStep].fields
    const output = await form.trigger(fields as FieldName[], {
      shouldFocus: true,
    })

    if (!output) return

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      await form.handleSubmit(processForm)()
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const stepsRender = () => [
    <>
      {/* name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do evento</FormLabel>
            <FormControl>
              <Input
                {...field}
                className="w-full"
                onChange={(e) => {
                  field.onChange(e)
                  form.setValue('slug', createSlug(e.target.value))
                }}
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
            <FormLabel>Slug do evento</FormLabel>
            <FormControl>
              <Input {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* type */}
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem className="flex w-full max-w-xl flex-col px-8">
            <FormLabel>Tipo de evento</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="party" id="party" />
                  </FormControl>
                  <FormLabel>Festa</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem value="event" id="event" />
                  </FormControl>
                  <FormLabel>Evento</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* eventLogo */}
      <FormField
        control={form.control}
        name="eventLogo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo do evento</FormLabel>
            <FormControl>
              <SingleImageDropzone
                width={200}
                height={200}
                value={file}
                onChange={(file) => {
                  field.onChange(file)
                  setFile(file)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* date */}
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => {
          return (
            <FormItem className="flex w-full max-w-xl flex-col px-8">
              <FormLabel>Insira a data que ocorreu o evento</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, 'dd/MM/yyyy')
                      ) : (
                        <span>Escolha a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />

      {/* publishedAt */}
      <FormField
        control={form.control}
        name="publishedAt"
        render={({ field }) => {
          return (
            <FormItem className="flex w-full max-w-xl flex-col px-8">
              <FormLabel>O evento já foi publicado?</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, 'dd/MM/yyyy')
                      ) : (
                        <span>Escolha a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />

      {/* organizations */}
      <FormField
        control={form.control}
        name="organizations"
        render={({ field }) => {
          return (
            <FormItem className="flex flex-col">
              <FormLabel>Organizações</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn('flex w-[200px] justify-between')}
                    >
                      <p
                        className={cn('flex-1 text-start', {
                          'text-muted-foreground': field.value.length === 0,
                          truncate: field.value.length > 0,
                        })}
                      >
                        {field.value.length > 0
                          ? field.value.map((org) => org.name).join(', ')
                          : 'Selecione uma ou mais'}
                      </p>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Escolha a(s) organização(s)..."
                      value={organizationName}
                      onValueChange={setOrganizationName}
                    />
                    <CommandList>
                      <CommandEmpty>
                        Nenhuma organização encontrada.
                      </CommandEmpty>
                      {field.value.length > 0 && (
                        <CommandGroup>
                          {field.value.map((organization, idx) => {
                            return (
                              <CommandItem
                                className="cursor-pointer"
                                value={organization.name}
                                key={idx}
                                onSelect={() => {
                                  form.setValue(
                                    'organizations',
                                    field.value.filter(
                                      (org) => org.name !== organization.name,
                                    ),
                                  )
                                }}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                {organization.name}
                                {organization.logoUrl && (
                                  <Image
                                    src={organization.logoUrl}
                                    className="ml-2 h-4 w-4"
                                    alt={organization.name}
                                    width={16}
                                    height={16}
                                  />
                                )}
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      )}
                      {field.value.length > 0 &&
                        field.value.length < organizations.length && (
                          <CommandSeparator />
                        )}
                      {field.value.length < organizations.length && (
                        <CommandGroup>
                          {organizations
                            .filter(
                              (organization) =>
                                !field.value
                                  .map((org) => org.name)
                                  .includes(organization.name),
                            )
                            .map((organization, idx) => {
                              return (
                                <CommandItem
                                  className="cursor-pointer"
                                  value={organization.name}
                                  key={idx}
                                  onSelect={() => {
                                    form.setValue(
                                      'organizations',
                                      [
                                        ...field.value,
                                        {
                                          ...organization,
                                          eventLogo:
                                            organization.logoUrl ?? null,
                                        },
                                      ].sort((a, b) =>
                                        a.name.localeCompare(b.name),
                                      ),
                                    )
                                  }}
                                >
                                  <div className="mr-2 h-4 w-4" />
                                  {organization.name}
                                  {organization.logoUrl && (
                                    <Image
                                      src={organization.logoUrl}
                                      className="ml-2 h-4 w-4"
                                      alt={organization.name}
                                      width={16}
                                      height={16}
                                    />
                                  )}
                                </CommandItem>
                              )
                            })}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                  <Dialog
                    open={dialogOpen}
                    onOpenChange={(open) => setDialogOpen(open)}
                  >
                    {organizationName !== '' && (
                      <>
                        <Separator />
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full cursor-pointer justify-start rounded-none text-left"
                          >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            {organizationName}
                          </Button>
                        </DialogTrigger>
                      </>
                    )}
                    {dialogOpen && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Criar uma nova Organização</DialogTitle>
                          <DialogDescription>
                            Adicione uma nova organização à lista de
                            organizações.
                          </DialogDescription>
                        </DialogHeader>
                        <NewOrganization
                          setOrganizationName={setOrganizationName}
                          organizationName={organizationName}
                          setOrganizations={setOrganizations}
                          setDialogOpen={setDialogOpen}
                        />
                      </DialogContent>
                    )}
                  </Dialog>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </>,
    <>
      {/* photos */}
      <FormField
        control={form.control}
        name="photos"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col px-8">
            <FormLabel>Fotos do evento</FormLabel>
            <FormControl>
              <MultiImageDropzone
                {...field}
                value={filesStates}
                onChange={(files) => {
                  field.onChange(
                    files.map((file) => ({
                      file: file.file,
                      key: file.key,
                    })),
                  )
                  setFilesStates(files)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>,
    <>
      {/* coverKey */}
      <FormField
        control={form.control}
        name="coverKey"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col px-8">
            <FormLabel>Escolha a imagem de capa</FormLabel>
            <FormControl>
              <PhotoAlbum
                photos={filesStates.map((file) => ({
                  height: 256,
                  width: 384,
                  title: file.file.name,
                  alt: file.file.name,
                  key: file.key,
                  src: URL.createObjectURL(file.file),
                }))}
                onClick={({ photo }) => {
                  if (field.value === photo.key) {
                    field.onChange('')
                  } else {
                    field.onChange(photo.key)
                  }
                }}
                layout="masonry"
                renderPhoto={({ photo, imageProps }) => (
                  <div
                    onClick={imageProps.onClick}
                    className="relative mb-2 flex cursor-pointer items-center overflow-hidden rounded-lg last:mb-0"
                  >
                    <Image
                      className={cn('h-full object-contain', {
                        'saturate-0':
                          field.value !== '' && field.value !== photo.key,
                      })}
                      src={photo.src}
                      alt={photo.alt}
                      width={384}
                      height={0}
                    />
                    {field.value === photo.key && (
                      <div className="absolute right-2 top-2 flex items-center justify-center rounded-lg bg-zinc-400/50 p-2">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>,
    <>
      <div className="flex gap-8">
        <div
          className="relative flex aspect-square h-full flex-col items-center justify-center gap-3 rounded-md border bg-muted p-3"
          style={{
            borderImage: `conic-gradient(hsl(var(--primary)) ${(
              (filesStates
                .map((f) => {
                  if (f.progress === 'COMPLETE') {
                    return 1
                  } else if (
                    f.progress === 'ERROR' ||
                    f.progress === 'PENDING'
                  ) {
                    return 0
                  } else {
                    return f.progress / 100
                  }
                })
                .reduce((acc, value) => acc + value, 0) *
                100) /
              filesStates.length
            ).toFixed(2)}%, transparent 0) 2`,
          }}
        >
          <span>
            {filesStates
              .filter((f) => f.progress === 'COMPLETE')
              .length.toString()}
            /{filesStates.length.toString()} imagens enviadas
          </span>
          <UploadCloudIcon className="h-8 w-8" />
          <span>
            {(
              (filesStates
                .map((f) => {
                  if (f.progress === 'COMPLETE') {
                    return 1
                  } else if (
                    f.progress === 'ERROR' ||
                    f.progress === 'PENDING'
                  ) {
                    return 0
                  } else {
                    return f.progress / 100
                  }
                })
                .reduce((acc, value) => acc + value, 0) *
                100) /
              filesStates.length
            ).toFixed(2)}
            %
          </span>
        </div>
        <div className="relative flex aspect-square h-full flex-col items-center justify-center gap-3 rounded-md border bg-muted p-3">
          <span>Evento criado</span>
        </div>
        <div className="relative flex aspect-square h-full flex-col items-center justify-center gap-3 rounded-md border bg-muted p-3">
          <span>Reconhecimento facial</span>
        </div>
        <div className="relative flex aspect-square h-full flex-col items-center justify-center gap-3 rounded-md border bg-muted p-3">
          <span>Comparação de rostos</span>
        </div>
      </div>
    </>,
  ]

  return (
    <section className="flex w-full flex-col justify-between p-24">
      {/* steps */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-primary transition-colors ">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-primary">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex w-full flex-col border-l-4 border-gray-500 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-gray-500 transition-colors">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium text-gray-300">
                    {step.name}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <Form {...form}>
        <form
          className="mt-12 flex flex-1 flex-col items-center justify-center gap-6 py-12"
          onSubmit={form.handleSubmit(processForm)}
        >
          <h2 className="text-base font-semibold leading-7 text-gray-100">
            {steps[currentStep].name}
          </h2>

          {stepsRender().map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex w-full flex-1 flex-col items-center justify-center gap-6',
                {
                  hidden: currentStep !== index,
                },
              )}
            >
              {step}
            </div>
          ))}
        </form>
      </Form>

      {/* Navigation */}
      <div className="mt-8 pt-5">
        <div className="flex justify-between">
          <Button
            className="h-10 w-10 p-0"
            variant="outline"
            onClick={prev}
            disabled={currentStep === 0}
          >
            <ChevronLeftIcon size={32} />
          </Button>
          <Button
            className="h-10 w-10 p-0"
            variant="outline"
            onClick={next}
            disabled={isLoading}
          >
            <ChevronRightIcon size={32} />
          </Button>
        </div>
      </div>
    </section>
  )
}
