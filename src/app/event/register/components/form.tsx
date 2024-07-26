'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Image from 'next/image'

import { Organization } from '@prisma/client'
import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import Resizer from 'react-image-file-resizer'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Check,
  ChevronsUpDown,
  PlusIcon,
} from 'lucide-react'

import { SingleImageDropzone } from '@/components/ui/single-image-dropzone'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
  DialogFooter,
  DialogClose,
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
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import axios from 'axios'
import { revalidateTag } from 'next/cache'
import { loaderR2 } from '@/lib/imageLoader'
import { FileState } from '@/components/ui/multi-image-dropzone'

export const FormDataSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string({ required_error: 'Nome é obrigatório' }),
  slug: z.string({ required_error: 'Slug é obrigatório' }),
  type: z.union([z.literal('party'), z.literal('event')]),
  coverFileName: z.string({ required_error: 'Imagem de capa é obrigatória' }),
  logoFileName: z.string().optional(),
  date: z.date({ required_error: 'Data é obrigatória' }),
  publishedAt: z.date().optional(),
  organizations: z.array(
    z.object({ name: z.string(), logoFileName: z.string().or(z.null()) }),
    { required_error: 'Inclua pelo menos uma organização' },
  ),
  photos: z.array(z.object({ file: z.string(), key: z.string().optional() }), {
    required_error: 'Fotos são obrigatórias',
  }),
  createdAt: z.date().optional(),
})

type Inputs = z.infer<typeof FormDataSchema>

const steps = [
  {
    id: 'Step 1',
    name: 'Informações do evento',
    fields: [
      'id',
      'name',
      'slug',
      'type',
      'date',
      'publishedAt',
      'organizations',
      'createdAt',
    ],
  },
  {
    id: 'Step 2',
    name: 'Fotos',
    fields: ['photos', 'coverFileName'],
  },
  {
    id: 'Step 3',
    name: 'Finalizar',
  },
]

const hoursInSeconds = 0 // 60 ** 2

function createSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-zA-Z0-9 ]/g, '')
    .replaceAll(' ', '-')
}

