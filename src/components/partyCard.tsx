// import Image from 'next/image'
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
            <a className="w-80 border-2 border-zinc-900 rounded-lg overflow-hidden flex flex-col hover:shadow-zinc-950 hover:shadow-lg hover:brightness-90 transition-all">
                <img
                    src={`https://drive.google.com/uc?id=${cover}`}
                    alt={`Cover image for party ${name}.`}
                    width={320}
                    height={240}
                    className={isNew ? "blur-md" : ""}
                />
                <div className="flex flex-col my-3 mx-5">
                    <p className="font-bold text-base">{name}</p>
                    <p className="text-sm">{date}</p>
                </div>
            </a>
        </Link>
    )
}