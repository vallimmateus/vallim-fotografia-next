import { InstagramIcon, GithubIcon } from "lucide-react";
import { Separator } from "./separator";
import { Button } from "./button";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex w-screen flex-col overflow-x-hidden bg-zinc-950 px-4">
      <div className="mx-auto flex w-full max-w-6xl py-3 max-md:flex-col max-md:gap-4">
        <div className="flex flex-1 flex-col">
          <Link href="/">
            <Image
              src="/vallim-fotografia.svg"
              alt="Vallim Fotografia logo"
              width={0}
              height={0}
              sizes="100vw"
              unoptimized
              className="h-auto max-h-16 w-auto"
            />
          </Link>
        </div>
        <div className="flex gap-12 max-md:flex-col max-md:gap-4">
          <div className="flex flex-col justify-start gap-1">
            <h3 className="font-bold">Fotos de eventos</h3>
            <Button className="w-fit" variant="link" asChild>
              <Link href="/category/party">Festas</Link>
            </Button>
            <Button className="w-fit" variant="link" asChild>
              <Link href="/category/event">Eventos</Link>
            </Button>
            <Button className="w-fit" variant="link" disabled>
              <Link href="/category/personal">Pessoais</Link>
            </Button>
          </div>
          <div className="flex flex-col justify-start gap-1">
            <h3 className="font-bold">Suporte</h3>
            <Button className="w-fit" variant="link" disabled>
              Suporte
            </Button>
            <Button className="w-fit" variant="link" disabled>
              Relatar um erro
            </Button>
            <Button className="w-fit" variant="link" disabled>
              Denunciar uma foto
            </Button>
            <Button className="w-fit" variant="link" disabled>
              Denunciar um comentário
            </Button>
          </div>
        </div>
      </div>
      <Separator orientation="horizontal" />
      <div className="flex items-center justify-between px-4 py-3 max-md:flex-col max-md:gap-3">
        <div className="flex flex-1 flex-wrap gap-1 max-md:gap-3">
          <Button variant="link" size="sm" asChild>
            <Link href="https://www.instagram.com/vallimmateus/">
              <InstagramIcon size={16} />
            </Link>
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link href="https://github.com/vallimmateus">
              <GithubIcon size={16} />
            </Link>
          </Button>
          <Button variant="link" className="text-sm" size="sm" disabled>
            Políticas de Privaciade
          </Button>
          <Button variant="link" className="text-sm" size="sm" disabled>
            Termos e Condições
          </Button>
          <Button variant="link" className="text-sm" size="sm" disabled>
            Suporte
          </Button>
        </div>
        <p className="text-xs text-muted">
          © Copyright {new Date().getFullYear()}. Todos os direitos reservaods.
        </p>
      </div>
    </footer>
  );
}
