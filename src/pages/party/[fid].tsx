import { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

interface PageProps {
    images: ImageProps[]
}

interface ImageProps {
    name: string,
    img_id: string
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const {fid} = context.params
    const res = await fetch('https://script.google.com/macros/s/AKfycbz-CRLaRXTcJkbUF2jW4kj8zMT99nyM6qGxyHsEolexa3AAk7zCqB6c2s3uMpmWiN64cA/exec?fid=' + fid)
    const imgList = await res.json()
    
    return {props: {images: imgList.data}}
}

export default function Page({images}: ImageProps[]) {
  return (
    <div className='flex flex-row flex-wrap gap-5 max-w-screen'>
        {images?.length === 0 ? (
            <div>Loading...</div>
        ) : (
            images?.map((img, idx) => {
                return (
                    <img
                        src={`https://drive.google.com/uc?id=${img.img_id}`}
                        alt="Image."
                        width={200}
                        height={150}
                    />
                )
            })
        )}
    </div>
  )
  
}