import { GetServerSideProps, NextPage } from 'next'
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

interface PageProps {
    images: ImageProps[]
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


export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const fid = context.params?.fid
    const res = await fetch('https://script.google.com/macros/s/AKfycbz-CRLaRXTcJkbUF2jW4kj8zMT99nyM6qGxyHsEolexa3AAk7zCqB6c2s3uMpmWiN64cA/exec?fid=' + fid)
    
    const data: DataGoogleProps = await res.json()
    const imgList = data.data.sort((a, b) => (a.name > b.name) ? 1 : -1).map(item => {return {src: `https://drive.google.com/uc?id=${item.img_id}`, width: 1620, height: 1080, alt: item.name}})
    return {props: {images: imgList}}
}

export default function Page({images}: PageProps) {
    const [index, setIndex] = useState(-1)
  return (
  <>
    <PhotoAlbum
        photos={images}
        layout='rows'
        targetRowHeight={150}
        onClick={({ index }) => setIndex(index)}
        renderPhoto={({ photo, wrapperStyle, renderDefaultPhoto }) => (
            <div className='rounded-md overflow-hidden border-2 border-zinc-900' style={wrapperStyle}>
                {renderDefaultPhoto({ wrapped: true })}
            </div>
        )}
    />
    <Lightbox
        toolbar={{
            buttons: [
              <button key="my-button" type="button" className="yarl__button">
                Button
              </button>,
              "close",
            ],
        }}
        slides={images}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slideshow={{delay: 2500}}
        // enable optional lightbox plugins
        plugins={[Fullscreen, Download, Counter, Slideshow, Thumbnails, Zoom]}
    />
  </>
  )
  
}