export function FormEvent({
  initialOrganizations = [],
}: {
  initialOrganizations: Organization[]
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations)
  const [file, setFile] = useState<File>()
  const [organizationName, setOrganizationName] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      type: 'party',
      organizations: [],
      photos: [],
      createdAt: new Date(),
    },
  })

  const processForm: SubmitHandler<Inputs> = (data) => {
    form.reset()
  }

  type FieldName = keyof Inputs

  const next = async () => {
    const fields = steps[currentStep].fields
    const output = await form.trigger(fields as FieldName[], {
      shouldFocus: true,
    })

    if (!output) return

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await form.handleSubmit(processForm)()
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <section className="flex w-full flex-col justify-between p-24">
        {/* steps */}
        <nav aria-label="Progress">
          <ol
            role="list"
            className="space-y-4 md:flex md:space-x-8 md:space-y-0"
          >
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
            {currentStep === 0 && (
              <>
                <h2 className="text-base font-semibold leading-7 text-gray-100">
                  {steps[currentStep].name}
                </h2>

                {/* id */}
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Id do evento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={() => {
                            field.onBlur()
                            form.trigger('id')
                          }}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            createSlug(e.target.value)
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

                {/* logoFileName */}
                <FormField
                  control={form.control}
                  name="logoFileName"
                  render={() => (
                    <FormItem>
                      <FormLabel>Logo do evento</FormLabel>
                      <FormControl>
                        <SingleImageDropzone
                          width={200}
                          height={200}
                          value={file}
                          onChange={(file) => {
                            setFile(file)
                            // TODO: form.setValue('logoFileName', file_path) criar um método para pegar o nome da pasta e arquivo
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
                        <FormLabel>
                          Insira a data que ocorreu o evento
                        </FormLabel>
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
                                    'text-muted-foreground':
                                      field.value.length === 0,
                                    truncate: field.value.length > 0,
                                  })}
                                >
                                  {field.value.length > 0
                                    ? field.value
                                        .map((org) => org.name)
                                        .join(', ')
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
                                    {field.value.map(
                                      async (organization, idx) => {
                                        const responseMiniature = await fetch(
                                          `${baseUrl}/api/get-signed-url?${new URLSearchParams(
                                            {
                                              photo:
                                                'logos/organizations/' +
                                                organization.logoFileName?.split(
                                                  '.',
                                                )[0] +
                                                '.miniature.webp',
                                            },
                                          )}`,
                                          {
                                            method: 'GET',
                                            next: {
                                              revalidate: 2 * hoursInSeconds,
                                            },
                                          },
                                        )
                                        const urlMiniature: {
                                          signedUrl: string
                                          message: string
                                        } = await responseMiniature.json()
                                        return (
                                          <CommandItem
                                            className="cursor-pointer"
                                            value={organization.name}
                                            key={idx}
                                            onSelect={() => {
                                              form.setValue(
                                                'organizations',
                                                field.value.filter(
                                                  (org) =>
                                                    org.name !==
                                                    organization.name,
                                                ),
                                              )
                                            }}
                                          >
                                            <Check className="mr-2 h-4 w-4" />
                                            {organization.name}
                                            <Image
                                              unoptimized
                                              src={urlMiniature.signedUrl}
                                              className="ml-2 h-4 w-4"
                                              alt={organization.name}
                                              width={16}
                                              height={16}
                                            />
                                          </CommandItem>
                                        )
                                      },
                                    )}
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
                                      .map(async (organization, idx) => {
                                        const responseMiniature = await fetch(
                                          `${baseUrl}/api/get-signed-url?${new URLSearchParams(
                                            {
                                              photo:
                                                'logos/organizations/' +
                                                organization.logoFileName?.split(
                                                  '.',
                                                )[0] +
                                                '.miniature.webp',
                                            },
                                          )}`,
                                          {
                                            method: 'GET',
                                            next: {
                                              revalidate: 2 * hoursInSeconds,
                                            },
                                          },
                                        )
                                        const urlMiniature: {
                                          signedUrl: string
                                          message: string
                                        } = await responseMiniature.json()
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
                                                    logoFileName:
                                                      organization.logoFileName ??
                                                      null,
                                                  },
                                                ].sort((a, b) =>
                                                  a.name.localeCompare(b.name),
                                                ),
                                              )
                                            }}
                                          >
                                            <div className="mr-2 h-4 w-4" />
                                            {organization.name}
                                            <Image
                                              unoptimized
                                              src={urlMiniature.signedUrl}
                                              className="ml-2 h-4 w-4"
                                              alt={organization.name}
                                              width={16}
                                              height={16}
                                            />
                                          </CommandItem>
                                        )
                                      })}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
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
                              <NewOrganization
                                setOrganizationName={setOrganizationName}
                                organizationName={organizationName}
                                setOrganizations={setOrganizations}
                                setDialogOpen={setDialogOpen}
                              />
                            )}
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </>
            )}
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
              disabled={currentStep === steps.length - 1}
            >
              <ChevronRightIcon size={32} />
            </Button>
          </div>
        </div>
      </section>
    </Dialog>
  )
}

const MB_BYTES = 1024 ** 2
const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const FormOrganizationScheama = z.object({
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

type InputsOrganization = z.infer<typeof FormOrganizationScheama>

const resizeImage = (
  file: File,
  maxSize: number,
  suffix: string | undefined = undefined,
): Promise<File> =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      maxSize,
      maxSize,
      'webp',
      75,
      0,
      (uri) => {
        if (suffix) {
          uri = uri as File
          const newFile = new File(
            [uri],
            `${file.name.split('.')[0]}.${suffix}.webp`,
            {
              lastModified: Date.now(),
              type: uri.type,
            },
          )
          resolve(newFile)
        } else {
          resolve(uri as File)
        }
      },
      'file',
    )
  })

type UploadFileState = FileState & {
  total: number
}

