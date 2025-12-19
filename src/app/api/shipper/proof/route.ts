import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId, imageUrl } = await req.json();

    if (!orderId || !imageUrl) {
      return NextResponse.json(
        { success: false, message: "Thiếu orderId hoặc imageUrl" },
        { status: 400 }
      );
    }

    // Lấy order hiện tại
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Xác định trạng thái thanh toán mới
    let newPaymentStatus = order.paymentStatus;

    // Nếu thanh toán COD → khi giao thành công = PAID
    if (order.paymentMethod === "COD") {
      newPaymentStatus = "PAID";
    }

    // Nếu thanh toán online → giữ nguyên PAID
    // (Không cần check vì nếu FAILED thì không tạo đơn)

    // 1️⃣ Ghi lịch sử giao hàng
    await prisma.orderHistory.create({
      data: {
        orderId,
        status: "COMPLETED",
        imageUrl,
        note: "Shipper đã xác nhận giao hàng và gửi minh chứng",
      },
    });

    // 2️⃣ Cập nhật bản ghi order
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        deliveredAt: new Date(),
        paymentStatus: newPaymentStatus,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("❌ ERROR /shipper/proof:", error);
    return NextResponse.json(
      { success: false, message: "Server error khi lưu minh chứng" },
      { status: 500 }
    );
  }
}
