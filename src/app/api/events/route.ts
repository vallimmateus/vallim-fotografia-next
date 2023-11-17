import { prismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const type = req.headers.get("type");
  const quantity = req.headers.get("quantity");
  try {
    const eventData = await prismaClient.event.findMany({
      where: {
        type: type!,
      },
      orderBy: {
        date: "desc",
      },
      take: parseInt(quantity!),
    });
    return NextResponse.json(
      { eventData, message: "success" },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 });
  }
}
