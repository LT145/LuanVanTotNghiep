import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RevenueQuery = {
  month: number;
  revenue: number | null;
  orders: number;
};

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();

    // Lấy tất cả đơn completed trong năm
    const orders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`)
        }
      },
      select: {
        totalAmount: true,
        createdAt: true
      }
    });

    // Initialize result for 12 months
    const result = Array.from({ length: 12 }, (_, i) => ({
      month: `Th${i + 1}`,
      revenue: 0,
      orders: 0
    }));

    // Loop orders và cộng theo tháng
    for (const ord of orders) {
      const month = ord.createdAt.getMonth(); // 0 ~ 11
      result[month].revenue += ord.totalAmount;
      result[month].orders += 1;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

