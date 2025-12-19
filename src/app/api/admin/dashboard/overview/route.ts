import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Tổng doanh thu từ các đơn COMPLETED
    const completedOrders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      select: { totalAmount: true },
    });

    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );

    // Đếm số sản phẩm
    const productCount = await prisma.product.count();

    // Đếm số đơn
    const orderCount = await prisma.order.count();

    // Đếm số user
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      data: {
        revenue: totalRevenue,
        productCount,
        orderCount,
        userCount,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
