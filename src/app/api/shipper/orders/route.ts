import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // statusParam là string: "PROCESSING" | "SHIPPING" | "COMPLETED"
    const statusParam = searchParams.get("status");

    if (!statusParam) {
      return NextResponse.json(
        { success: false, message: "Missing status param" },
        { status: 400 }
      );
    }

    // Convert string → enum Prisma
    const prismaStatus = OrderStatus[statusParam as keyof typeof OrderStatus];

    if (!prismaStatus) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        status: prismaStatus,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("SHIPPER FETCH ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
