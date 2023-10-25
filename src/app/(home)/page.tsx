import Head from "next/head";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import LastParties from "@/components/LastThreeParties";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <Head>
        <title>Vallim Fotografia</title>
        <meta property="og:title" content="Vallim Fotografia" />
        <meta
          property="og:description"
          content="Site para divulgação de todas as fotos tiradas em eventos."
        />
        <meta property="og:image" content="/logo_square.jpg" />
      </Head>
      <main className="flex h-[calc(100vh-80px)] flex-col">
        <div className="flex w-screen flex-1 flex-col items-center justify-center bg-zinc-950 py-10">
          <h2 className="mb-4 max-w-fit text-5xl font-bold">Últimas festas</h2>
          <Separator className="max-w-lg" />
          {/* <LastParties parties={parties} /> */}
          <Button variant="secondary" className="w-72 max-md:mt-3">
            <Link href="/parties">Ver mais</Link>
          </Button>
        </div>
      </main>
    </>
  );
}