import { prismaClient } from "@/lib/prisma";
import { LastEvents } from "./components/last-events";
import { Event } from "@prisma/client";
import { LastEvent } from "./components/last-event";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  const parties = await prismaClient.event.findMany({
    take: 3,
    orderBy: {
      publishDate: "desc",
    },
    where: {
      type: "party",
    },
  });
  const event = (await prismaClient.event.findFirst({
    where: {
      type: "event",
    },
    orderBy: {
      publishDate: "desc",
    },
  })) as Event;
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col items-center justify-center gap-8 py-12">
        <h1 className="border-b-[1px] pb-2 text-5xl font-bold">
          Últimas festas
        </h1>
        <LastEvents events={parties} />
      </div>
      <div className="flex w-full justify-center bg-[url('/square_background.svg')] bg-cover bg-no-repeat">
        <div className="flex h-96 w-full max-w-6xl items-center justify-between max-md:flex-col max-md:gap-2 max-md:pb-4">
          <div className="flex min-w-max flex-col gap-3">
            <h1 className="text-center text-5xl font-bold">Último evento</h1>
            <div className="flex w-full items-center justify-end gap-2 max-md:justify-center">
              <p className="text-zinc-300">{event.name}</p>
              <p className="text-sm text-muted-foreground">
                {format(event.date, "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          <div className="mx-4 flex w-full max-md:max-w-sm max-md:justify-center md:h-4/5 md:justify-end">
            <LastEvent event={event} />
          </div>
        </div>
      </div>
      <div className="flex h-52 w-full justify-center bg-[#070708]">
        <div className="flex w-full max-w-6xl flex-col justify-center gap-5 px-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">
              Sou um organizador de um evento
            </h2>
            <p className="text-zinc-400">
              Quero entrar em contato para realizar um orçamento.
            </p>
          </div>
          <Link href="https://wa.me/5512982193267?text=Ol%C3%A1%2C%20Vallim%2C%20tudo%20bem%3F%20Gostaria%20de%20fazer%20um%20or%C3%A7amento%20de%20fotografia%20para%20um%20evento%20com%20voc%C3%AA">
            <Image
              src="/WhatsAppButtonGreenMedium.svg"
              alt="Ícone do WhatsApp"
              width={189}
              height={40}
            />
            {/* WhatsApp */}
          </Link>
          {/* </Button> */}
        </div>
      </div>
    </div>
  );
}
