'use client'
import { Event as EventPC, Photo as PhotoPC } from '@prisma/client'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { RenderPhotoProps } from 'react-photo-album'
import PhotoAlbum, { Photo as PhotoRPA } from 'react-photo-album'

import { ChevronUpIcon, Copy, Trash2Icon, Undo2Icon } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/plugins/counter.css'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

import { DialogClose } from '@radix-ui/react-dialog'
import axios from 'axios'
import { format } from 'date-fns'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import EventCard from '@/components/ui/event-card'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type AlbumProps = {
  thumbnails: PhotoRPA[]
  photos: PhotoPC[]
  event: EventPC
}

export default function Album({ event, photos, thumbnails }: AlbumProps) {
  const router = useRouter()
  const { status, data } = useSession()

  const searchParams = useSearchParams()
  const photoNumber = Number(searchParams.get('photo'))
  const [index, setIndex] = useState(photoNumber || -1)
  const [deletedPhotos, setDeletedPhotos] = useState<PhotoRPA[]>([])
  const [openModal, setOpenModal] = useState(false)
  const { slug, year }: { year: string; slug: string } = useParams()

  async function onSubmit() {
    await axios
      .post(
        '/api/validate-event',
        {
          id: event.id,
          deletedPhotosIds: deletedPhotos.map((photo) => photo.key),
          date: new Date(),
        },
        {
          headers: {
            'user-email': data?.user?.email,
          },
        },
      )
      .then(() => setOpenModal(true))
  }
  if (status === 'unauthenticated') {
    return (
      <div>
        <AlertDialog defaultOpen={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Você precisa fazer login para validar o evento!
              </AlertDialogTitle>
              <AlertDialogDescription>
                Por favor, faça o login com a sua conta Google para continuar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => signIn}>
                Login
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }
  return (
    <div>
      <AlertDialog defaultOpen={true}>
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Esta é uma página somente para validação das fotos!
              </AlertDialogTitle>
            </AlertDialogHeader>
            <h3 className="text-lg">Olá, {data?.user?.name} 👋</h3>
            <p>
              Te enviei este link para que{' '}
              <span className="font-semibold italic">somente você</span> possa
              verificar foto por foto e validar o evento{' '}
              <span className="font-bold">{event.name}</span>. Caso note alguma
              foto que contenha algum problema, clique no ícone de lixeira para
              deletá-la. Se não houver nenhum problema, clique em{' '}
              <span className="font-semibold">Validar</span> no canto inferior
              da página para continuar.
            </p>
            {event.type === 'party' && (
              <p className="text-sm text-zinc-300">
                Problemas comuns que você pode encontrar:
                <ul className="list-disc pl-8">
                  <li>Pessoas se beijando.</li>
                  <li>Pessoas passando mal.</li>
                  <li>Pessoas caindo.</li>
                  <li>Pessoas não conseguindo posar para a foto.</li>
                </ul>
                Preste muita atenção também nos fundos das fotos!
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>

          <div className="overflow-y-scroll px-10 py-8">
            <div className="mb-6 ml-4 flex flex-col gap-2">
              <Input
                className="h-fit w-full max-w-4xl px-6 py-2 text-5xl font-bold"
                defaultValue={event.name}
              />
              <Textarea
                className="w-full max-w-3xl"
                placeholder="Caso deseje, você pode incluir uma descrição para o evento."
              />
            </div>
            <PhotoAlbum
              photos={thumbnails}
              layout="rows"
              targetRowHeight={250}
              onClick={({ index }) => setIndex(index)}
              renderPhoto={({
                photo,
                imageProps: { alt, title, sizes, className, onClick },
                wrapperStyle,
              }: RenderPhotoProps) => {
                return (
                  <div
                    className="relative aspect-[3/2] overflow-hidden rounded"
                    style={{ ...wrapperStyle }}
                  >
                    <button
                      onClick={() => {
                        if (
                          deletedPhotos.some((photoKey) => photoKey === photo)
                        ) {
                          setDeletedPhotos((prev) =>
                            prev.filter((photoKey) => photoKey !== photo),
                          )
                        } else {
                          setDeletedPhotos((prev) => [...prev, photo])
                        }
                      }}
                      className={cn(
                        'absolute right-1 top-1 z-20 cursor-pointer rounded-full bg-gray-800 p-2 transition-all hover:bg-red-700',
                        {
                          'hover:bg-green-700': deletedPhotos.some(
                            (photoKey) => photoKey === photo,
                          ),
                        },
                      )}
                    >
                      {deletedPhotos.some((photoKey) => photoKey === photo) ? (
                        <Undo2Icon size={20} />
                      ) : (
                        <Trash2Icon size={20} />
                      )}
                    </button>
                    <div
                      className={cn(
                        'absolute left-0 top-0 z-10 h-full w-full bg-transparent mix-blend-overlay transition-all',
                        {
                          'bg-red-500': deletedPhotos.some(
                            (photoKey) => photoKey === photo,
                          ),
                        },
                      )}
                      onClick={onClick}
                    />
                    <Image
                      fill
                      src={photo}
                      unoptimized={true}
                      loading="lazy"
                      placeholder={'blurDataURL' in photo ? 'blur' : undefined}
                      className={cn(className, 'rounded transition-all', {
                        'border-4 border-red-500 saturate-0':
                          deletedPhotos.some((photoKey) => photoKey === photo),
                      })}
                      {...{ alt, title, sizes, onClick }}
                    />
                  </div>
                )
              }}
            />
            <Lightbox
              slides={photos.map((photo, idx) => ({
                src: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}`,
                download: `https://lh4.googleusercontent.com/d/${photo.imageUrlId}`,
                alt: photo.name,
                share: {
                  url: `https://www.vallimfotografia.com.br/event/${year}/${slug}?photo=${idx}`,
                  title: event.name,
                  text: `Olha essa foto do evento ${event.name}`,
                },
              }))}
              on={{
                view: ({ index }) => {
                  setIndex(index)
                },
              }}
              open={index >= 0}
              index={index}
              close={() => setIndex(-1)}
              slideshow={{ delay: 2500 }}
              toolbar={{
                buttons: [
                  <button
                    className={cn('yarl__button rounded hover:bg-red-700/50', {
                      'hover:bg-green-700/50': deletedPhotos.some(
                        (photoKey) => photoKey === thumbnails[index],
                      ),
                    })}
                    key="delete"
                    onClick={() => {
                      if (
                        deletedPhotos.some(
                          (photoKey) => photoKey === thumbnails[index],
                        )
                      ) {
                        setDeletedPhotos((prev) =>
                          prev.filter(
                            (photoKey) => photoKey !== thumbnails[index],
                          ),
                        )
                      } else {
                        setDeletedPhotos((prev) => [...prev, thumbnails[index]])
                      }
                    }}
                  >
                    {deletedPhotos.some(
                      (photoKey) => photoKey === thumbnails[index],
                    ) ? (
                      <Undo2Icon size={20} />
                    ) : (
                      <Trash2Icon size={20} />
                    )}
                  </button>,
                  'fullscreen',
                  'zoom',
                  'close',
                ],
              }}
              plugins={[Fullscreen, Counter, Thumbnails, Zoom]}
              carousel={{
                finite: true,
              }}
              controller={{
                closeOnBackdropClick: true,
                closeOnPullDown: true,
              }}
            />
          </div>
          <Sheet>
            <div className="sticky bottom-0 z-30 flex w-screen justify-center">
              <SheetTrigger asChild>
                <button className="flex flex-col items-center rounded-t-full bg-zinc-700 p-2 text-sm font-bold text-white transition-all hover:bg-green-700">
                  <ChevronUpIcon size={20} />
                  <span>Validar</span>
                </button>
              </SheetTrigger>
            </div>
            <SheetContent side="bottom" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>
                  {deletedPhotos.length === 0
                    ? 'Tem certeza que não deseja deletar nenhuma foto?'
                    : 'Fotos que serão deletadas'}
                </SheetTitle>
                <SheetDescription>
                  {deletedPhotos.length === 0
                    ? "Caso note alguma foto que contenha algum problema, clique no ícone de lixeira para deletá-la. Se não houver nenhum problema, clique em 'Salvar' para continuar."
                    : "Todas estas fotos serão deletadas. Clique em 'Salvar' para confirmar."}
                </SheetDescription>
              </SheetHeader>
              {deletedPhotos.length > 0 && (
                <ScrollArea className="h-24 whitespace-nowrap">
                  <div className="flex h-24 w-max space-x-4">
                    {deletedPhotos.map((photo, idx) => (
                      <div className="relative h-full" key={idx}>
                        <button
                          onClick={() =>
                            setDeletedPhotos((prev) =>
                              prev.filter((photoKey) => photoKey !== photo),
                            )
                          }
                          className="absolute right-1 top-1 z-20 cursor-pointer rounded-full bg-gray-800 p-2 transition-all hover:bg-green-700"
                        >
                          <Undo2Icon size={12} />
                        </button>
                        <Image
                          unoptimized={true}
                          key={photo.key}
                          src={photo.src}
                          alt={photo.alt || ''}
                          height={96}
                          width={144}
                          className="aspect-[3/2] h-full rounded object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
              <SheetFooter>
                <DialogTrigger asChild>
                  <Button onClick={onSubmit}>Enviar</Button>
                </DialogTrigger>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Evento validado com sucesso!</DialogTitle>
              <DialogDescription>
                Você pode copiar o link abaixo e utilizá-lo para divulgação do
                evento.
              </DialogDescription>
            </DialogHeader>
            <div className="flex w-full flex-col items-center space-y-4">
              <EventCard
                cover={event.coverUrl}
                date={format(event.date, 'dd/MM/yyyy')}
                name={event.name}
              />
              <TooltipProvider>
                <Tooltip delayDuration={500}>
                  <TooltipTrigger>
                    <Button
                      type="submit"
                      size="default"
                      className="w-full justify-between px-3"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://www.vallimfotografia.com.br/event/${year}/${slug}`,
                        )
                      }}
                    >
                      {`https://www.vallimfotografia.com.br/event/${year}/${slug}`}
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card-foreground text-card">
                    Copiar link!
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  onClick={() => {
                    router.push(`/event/${year}/${slug}`)
                  }}
                >
                  Acessar página
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AlertDialog>
    </div>
  )
}
