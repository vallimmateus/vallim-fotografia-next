"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

function Header() {
  const { status, data } = useSession();

  const handleLoginCLick = async () => {
    await signIn();
  };

  const handleLogoutClick = async () => {
    await signOut();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex w-screen flex-row items-center justify-center bg-zinc-950 shadow-lg shadow-black transition-all",
        // {
        //   "h-20": clientWindowHeight <= 50,
        //   "h-14": clientWindowHeight > 50,
        // },
      )}
    >
      <div className="grid w-full max-w-screen-xl grid-cols-3 items-center p-4 max-xl:px-10">
        <div>
          <Link href="/">
            <Image
              src="/vallim-fotografia.svg"
              alt="Vallim Fotografia logo"
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto max-h-16 w-auto"
            />
          </Link>
        </div>
        <div className="flex justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/parties">
                  <NavigationMenuTrigger>
                    Festas Universitárias
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <ul>
                      <li>Festa 1</li>
                      <li>Festa 2</li>
                      <li>Festa 3</li>
                      <li>Festa 4</li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex justify-end">
          {status === "unauthenticated" && (
            <Button
              className="justify-center gap-2"
              variant="outline"
              onClick={handleLoginCLick}
            >
              <LogInIcon size={16} />
              Fazer Login
            </Button>
          )}
          {status === "authenticated" && data.user && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {data.user.name?.[0].toUpperCase()}
                  </AvatarFallback>
                  {data.user.image && <AvatarImage src={data.user.image} />}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <div className="text-sm font-medium leading-none">
                      {data.user.name}
                      {/* trocar por nickmane vindo do prisma */}
                    </div>
                    <div className="text-xs leading-none text-muted-foreground">
                      {data.user.email}
                      {/* trocar pelo email vindo do prisma */}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogoutClick}>
                  <LogOutIcon size={16} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };
