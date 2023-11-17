import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const {
    id,
    deletedPhotosIds,
    date,
  }: { id: string; deletedPhotosIds?: string[]; date: Date } = await req.json();
  try {
    if (deletedPhotosIds) {
      await prismaClient.photo.deleteMany({
        where: {
          id: {
            in: deletedPhotosIds,
          },
        },
      });
    }
    if (!req.headers.get("user-email")) throw "Usuário não autenticado";
    await prismaClient.event.update({
      where: {
        id: id,
      },
      data: {
        publishDate: date,
        validateBy: {
          connect: { email: req.headers.get("user-email")! },
        },
      },
    });
    return NextResponse.json(
      { message: "Evento validado com sucesso!" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 });
  }
}
