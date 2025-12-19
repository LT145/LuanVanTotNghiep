import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
const prisma = new PrismaClient()

// 🧠 Giả lập userId (thực tế nên lấy từ session NextAuth)



// ============================
// 📦 GET - Lấy danh sách địa chỉ
// ============================
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ items: [] })
    const userId = session.user.id
    const addresses = await prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })
    return NextResponse.json({ success: true, addresses })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Lỗi lấy địa chỉ" }, { status: 500 })
  }
}

// ============================
// ➕ POST - Thêm địa chỉ mới
// ============================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ items: [] })
    const userId = session.user.id
    const body = await req.json()
    const { label, recipientName, recipientPhone, address, province, ward, district, isDefault } = body

    if (!recipientName || !recipientPhone || !address) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin cần thiết" }, { status: 400 })
    }

    // Nếu là địa chỉ mặc định -> reset các địa chỉ khác
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        userId,
        label: label || "Địa chỉ mới",
        recipientName,
        recipientPhone,
        address,
        province,
        ward,
        isDefault: !!isDefault,
      },
    })

    return NextResponse.json({ success: true, address: newAddress })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Không thêm được địa chỉ" }, { status: 500 })
  }
}

// ============================
// ✏️ PATCH - Cập nhật địa chỉ
// ============================
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ items: [] })
    const userId = session.user.id
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ success: false, message: "Thiếu ID" }, { status: 400 })

    // Nếu cập nhật thành mặc định -> reset các khác
    if (data.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    const updated = await prisma.userAddress.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, address: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Cập nhật thất bại" }, { status: 500 })
  }
}

// ============================
// ❌ DELETE - Xóa địa chỉ
// ============================
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ success: false, message: "Thiếu ID" }, { status: 400 })

    await prisma.userAddress.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Xóa thất bại" }, { status: 500 })
  }
}
