import type { GetStaticProps } from 'next';
import PhotoAlbum from "react-photo-album";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Download from "yet-another-react-lightbox/plugins/download";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { useState } from 'react';
import NextJsImage from '@/components/NextJsImage';

interface PageProps {
    images: {src: string}[],
    thumbnails: ImageProps[],
    title: string
}

interface ImageProps {
    src: string,
    width: number,
    height: number,
    alt: string
}
interface DataGoogleProps {
    status: string;
    data: {
        name: string;
        img_id: string;
    }[];
    pages: number;
}

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
    const fid = context.params?.fid
    const res = await fetch('https://script.google.com/macros/s/AKfycbz-CRLaRXTcJkbUF2jW4kj8zMT99nyM6qGxyHsEolexa3AAk7zCqB6c2s3uMpmWiN64cA/exec?fid=' + fid)
    
    const data: DataGoogleProps = await res.json()
    const imgList = data.data.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item) => {return {src: `https://drive.google.com/uc?id=${item.img_id}`}})
    const thumbList = data.data.sort((a, b) => (a.name > b.name) ? 1 : -1).map((item) => {return {src: `https://drive.google.com/thumbnail?id=${item.img_id}`, width: 220, height: 147, alt: item.name}})
    return {props: {images: imgList, thumbnails: thumbList, title: "Título"}, revalidte: 300}
}

export default function Page({images, thumbnails, title}: PageProps) {
    const [index, setIndex] = useState(-1)
  return (
  <div className="px-10 py-8">
    <h1 className='text-2xl font-bold pl-10'>{title}</h1>
    <PhotoAlbum
        photos={thumbnails}
        layout='rows'
        onClick={({ index }) => setIndex(index)}
        targetRowHeight={147}
        renderPhoto={NextJsImage}
    />
    <Lightbox
        slides={images}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slideshow={{delay: 2500}}
        // enable optional lightbox plugins
        plugins={[Fullscreen, Download, Counter, Slideshow, Thumbnails, Zoom]}
    />
  </div>
  )
  
}