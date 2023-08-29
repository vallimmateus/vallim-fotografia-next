import Image from 'next/image'
import Link from 'next/link'

interface PartyCardProps {
    id: string,
    cover: string,
    date: string,
    name: string,
    isNew: boolean
}

export default function PartyCard({id, date, cover, name, isNew}: PartyCardProps) {
    return (
        <Link href={!isNew ? `/party/${id}` : ""}>
            <div className="w-[300px] border-2 border-zinc-950 bg-zinc-950 rounded-lg overflow-hidden flex flex-col hover:shadow-zinc-800 hover:shadow-lg hover:brightness-90 transition-all">
                <div className='w-[300px] h-[200px] overflow-hidden'>
                    <Image
                        src={`https://drive.google.com/uc?id=${cover}`}
                        // placeholder={`https://drive.google.com/thumbnail?id=${cover}`}
                        alt={`Cover image for party ${name}.`}
                        width={300}
                        height={200}
                        className={isNew ? "blur-md" : ""}
                    />
                </div>
                <div className="flex flex-col my-3 mx-5">
                    <p className="font-bold text-base">{name}</p>
                    <p className="text-sm">{date}</p>
                </div>
            </div>
        </Link>
    )
}