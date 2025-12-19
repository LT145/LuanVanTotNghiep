import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 🔍 Lấy cài đặt đầu tiên (vì chỉ có 1 bản ghi StoreSetting)
    const store = await prisma.storeSetting.findFirst({
      select: {
        address: true,
        latitude: true,
        longitude: true,
        enableExpress: true,
        expressRatePerKm: true,
        normalShippingFee: true,
        maxExpressDistanceKm: true,
        enableFreeShipByTotal: true,
        enableFreeShipByQuantity: true,
        freeShipMinTotal: true,
        freeShipMinQuantity: true,
      },
    })

    if (!store) {
      return NextResponse.json(
        { error: "Chưa có cấu hình cửa hàng trong cơ sở dữ liệu." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      store,
    })
  } catch (error) {
    console.error("❌ Lỗi lấy thông tin cửa hàng:", error)
    return NextResponse.json(
      { error: "Lỗi máy chủ khi lấy thông tin cửa hàng." },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
