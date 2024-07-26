'use client'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import EventCard from '@/components/ui/event-card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { imageLoader } from '@/lib/imageLoader'
import { cn } from '@/lib/utils'

import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, TrashIcon } from 'lucide-react'
import * as z from 'zod'

export const formSchema = z.object({
  name: z.string(),
  type: z.union([
    z.literal('party'),
    z.literal('event'),
    z.literal('personal'),
  ]),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  organization: z.array(
    z.object({ value: z.string(), logoUrl: z.string().optional() }),
  ),
  coverUrl: z.string(),
  slug: z.string(),
  fid: z.array(
    z.object({
      value: z.string().length(33, 'O fid não contem 33 caracteres.'),
    }),
  ),
  date: z.date(),
  publishDate: z.date().optional(),
  createdAt: z.date(),
  validateByUserEmail: z.string().email().optional(),
})

export default function FormEvent() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'party',
      organization: [{ value: '' }],
      fid: [{ value: '' }],
      createdAt: new Date(Date.now()),
    },
  })

  const router = useRouter()
  const [openModal, setOpenModal] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [fid, setFid] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const {
    fields: fieldsOrganization,
    append: appendOrganization,
    remove: removeOrganization,
  } = useFieldArray({
    name: 'organization',
    control: form.control,
  })

  const {
    fields: fieldsFid,
    append: appendFid,
    remove: removeFid,
  } = useFieldArray({
    name: 'fid',
    control: form.control,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    await axios
      .post('/api/register-event', { ...values })
      .then(() => {
        setOpenModal(true)
        revalidatePath(
          `event/${values.date.getFullYear().toString()}/${values.slug}`,
          'page',
        )
        revalidatePath(
          `event/${values.date.getFullYear().toString()}/${
            values.slug
          }/validation`,
          'page',
        )
        revalidatePath(`category/${values.type}`, 'page')
        revalidatePath('/')
      })
      .catch(() => {
        alert('Ocorreu um erro ao criar o evento.')
      })
      .finally(() => {
        setLoading(false)
      })
  }
  return (
    <div className="flex w-full justify-center">
      <div className="flex items-center justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col items-center justify-center gap-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex w-full max-w-xl flex-col px-8">
                  <FormLabel>Nome do evento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira o nome do evento"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur()
                        form.setValue(
                          'slug',
                          e.target.value.toLowerCase().replaceAll(' ', '-'),
                        )
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="personal" id="personal" />
                        </FormControl>
                        <FormLabel>Pessoal</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={() => (
                <FormItem className="flex w-full max-w-xl flex-col px-8">
                  <FormLabel>Nome da(s) organização(s)</FormLabel>
                  <FormDescription>
                    Insira o nome de uma ou mais organizações.
                  </FormDescription>
                  <div className="flex w-full flex-col items-center gap-2">
                    {fieldsOrganization.map((field, index) => (
                      <div
                        className="flex w-full items-center gap-2"
                        key={index}
                      >
                        <FormField
                          control={form.control}
                          key={index}
                          name={`organization.${index}.value`}
                          render={({ field }) => (
                            <FormControl className="flex-1">
                              <Input
                                placeholder="Insira o nome da organização."
                                {...field}
                              />
                            </FormControl>
                          )}
                        />
                        <FormField
                          control={form.control}
                          key={index}
                          name={`organization.${index}.logoUrl`}
                          render={({ field }) => (
                            <FormControl className="flex-1">
                              <Input
                                placeholder="Insira um link válido para ser usado de logo da organização."
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  setFid((prev) => [
                                    ...prev.slice(0, index),
                                    e.target.value,
                                    ...prev.slice(index + 1),
                                  ])
                                }}
                              />
                            </FormControl>
                          )}
                        />
                        <div
                          className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'h-28 w-28 p-2',
                          )}
                        >
                          {fid[index] && fid[index].length > 0 && (
                            <Image
                              loader={imageLoader}
                              alt=""
                              src={fid[index]}
                              width={96}
                              height={96}
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-500 hover:text-white"
                          onClick={() => removeOrganization(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => appendOrganization({ value: '' })}
            >
              Adicionar organização
            </Button>
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem className="flex w-full max-w-xl flex-col px-8">
                  <FormLabel>Link da foto de cover</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira um link válido para ser usado de cover"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="flex w-full max-w-xl flex-col px-8">
                  <FormLabel>Crie um slug para ser utilizado na URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insira um slug sem espaços ou caracteres especiais"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full max-w-xl flex-col px-8">
              {fieldsFid.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`fid.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(index !== 0 && 'sr-only')}>
                        Fid
                      </FormLabel>
                      <FormDescription className={cn(index !== 0 && 'sr-only')}>
                        Insira o(s) fid(s) da(s) pasta(s) onde estão armazenadas
                        todas as fotos
                      </FormDescription>
                      <div className="flex w-full items-center gap-2">
                        <FormControl className="flex-1">
                          <Input {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-500 hover:text-white"
                          onClick={() => removeFid(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => appendFid({ value: '' })}
              >
                Adicionar organização
              </Button>
            </div>
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
                              <span>Pick a date</span>
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
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="w-full">
                <AccordionTrigger className="w-full">
                  Dados opcionais
                </AccordionTrigger>
                <AccordionContent className="flex w-full flex-col gap-6">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem className="flex w-full max-w-xl flex-col px-8">
                        <FormLabel>URL da logo do evento</FormLabel>
                        <div className="flex w-full items-center gap-2">
                          <FormControl className="flex-1">
                            <Input
                              placeholder="Insira um link válido para ser usado de logo"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setLogoUrl(e.target.value)
                              }}
                            />
                          </FormControl>
                          <div
                            className={cn(
                              buttonVariants({ variant: 'outline' }),
                              'h-9 w-28 p-2',
                            )}
                          >
                            {logoUrl && logoUrl.length > 0 && (
                              <Image
                                loader={imageLoader}
                                alt=""
                                src={logoUrl}
                                width={96}
                                height={96}
                                className="h-full min-w-[96px]"
                              />
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="publishDate"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex w-full max-w-xl flex-col px-8">
                          <FormLabel>
                            Insira a data que o evento foi publicado
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
                                    <span>Pick a date</span>
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
                  <FormField
                    control={form.control}
                    name="validateByUserEmail"
                    render={({ field }) => (
                      <FormItem className="flex w-full max-w-xl flex-col px-8">
                        <FormLabel>
                          Email do responsável pela validação
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </form>
        </Form>
        <AlertDialog open={openModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                O banco de dados da festa e todas as fotos foram criados!
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setOpenModal(false)
                  router.push(
                    `/event/${form.getValues().date.getFullYear().toString()}/${
                      form.getValues().slug
                    }`,
                  )
                }}
              >
                Acessar a página
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => {
                  setOpenModal(false)
                  setLogoUrl('')
                  setFid([])
                  form.reset()
                }}
              >
                Criar outro evento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="items-start"></div>
      <EventCard
        date={
          form.getValues('date') && format(form.getValues('date'), 'dd/MM/yyyy')
        }
        name={form.getValues('name')}
        cover={form.getValues('coverUrl')}
        logo={form.getValues('organization').map((org) => org.logoUrl || '')}
      />
    </div>
  )
}
