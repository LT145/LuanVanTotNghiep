import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const { orderId, status } = await req.json();

  // 👉 Cập nhật trạng thái đơn
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === "COMPLETED" ? { deliveredAt: new Date() } : {}),
    },
  });

  // 👉 Nếu giao thành công → tăng soldCount
  if (status === "COMPLETED") {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
      select: { productId: true, quantity: true },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          soldCount: { increment: item.quantity }, // 💥 tăng theo số lượng
        },
      });
    }
  }

  // 👉 Ghi lịch sử
  await prisma.orderHistory.create({
    data: {
      orderId,
      status,
      note:
        status === "SHIPPING"
          ? "Shipper nhận hàng"
          : status === "COMPLETED"
          ? "Shipper đã giao thành công"
          : "",
    },
  });

  return NextResponse.json({ success: true });
}
