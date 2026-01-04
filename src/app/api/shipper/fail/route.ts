import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { orderId, reason } = await req.json();

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "SHIPPINGFAILED" },
  });

  await prisma.orderHistory.create({
    data: {
      orderId,
      status: "SHIPPINGFAILED",
      note: reason,
    },
  });

  return NextResponse.json({ success: true });
}
