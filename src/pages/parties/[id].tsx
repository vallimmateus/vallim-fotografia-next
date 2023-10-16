import React, { useEffect, useState } from 'react'
import PhotoAlbum from 'react-photo-album'
import { Lightbox } from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Share from 'yet-another-react-lightbox/plugins/share'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Download from 'yet-another-react-lightbox/plugins/download'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/counter.css'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'

import Head from 'next/head.js'
import { InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { PhotosOfPartyContext } from '@/features/PartyProps/contexts/context'
import { db } from '@/lib/db.js'

import NextJsImage from '@/components/NextJsImage'
import { imageLoader } from '@/lib/imageLoader'
import Comments from '@/components/Comments'
import { GlobalProps } from '@/features/GlobalProps/GlobalProps'
import { MultiFid, Party, Photo, PhotoFS } from '@/types'
import { transformToNext } from '@/components/Comments/utils'

interface ImageProps {
  src: string
  width: number
  height: number
  alt: string
}
interface SectionProps {
  images: { src: string }[]
  thumbnails: ImageProps[]
  title: string
}

interface DataGoogleProps {
  status: string
  data: {
    name: string
    img_id: string
  }[]
  pages: number
}

export async function getStaticPaths() {
  const partiesCol = collection(db, 'parties')
  const partySnapshot = await getDocs(partiesCol)
  const pathsList = partySnapshot.docs.map((doc) => {
    return { params: { id: doc.id } }
  })
  return {
    paths: pathsList,
    fallback: 'blocking',
  }
}

export const getStaticProps = GlobalProps.getStaticProps(async (context) => {
  const id = context.params?.id as string
  const partiesRef = doc(db, 'parties', id)
  const docSnap = await getDoc(partiesRef)
  const docData = docSnap.data() as Party

  if (!docData) {
    return {
      notFound: true,
    }
  }

  const props: SectionProps[] = []
  let fids: MultiFid[]
  if (typeof docData.fid === 'string') {
    fids = [
      {
        fid: docData.fid,
        name: docData.name,
      },
    ]
  } else {
    fids = docData.fid
  }
  for (const fidObj of fids) {
    const res = await fetch(
      'https://script.google.com/macros/s/AKfycbz-CRLaRXTcJkbUF2jW4kj8zMT99nyM6qGxyHsEolexa3AAk7zCqB6c2s3uMpmWiN64cA/exec?fid=' +
        fidObj.fid,
    )
    const data: DataGoogleProps = await res.json()
    const imgList = data.data
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .map((item) => {
        return { src: `https://drive.google.com/uc?id=${item.img_id}` }
      })
    const thumbList = data.data
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .map((item) => {
        return {
          src: `https://drive.google.com/thumbnail?id=${item.img_id}`,
          width: 220,
          height: 147,
          alt: item.name,
        }
      })

    props.push({ images: imgList, thumbnails: thumbList, title: fidObj.name })
  }

  return {
    props: {
      sections: props,
      party: docData,
    },
  }
})

interface PageProps extends InferGetStaticPropsType<typeof getStaticProps> {
  sections: SectionProps[]
  party: Party
}

export default function Page({ sections, party }: PageProps) {
  const { cover, name, date } = party
  const title = name
  const [index, setIndex] = useState(-1)

  const { asPath } = useRouter()

  const [photosInfo, setPhotosInfo] = useState<Photo[]>([])

  useEffect(() => {
    const collectionRef = collection(db, 'photos')
    const q = query(
      collectionRef,
      where('ref', '==', doc(db, 'parties', asPath.split('parties/')[1])),
    )
    onSnapshot(q, (snap) => {
      const photos = snap.docs.map(
        (doc) => transformToNext(doc.data() as PhotoFS, doc.id).data,
      )
      if (photos !== photosInfo && photos.length > 0) {
        setPhotosInfo(photos)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PhotosOfPartyContext.Provider value={photosInfo}>
      <Head>
        <title>{`${title} | Vallim Fotografia`}</title>
        <meta property="og:title" content={`${title} | Vallim Fotografia`} />
        <meta
          property="og:description"
          content={`Fotos da festa ${title} de ${date}`}
        />
        <meta
          property="og:image"
          content={imageLoader({ src: cover, width: 300, quality: 100 })}
        />
      </Head>
      {sections.map(({ images, thumbnails, title }, idx) => {
        return (
          <div key={idx}>
            {images.length > 0 && (
              <div className="px-10 py-8">
                <h1 className="mb-6 ml-4 max-w-fit border-b-[1px] px-6 pb-2 text-5xl font-bold">
                  {title}
                </h1>
                <PhotoAlbum
                  photos={thumbnails}
                  layout="rows"
                  onClick={({ index }) => setIndex(index)}
                  targetRowHeight={147}
                  renderPhoto={NextJsImage}
                />
                <Lightbox
                  slides={images.map((image) => ({
                    ...image,
                    download: `${image.src}&export=download`,
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
                  comments={{ photosList: photosInfo }}
                  // enable optional lightbox plugins
                  plugins={[
                    Share,
                    Download,
                    Fullscreen,
                    Counter,
                    Comments,
                    Slideshow,
                    Thumbnails,
                    Zoom,
                  ]}
                  carousel={{
                    finite: true,
                  }}
                  controller={{
                    closeOnBackdropClick: true,
                    closeOnPullDown: true,
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </PhotosOfPartyContext.Provider>
  )
}
