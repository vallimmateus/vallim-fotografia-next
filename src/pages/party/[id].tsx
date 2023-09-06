import { useState } from 'react'
import { GetStaticProps } from 'next'
import PhotoAlbum from 'react-photo-album'
import { Lightbox } from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Download from 'yet-another-react-lightbox/plugins/download'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/counter.css'

import { collection, doc, getDoc, getDocs } from 'firebase/firestore/lite'

import Head from 'next/head.js'
import { db } from '../../lib/db.js'

import NextJsImage from '@/components/NextJsImage'

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

interface PageProps {
  sections: SectionProps[]
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

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
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
      title: docData.name,
    },
    revalidate: 60 * 60 * 24,
  }
}

export default function Page({ sections, title }: PageProps) {
  const [index, setIndex] = useState(-1)
  return (
    <>
      <Head>
        <title>{title} | Vallim Fotografia</title>
      </Head>
      {sections.map(({ images, thumbnails, title }) => {
        return (
          <>
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
                  slides={images}
                  open={index >= 0}
                  index={index}
                  close={() => setIndex(-1)}
                  slideshow={{ delay: 2500 }}
                  // enable optional lightbox plugins
                  plugins={[
                    Fullscreen,
                    Download,
                    Counter,
                    Slideshow,
                    Thumbnails,
                    Zoom,
                  ]}
                  carousel={{
                    finite: true,
                  }}
                />
              </div>
            )}
          </>
        )
      })}
    </>
  )
}
