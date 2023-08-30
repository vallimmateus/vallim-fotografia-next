import Image, { ImageLoaderProps } from 'next/image'
import Link from 'next/link'
import { useState } from 'react';
import ContentLoader from "react-content-loader";
import { tv } from 'tailwind-variants';

interface PartyCardProps {
    id: string,
    cover: string,
    date: string,
    name: string,
    publishDate: string | null,
    priority?: boolean
}

const card = tv({
    base: "",
    variants: {
        isPublished: {
            default: ""
        }
    }
})

const imageLoader = ({ src }: ImageLoaderProps) => {
    return `https://drive.google.com/uc?id=${src}`
}

export default function PartyCard({id, date, cover, name, publishDate, priority = false }: PartyCardProps) {
    const isPublished = !!publishDate
    const [isNew, setIsNew] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    if (!!publishDate) {
        const publishTime = new Date(publishDate)
        const today = new Date()
        const diffDates = (today.getTime() - publishTime.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDates < 8) {
            setIsNew(true)
        }
    }
    return (
        <div className='aspect-[10/9] w-1/4 min-w-[250px] px-4 pb-3'>
            <Link className='relative group' href={isPublished ? `/party/${id}` : ""}>
                {(!isPublished && !isLoading) && <p className='absolute z-50 -top-2 -right-2 bg-slate-700 px-3 py-2 shadow-lg group-hover:-top-3 group-hover:-right-3 transition-all rounded-md'>Em breve</p>}
                {(isNew && !isLoading) && <p className='absolute z-50 -top-2 -right-2 bg-purple-800 px-3 py-2 shadow-lg group-hover:-top-3 group-hover:-right-3 transition-all rounded-md'>Novo!</p>}
                <div className="border-2 overflow-hidden border-black bg-zinc-950 rounded-lg flex flex-col hover:shadow-zinc-800 hover:shadow-lg transition-all">
                    <div className='w-full overflow-hidden group-hover:brightness-95 transition-all relative'>
                        {isLoading ? <ContentLoader viewBox="0 0 420 280" backgroundColor='rgb(63, 63, 70)' foregroundColor='rgb(39, 39, 42)' style={{position: "absolute", zIndex: 1}} >
                            <rect x="0" y="0" width="420" height="280" />
                        </ContentLoader> : ""}
                        <Image
                            loader={imageLoader}
                            src={cover}
                            alt={`Cover image for party ${name}.`}
                            width={420}
                            height={280}
                            priority={priority}
                            className={(!isPublished ? "blur-md " : "") + (isLoading && "opacity-0")}
                            onLoad={() => {setIsLoading(false)}}
                        />
                    </div>
                    <div className="flex flex-col my-3 mx-5">
                        {isLoading
                        ? <ContentLoader width={120} viewBox="0 0 120 24" backgroundColor='rgb(63, 63, 70)' foregroundColor='rgb(39, 39, 42)' >
                            <rect x="0" y="4" width="120" height="16" />
                        </ContentLoader>
                        : <p className="font-bold text-base text-zinc-200 group-hover:text-white group-hover:pl-0.5 transition-all">{name}</p>}
                        {isLoading
                        ? <ContentLoader width={68} viewBox="0 0 68 16" backgroundColor='rgb(63, 63, 70)' foregroundColor='rgb(39, 39, 42)' >
                            <rect x="0" y="2" width="68" height="12" />
                        </ContentLoader>
                        : <p className="text-xs text-zinc-400 group-hover:pl-1 transition-all">{date}</p>}
                    </div>
                </div>
            </Link>
        </div>
    )
}