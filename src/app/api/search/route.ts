// /app/api/search/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (!q) {
      return NextResponse.json({ success: true, data: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" }, isActive: true },
          { keywords: { has: q.toLowerCase() }, isActive: true }
        ], isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          where: { isMain: true },
          take: 1
        }
      },
      take: 6,
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json({ success: false, data: [] });
  }
}