function NewOrganization({
  organizationName,
  setOrganizationName,
  setOrganizations,
  setDialogOpen,
}: {
  organizationName: string
  setOrganizationName: (name: string) => void
  setOrganizations: Dispatch<SetStateAction<Organization[]>>
  setDialogOpen: Dispatch<SetStateAction<boolean>>
}) {
  const [progressUpload, setProgressUpload] = useState<UploadFileState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newOrganization, setNewOrganization] = useState<Organization>()

  const form = useForm<InputsOrganization>({
    resolver: zodResolver(FormOrganizationScheama),
    defaultValues: {
      name: organizationName,
      slug: createSlug(organizationName),
    },
  })

  const processForm: SubmitHandler<InputsOrganization> = async ({
    image,
    name,
    slug,
  }) => {
    setIsLoading(true)
    // criar organização no prisma
    const organization = await axios
      .post('/api/organization', {
        name,
        slug,
        logoFileName: image.name.split('.')[0] + '.webp',
      })
      .then((res) => res.data.data.organization as Organization)

    // colocar o setOrganizations no final de todo o processForm
    setNewOrganization(organization)
    // setOrganizations((organizations) => [...organizations, organization])

    // transformar imagem em 3 versões
    const original = await resizeImage(image, 1080)
    const miniature = await resizeImage(image, 512, 'miniature')
    const thumbnail = await resizeImage(image, 128, 'thumbnail')

    // criar urls assinadas para as 3 versões
    const signedOriginalImageUrl = await axios
      .post('/api/get-signed-url', {
        path: 'logos/organizations/' + original.name,
        contentType: original.type,
      })
      .then((res) => res.data.data.signedUrl as string)
    const signedMiniatureImageUrl = await axios
      .post('/api/get-signed-url', {
        path: 'logos/organizations/' + miniature.name,
        contentType: miniature.type,
      })
      .then((res) => res.data.data.signedUrl as string)
    const signedThumbnailImageUrl = await axios
      .post('/api/get-signed-url', {
        path: 'logos/organizations/' + thumbnail.name,
        contentType: thumbnail.type,
      })
      .then((res) => res.data.data.signedUrl as string)

    const filesToUpload: UploadFileState[] = [
      {
        file: original,
        key: original.name,
        total: original.size,
        progress: 'PENDING',
      },
      {
        file: miniature,
        key: miniature.name,
        total: miniature.size,
        progress: 'PENDING',
      },
      {
        file: thumbnail,
        key: thumbnail.name,
        total: thumbnail.size,
        progress: 'PENDING',
      },
    ]

    setProgressUpload(filesToUpload)

    // fazer upload das 3 versões de imagens
    await Promise.all([
      axios.put(signedOriginalImageUrl, original, {
        headers: {
          'Content-Type': original.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            let progress: FileState['progress']
            if (progressEvent.loaded === progressEvent.total) {
              progress = 'COMPLETE'
            } else if (progressEvent.loaded < progressEvent.total) {
              progress = progressEvent.loaded
            } else {
              progress = 'ERROR'
            }
            setProgressUpload((files) => {
              const newFilesStates = structuredClone(files)
              const fileState = newFilesStates.find(
                (fileState) => fileState.key === original.name,
              )
              if (fileState) {
                fileState.progress = progress
              }
              return newFilesStates
            })
          }
        },
      }),
      axios.put(signedMiniatureImageUrl, miniature, {
        headers: {
          'Content-Type': miniature.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            let progress: FileState['progress']
            if (progressEvent.loaded === progressEvent.total) {
              progress = 'COMPLETE'
            } else if (progressEvent.loaded < progressEvent.total) {
              progress = progressEvent.loaded
            } else {
              progress = 'ERROR'
            }
            setProgressUpload((files) => {
              const newFilesStates = structuredClone(files)
              const fileState = newFilesStates.find(
                (fileState) => fileState.key === miniature.name,
              )
              if (fileState) {
                fileState.progress = progress
              }
              return newFilesStates
            })
          }
        },
      }),
      axios.put(signedThumbnailImageUrl, thumbnail, {
        headers: {
          'Content-Type': thumbnail.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            let progress: FileState['progress']
            if (progressEvent.loaded === progressEvent.total) {
              progress = 'COMPLETE'
            } else if (progressEvent.loaded < progressEvent.total) {
              progress = progressEvent.loaded
            } else {
              progress = 'ERROR'
            }
            setProgressUpload((files) => {
              const newFilesStates = structuredClone(files)
              const fileState = newFilesStates.find(
                (fileState) => fileState.key === thumbnail.name,
              )
              if (fileState) {
                fileState.progress = progress
              }
              return newFilesStates
            })
          }
        },
      }),
    ])
  }

  useEffect(() => {
    const progressString = progressUpload
      .map((file) => {
        if (file.progress === 'COMPLETE') {
          return 'COMPLETO'
        } else if (file.progress === 'ERROR') {
          return 'ERRO'
        } else {
          return `${file.progress}%`
        }
      })
      .every((progress) => progress === 'COMPLETO')
    if (progressString && newOrganization) {
      setIsLoading(!progressString)
      form.reset()
      setDialogOpen(false)
      setOrganizations((organizations) => [...organizations, newOrganization])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressUpload])

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Criar uma nova Organização</DialogTitle>
        <DialogDescription>
          Adicione uma nova organização à lista de organizações.
        </DialogDescription>
      </DialogHeader>
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
                        setOrganizationName(e.target.value)
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
                        if (file) {
                          field.onChange(file)
                        }
                      }}
                      // valu
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
    </DialogContent>
  )
}
